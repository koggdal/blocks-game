/**
 * @module GameArea
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Game area class for rendering the game area.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {number} dangerZoneStepSize The size which the danger zone will
 *     increase with for each level.
 * @property {number} dangerZonePosition The position (from the top, in canvas
 *     pixels) where the danger zone starts.
 * @property {Object} canvasObject An oCanvas object for the game area.
 * @property {Object} blockArea An oCanvas object where blocks should be added.
 * @property {Object} dangerZone An oCanvas object for the danger zone.
 * @property {Object} scoreInstructions An oCanvas object for the score instructions.
 * @property {Object} instructions An oCanvas object for the instructions.
 *
 * @constructor
 * @augments {module:EventEmitter~EventEmitter}
 *
 * @param {module:Canvas~Canvas} canvas A Canvas instance.
 */
function GameArea(canvas) {
  EventEmitter.call(this);

  this.canvas = canvas;
  this.dangerZoneStepSize = 60;
  this.dangerZonePosition = 0;
  this.canvasObject = this.createGameAreaObject();
  this.blockArea = this.createBlockAreaObject();
  this.dangerZone = this.createDangerZoneObject();
  this.scoreInstructions = null;
  this.instructions = this.createInstructionsObject();
}
inherit(GameArea, EventEmitter);

/**
 * Create a renderable wrapper object for the whole game area.
 *
 * @return {Object} An oCanvas object for the game area wrapper.
 */
GameArea.prototype.createGameAreaObject = function() {
  var stage = this.canvas.stage;
  var object = stage.display.rectangle({
    width: stage.width,
    height: stage.height
  });
  return object;
};

/**
 * Create a renderable wrapper object for the block area.
 *
 * @return {Object} An oCanvas object for the block area.
 */
GameArea.prototype.createBlockAreaObject = function() {
  var stage = this.canvas.stage;

  var object = stage.display.rectangle({
    width: this.canvasObject.width,
    height: this.canvasObject.height
  });

  this.canvasObject.addChild(object);

  return object;
};

/**
 * Create a renderable wrapper object for the danger zone.
 *
 * @return {Object} An oCanvas object for the danger zone.
 */
GameArea.prototype.createDangerZoneObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var gameArea = this.canvasObject;
  var dangerColors = this.generateStripedGradientColors(50, '#999','#000');
  dangerColors = dangerColors.join(', ');

  var object = stage.display.rectangle({
    width: stage.width,
    height: dpr * this.dangerZoneStepSize,
    y: stage.height + dpr * 5,
    fill: 'linear-gradient(315deg, ' + dangerColors + ')',
    stroke: (dpr * 5) + 'px black',
    strokePosition: 'outside',
    opacity: 0.3
  });
  this.dangerZonePosition = object.y;

  gameArea.addChild(object);

  return object;
};

/**
 * Create a renderable wrapper object for the instructions.
 *
 * @return {Object} An oCanvas object for the instructions.
 */
GameArea.prototype.createInstructionsObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var gameArea = this.canvasObject;

  var object = stage.display.rectangle({
    width: gameArea.width, height: gameArea.height
  });

  var scoreInstructions = stage.display.rectangle({
    width: gameArea.width, height: gameArea.height,
    y: -150
  });
  object.addChild(scoreInstructions);
  this.scoreInstructions = scoreInstructions;

  var blockSize = 40;
  var fontSize = 26;

  var scoreBlock = stage.display.rectangle({
    x: dpr * 70, y: dpr * 70,
    width: dpr * blockSize, height: dpr * blockSize,
    fill: '#0bb'
  });
  scoreInstructions.addChild(scoreBlock);

  var dangerBlock = stage.display.rectangle({
    x: scoreBlock.x, y: scoreBlock.y + scoreBlock.height + dpr * 10,
    width: dpr * blockSize, height: dpr * blockSize,
    fill: '#b00'
  });
  scoreInstructions.addChild(dangerBlock);

  var scoreBlockText = stage.display.text({
    x: scoreBlock.x + dpr * (blockSize + 10), y: scoreBlock.y + scoreBlock.height / 2,
    origin: {x: 'left', y: 'center'},
    fill: '#222',
    text: '+ 20 points',
    font: (dpr * fontSize) + 'px ' + canvas.font
  });
  scoreInstructions.addChild(scoreBlockText);

  var dangerBlockText = stage.display.text({
    x: dangerBlock.x + dpr * (blockSize + 10), y: dangerBlock.y + dangerBlock.height / 2,
    origin: {x: 'left', y: 'center'},
    fill: '#222',
    text: '- 20 points',
    font: (dpr * fontSize) + 'px ' + canvas.font
  });
  scoreInstructions.addChild(dangerBlockText);

  object.setScoreBlockScore = function(score) {
    scoreBlockText.text = (score > 0 ? '+ ' : '- ') + Math.abs(score) + ' POINTS';
    scoreBlockText.fill = '#0aa';
  };

  object.setDangerBlockScore = function(score) {
    dangerBlockText.text = (score > 0 ? '+ ' : '- ') + Math.abs(score) + ' POINTS';
    dangerBlockText.fill = '#b00';
  };

  return object;
};

/**
 * Set the danger zone size visually.
 *
 * @param {number} multiplier A number that will be multiplied with
 *     `dangerZoneStepSize` to get the new height.
 */
GameArea.prototype.setDangerZoneSize = function(multiplier) {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;

  var height = this.dangerZoneStepSize * multiplier * dpr;

  this.dangerZone.animate({
    height: height,
    y: stage.height - height
  }, {
    easing: 'ease-out-cubic',
    duration: 500
  });

  this.dangerZonePosition = stage.height - height;
};

/**
 * Fade in the game area.
 */
GameArea.prototype.fadeIn = function() {
  this.canvasObject.stop().animate({opacity: 1}, {duration: 100});
};

/**
 * Fade out the game area. Used when the game is paused etc.
 */
GameArea.prototype.fadeOut = function() {
  this.canvasObject.stop().animate({opacity: 0.1}, {duration: 100});
};

/**
 * Set new score labels for instructions.
 *
 * @param {Object} scores Object with two properties: scoreBlock and
 *     dangerBlock, both numbers.
 */
GameArea.prototype.setScores = function(scores) {
  this.instructions.setScoreBlockScore(scores.scoreBlock);
  this.instructions.setDangerBlockScore(scores.dangerBlock);
};

/**
 * Show the instructions.
 */
GameArea.prototype.showInstructions = function() {
  this.canvasObject.addChild(this.instructions);
  this.scoreInstructions.animate({y: 0}, {
    easing: 'ease-out-cubic',
    duration: 500
  });
};

/**
 * Hide the instructions.
 */
GameArea.prototype.hideInstructions = function() {
  var self = this;

  this.scoreInstructions.animate({y: -150}, {
    easing: 'ease-in-cubic',
    duration: 500,
    callback: function() {
      self.instructions.remove();
    }
  });
};

/**
 * Generate a striped gradient.
 *
 * @param {number} stripes The number of stripes.
 * @param {string} c1 The first color.
 * @param {string} c2 The second color.
 *
 * @return {Array.<string>} An array of color values (with positions). These
 *     can be used in a gradient syntax, by joining the array values with ', '.
 */
GameArea.prototype.generateStripedGradientColors = function(stripes, c1, c2) {
  var colors = [];

  var colorSize = 100 / stripes;
  c1 = c1 || 'white';
  c2 = c2 || 'black';

  for (var i = 0, l = stripes; i < l; i++) {
    if (i % 2) {
      colors.push(c1 + ' ' + (i * colorSize) + '%');
      colors.push(c1 + ' ' + ((i + 1) * colorSize) + '%');
    } else {
      colors.push(c2 + ' ' + (i * colorSize) + '%');
      colors.push(c2 + ' ' + ((i + 1) * colorSize) + '%');
    }
  }

  return colors;
};

module.exports = GameArea;
