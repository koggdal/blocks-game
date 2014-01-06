/**
 * @module BlockController
 */
'use strict';

var ScoreBlock = require('./ScoreBlock');
var DangerBlock = require('./DangerBlock');
var EventEmitter = require('./EventEmitter');
var Pool = require('./Pool');
var inherit = require('./utils/inherit');

/**
 * @classdesc Block controller class for controlling blocks in the game.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {Object} canvasObject An oCanvas wrapper object for the blocks.
 * @property {number} level The current level.
 * @property {number} numColumns The number of columns to render blocks in.
 * @property {number} blockSize The size of a square block, in CSS pixels.
 *     This property is set automatically based on the number of columns,
 *     calculated to fit the width of the game area.
 * @property {number} blockOffset The offset for every column, to give some
 *     spacing between the blocks.
 * @property {Array.<module:Block~Block>} blocks An array of blocks that are
 *     currently active in the game.
 * @property {number} dangerZonePosition The position (from the top, in canvas
 *     pixels) where the danger zone starts. If a block is fully inside the
 *     danger zone, it disappears.
 * @property {number} createInterval The interval, in milliseconds, when a new
 *     block is added to the game. After changing this value, call
 *     startCreateTimer().
 * @property {number} initialBlockSpeed The speed the block will have initially
 *     when added to the game.
 * @property {number} blockSpeed The speed the blocks currently have.
 * @property {number} increaseSpeedEvery Every n number of times the player
 *     captures a score block, the speed will increase slightly.
 * @property {number} increaseSpeedStep The current step towards
 *     increaseSpeedEvery.
 * @property {module:Pool~Pool} scorePool A pool of score blocks.
 * @property {module:Pool~Pool} dangerPool A pool of danger blocks.
 *
 * @constructor
 * @augments {module:EventEmitter~EventEmitter}
 *
 * @param {module:Canvas~Canvas} canvas A Canvas instance.
 */
function BlockController(canvas) {
  EventEmitter.call(this);

  var self = this;

  this.canvas = canvas;
  this.canvasObject = this.createBlockAreaObject();

  this.level = 1;
  this.numColumns = 6;
  this.blockSize = (canvas.stage.width / canvas.dpr) / (this.numColumns + 1);
  this.blockOffset = this.blockSize / (this.numColumns + 1);
  this.blocks = [];
  this.dangerZonePosition = 0;
  this.createInterval = 1000;
  this.initialBlockSpeed = 2;
  this.blockSpeed = this.initialBlockSpeed;
  this.increaseSpeedEvery = 5;
  this.increaseSpeedStep = 0;

  this.scorePool = new Pool();
  this.dangerPool = new Pool();

  this.scorePool.createFunction = function() {
    var block = new ScoreBlock(canvas, self.blockSize);
    block.canvasObject.bind('mousedown touchstart', function() { self.onClick(block); });
    return block;
  };
  this.dangerPool.createFunction = function() {
    var block = new DangerBlock(canvas, self.blockSize);
    block.canvasObject.bind('mousedown touchstart', function() { self.onClick(block); });
    return block;
  };

  this.scorePool.add(10);
  this.dangerPool.add(10);

  canvas.stage.setLoop(function() {
    self.gameTick();
  });

  this.on('scoreblock-reach-end', function() {
    self.blockSpeed += 0.2;
  });
}
inherit(BlockController, EventEmitter);

/**
 * Set the level.
 *
 * @param {number} level The level number (starting at 1).
 */
BlockController.prototype.setLevel = function(level) {
  this.level = level;
  this.blockSpeed = this.initialBlockSpeed;
  this.increaseSpeedStep = 0;
};

/**
 * Set the position for the danger zone.
 *
 * @param {number} position The new position, in canvas pixels.
 */
BlockController.prototype.setDangerZonePosition = function(position) {
  this.dangerZonePosition = position;
};

/**
 * Create a renderable wrapper object for the block area.
 *
 * @return {Object} An object representing an oCanvas rectangle object.
 */
BlockController.prototype.createBlockAreaObject = function() {
  var stage = this.canvas.stage;

  var object = stage.display.rectangle({
    width: stage.width,
    height: stage.height
  });

  return object;
};

/**
 * Add a new block to the game.
 */
BlockController.prototype.addBlock = function() {
  var dpr = this.canvas.dpr;
  var isScoreBlock = this.getRandomInt(0, 10) % 3 ? true : false;
  var object = isScoreBlock ? this.scorePool.get() : this.dangerPool.get();

  var column = this.getRandomInt(1, this.numColumns);
  
  var x = (column * this.blockOffset + (column - 1) * this.blockSize) * dpr;
  var y = -object.size;

  object.canvasObject.x = x;
  object.canvasObject.y = y;

  this.blocks.push(object);
  this.canvasObject.addChild(object.canvasObject);
};

/**
 * Remove a block from the game.
 *
 * @param {module:Block~Block} block A Block instance.
 * @param {number=} opt_index Index within the `blocks` array.
 */
BlockController.prototype.removeBlock = function(block, opt_index) {
  block.canvasObject.remove();

  if (block instanceof ScoreBlock) {
    this.scorePool.putBack(block);
  } else if (block instanceof DangerBlock) {
    this.dangerPool.putBack(block);
  }

  var index = opt_index === undefined ? this.blocks.indexOf(block) : opt_index;
  this.blocks.splice(index, 1);
};

/**
 * The click handler when a block is clicked.
 *
 * @param {module:Block~Block} block A Block instance.
 */
BlockController.prototype.onClick = function(block) {
  if (block instanceof ScoreBlock) {
    this.emit('scoreblock-click');
    if (++this.increaseSpeedStep === this.increaseSpeedEvery) {
      this.increaseSpeedStep = 0;
      this.blockSpeed += Math.min(this.level / 5, 1);
    }
  } else {
    this.emit('dangerblock-click');
  }
  this.removeBlock(block);
};

/**
 * The game tick. Do everything that the game should do every frame. This
 * includes moving all the blocks downwards and checking against the danger
 * zone.
 */
BlockController.prototype.gameTick = function() {
  var blocks = this.blocks;
  var speed = this.blockSpeed;
  var dpr = this.canvas.dpr;
  var dangerZonePosition = this.dangerZonePosition;

  for (var i = 0, l = blocks.length; i < l; i++) {
    var block = blocks[i];
    block.canvasObject.y += speed * dpr;

    if (block.canvasObject.y > dangerZonePosition) {
      if (block instanceof ScoreBlock) {
        this.emit('scoreblock-reach-end');
      } else if (block instanceof DangerBlock) {
        this.emit('dangerblock-reach-end');
      }
      this.removeBlock(block, i);
      i--; l--;
    }
  }
};

/**
 * Start the game play.
 */
BlockController.prototype.startGame = function() {
  if (this.canvas.stage.timeline.running) return;
  this.canvas.stage.timeline.start();
  this.startCreateTimer();
};

/**
 * Stop (pause) the game play.
 */
BlockController.prototype.stopGame = function() {
  if (!this.canvas.stage.timeline.running) return;
  this.canvas.stage.timeline.stop();
  this.stopCreateTimer();
};

/**
 * Start a timer for adding new blocks to the game.
 */
BlockController.prototype.startCreateTimer = function() {
  var self = this;
  this.stopCreateTimer();
  this.objectCreateTimer = setInterval(function() {
    self.addBlock();
  }, this.createInterval);
};

/**
 * Stop the timer that adds new blocks to the game.
 */
BlockController.prototype.stopCreateTimer = function() {
  clearInterval(this.objectCreateTimer);
};

/**
 * Remove remaining blocks when the level ends.
 */
BlockController.prototype.endLevel = function() {
  var self = this;
  var blocks = this.blocks;
  var stage = this.canvas.stage;

  for (var i = 0, l = blocks.length; i < l; i++) {
    var object = blocks[i].canvasObject;
    object.animate({y: object.y + stage.height * 1.5}, {
      easing: 'ease-in-cubic',
      duration: 700
    });
  }

  setTimeout(function() {
    for (var i = 0, l = blocks.length; i < l; i++) {
      self.removeBlock(blocks[i], i);
      i--; l--;
    }
  }, 1000);
};

/**
 * Get a random integer between two numbers.
 *
 * @param {number} min The minimum number.
 * @param {number} max The maximum number.
 *
 * @return {number} The random number.
 */
BlockController.prototype.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = BlockController;
