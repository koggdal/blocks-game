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
 */
function GameController() {
  EventEmitter.call(this);

  this.canvas = null;
  this.mainMenu = null;
  this.pauseMenu = null;
  this.continueMenu = null;

  this.isGameInProgress = false;
  this.isPaused = false;
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
  });

  this.on('resume-game', function() {
    self.isPaused = false;
  });

  this.on('start-new-game', function() {
    self.isGameInProgress = true;
  });

  this.on('stop-level', function() {
    self.isGameInProgress = false;
  });

  this.on('action:start-next-level', function() {
    self.isGameInProgress = true;
  });
};

module.exports = GameController;
