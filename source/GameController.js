/**
 * @module GameController
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Game controller that handles all game logic.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {module:Menu~Menu} mainMenu The Menu instance used for the main
 *     menu.
 * @property {module:Menu~Menu} pauseMenu The Menu instance used for the pause
 *     menu.
 * @property {module:Menu~Menu} continueMenu The Menu instance used for the
 *     continue menu.
 * @property {module:Dashboard~Dashboard} dashboard The dashboard.
 * @property {module:GameArea~GameArea} gameArea The game area.
 * @property {module:BlockController~BlockController} blockController The
 *     controller for all blocks.
 * @property {boolean} isGameInProgress Whether a game is currently in progress.
 * @property {boolean} isPaused Whether a game is currently paused.
 * @property {number} score The score of the player.
 * @property {number} level The current level.
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
  this.dashboard = null;
  this.gameArea = null;
  this.blockController = null;

  this.isGameInProgress = false;
  this.isPaused = false;
  this.score = 0;
  this.level = 1;
  this.levelProgress = 0;

  this.levelTime = 30; // In seconds
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
  this.addGameArea();
  this.addMenus();
  this.addDashboard();
  this.addBlockController();
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
 * Add dashboard and attach event handlers.
 */
GameController.prototype.addDashboard = function() {
  var self = this;

  if (this.dashboard) {
    this.canvas.stage.addChild(this.dashboard.canvasObject);
    this.on('start-new-game', function() {
      self.dashboard.setLevel(self.level);
      self.dashboard.setScore(self.score);
      self.dashboard.showPauseButton();
      self.dashboard.showInfo();
    });
    this.on('action:start-next-level', function() {
      self.dashboard.setLevel(self.level);
      self.dashboard.setScore(self.score);
    });
    this.dashboard.on('click-pause-resume', function() {
      if (!self.isGameInProgress) {
        self.emit('action:start-next-level');
      } else if (self.isPaused) {
        self.emit('action:resume-game');
      } else {
        self.emit('pause-game');
      }
    });
    this.on('pause-game', function() {
      self.dashboard.emit('pause-game');
    });
    this.on('stop-level', function() {
      self.dashboard.emit('stop-level');
    });
    this.on('action:start-next-level', function() {
      self.dashboard.emit('resume-game');
    });
    this.on('action:resume-game', function() {
      self.dashboard.emit('resume-game');
    });

    this.on('score-increase', function() {
      self.dashboard.setScore(self.score);
    });

    this.on('score-decrease', function() {
      self.dashboard.setScore(self.score);
    });
  }
};

/**
 * Add game area and attach event handlers.
 */
GameController.prototype.addGameArea = function() {
  var self = this;

  if (this.gameArea) {
    this.canvas.stage.addChild(this.gameArea.canvasObject);
    this.on('start-new-game', function() {
      self.gameArea.setDangerZoneSize(self.level / 2 + 0.5);
    });
    this.on('action:start-next-level', function() {
      self.gameArea.setDangerZoneSize(self.level / 2 + 0.5);
    });
    this.on('pause-game', function() {
      self.gameArea.fadeOut();
    });
    this.on('stop-level', function() {
      self.gameArea.fadeOut();
    });
    this.on('resume-game', function() {
      self.gameArea.fadeIn();
    });
    this.on('action:start-next-level', function() {
      self.gameArea.fadeIn();
    });
  }
};

/**
 * Add block controller and attach event handlers.
 */
GameController.prototype.addBlockController = function() {
  var self = this;

  if (this.blockController) {
    if (this.gameArea) {
      this.gameArea.blockArea.addChild(this.blockController.canvasObject);
    }
    this.on('start-new-game', function() {
      if (this.gameArea) {
        var position = this.gameArea.dangerZonePosition;
        this.blockController.setDangerZonePosition(position);
      }
      this.blockController.startGame();
    });
    this.on('start-next-level', function() {
      this.blockController.setLevel(self.level);
      if (self.gameArea) {
        var position = self.gameArea.dangerZonePosition;
        this.blockController.setDangerZonePosition(position);
      }
      this.blockController.startGame();
    });
    this.on('pause-game', function() {
      this.blockController.stopGame();
    });
    this.on('stop-level', function() {
      this.blockController.stopGame();
      this.blockController.endLevel();
    });
    this.on('resume-game', function() {
      this.blockController.startGame();
    });

    this.blockController.on('scoreblock-click', function() {
      self.emit('score-increase', {amount: 10});
    });
    this.blockController.on('dangerblock-click', function() {
      self.emit('score-decrease', {amount: 20});
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
    self.level++;
    self.isGameInProgress = true;
  });

  this.on('start-next-level', function() {
    self.startTimer();
  });

  this.on('score-increase', function(event) {
    self.score += event.amount;
  });

  this.on('score-decrease', function(event) {
    self.score = Math.max(0, self.score - event.amount);
  });
};

module.exports = GameController;
