/**
 * @module GameController
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Game controller that handles all game logic.
 *
 * @property {Canvas} canvas The Canvas instance used for rendering.
 * @property {Menu} mainMenu The Menu instance used for the main menu.
 * @property {Menu} pauseMenu The Menu instance used for the pause menu.
 * @property {Menu} continueMenu The Menu instance used for the continue menu.
 * @property {boolean} isGameInProgress Whether a game is currently in progress.
 * @property {boolean} isPaused Whether a game is currently paused.
 * @property {number} levelProgress The progress of the current level, number
 *     between 0 and 1.
 * @property {number} levelTime The duration for each level.
 */
function GameController() {
  EventEmitter.call(this);

  this.canvas = null;
  this.mainMenu = null;
  this.pauseMenu = null;
  this.continueMenu = null;

  this.isGameInProgress = false;
  this.isPaused = false;
  this.levelProgress = 0;
  this.levelTime = 60; // In seconds
}
inherit(GameController, EventEmitter);

/**
 * Initialize the whole game.
 */
GameController.prototype.initializeGame = function() {
  if (!this.canvas) {
    throw new Error('The game can\'t be initialized without a canvas.');
  }

  this.setupGameEvents();
  this.addMenus();
  this.setupKeyEvents();
  this.createTimer();

  if (this.mainMenu) {
    // Use a timer to let the font load
    var self = this;
    setTimeout(function() {
      self.mainMenu.show();
    }, 500);
  }
};

/**
 * Add menu objects to the canvas and attach event handlers.
 */
GameController.prototype.addMenus = function() {
  var self = this;

  if (this.mainMenu) {
    this.canvas.stage.addChild(this.mainMenu.canvasObject);
    this.mainMenu.on('click', function(event) {
      if (event.id === 'play') self.emit('action:start-new-game');
    });
    this.on('action:start-new-game', function() {
      this.mainMenu.hide(function() {
        self.emit('start-new-game');
      });
    });
  }

  if (this.pauseMenu) {
    this.canvas.stage.addChild(this.pauseMenu.canvasObject);
    this.pauseMenu.on('click', function(event) {
      if (event.id === 'resume') self.emit('action:resume-game');
    });
    this.on('pause-game', function() {
      this.pauseMenu.show();
    });
    this.on('action:resume-game', function() {
      this.pauseMenu.hide(function() {
        self.emit('resume-game');
      });
    });
  }

  if (this.continueMenu) {
    this.canvas.stage.addChild(this.continueMenu.canvasObject);
    this.continueMenu.on('click', function(event) {
      if (event.id === 'continue') self.emit('action:start-next-level');
    });
    this.on('action:start-next-level', function() {
      this.continueMenu.hide(function() {
        self.emit('start-next-level');
      });
    });
    this.on('stop-level', function() {
      this.continueMenu.show();
    });
  }
};

/**
 * Create the level timer and add some methods for the timer.
 */
GameController.prototype.createTimer = function() {
  var self = this;
  var startTime = null;
  var lastTime = null;
  var rafID;

  this.startTimer = function() {
    startTime = null;
    self.levelProgress = 0;
    rafID = requestAnimationFrame(timerTick);
  };
  this.stopTimer = function() {
    if (rafID) cancelAnimationFrame(rafID);
  };
  this.resumeTimer = function() {
    rafID = requestAnimationFrame(function(timestamp) {
      startTime += timestamp - lastTime;
      rafID = requestAnimationFrame(timerTick);
    });
  };
  this.resetTimer = function() {
    self.levelProgress = 0;
    if (self.dashboard) {
      self.dashboard.setTimerProgress(0);
    }
  };

  function timerTick(timestamp) {
    if (timestamp && !startTime) startTime = timestamp;
    lastTime = timestamp;
    var timeSince = timestamp - startTime;
    var progress = timeSince / (self.levelTime * 1000);

    rafID = requestAnimationFrame(timerTick);
    self.levelProgress = progress;

    if (self.dashboard) {
      self.dashboard.setTimerProgress(progress);
    }

    if (progress >= 1) {
      self.stopTimer();
      self.emit('stop-level');
    }
  }
};

/**
 * Set up key events for pause etc.
 */
GameController.prototype.setupKeyEvents = function() {
  var self = this;

  this.canvas.stage.bind('keydown', function(event) {

    // The 'p' key, for pause
    if (self.isGameInProgress && event.which === 80) {
      if (self.isPaused) {
        self.emit('action:resume-game');
      } else {
        self.emit('pause-game');
      }
    }
  });
};

/**
 * Set up events needed for the game flow.
 */
GameController.prototype.setupGameEvents = function() {
  var self = this;

  this.on('pause-game', function() {
    self.isPaused = true;
    self.stopTimer();
  });

  this.on('resume-game', function() {
    self.isPaused = false;
    self.resumeTimer();
  });

  this.on('start-new-game', function() {
    self.isGameInProgress = true;
    self.startTimer();
  });

  this.on('stop-level', function() {
    self.isGameInProgress = false;
  });

  this.on('action:start-next-level', function() {
    self.resetTimer();
    self.isGameInProgress = true;
  });

  this.on('start-next-level', function() {
    self.startTimer();
  });
};

module.exports = GameController;
