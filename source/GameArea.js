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
 * @property {Object} instructions An oCanvas object for the instructions.
 * @property {Array.<Object>} instructionSteps An array of oCanvas objects for
 *     the instructions steps. When showing the instructions, each step will be
 *     animated in and out.
 *
 * @constructor
 * @augments {module:EventEmitter~EventEmitter}
 *
 * @param {module:Canvas~Canvas} canvas A Canvas instance.
 */
function GameArea(canvas) {
  EventEmitter.call(this);

  var optimalHeightDiff = canvas.optimalHeight - canvas.height;

  this.canvas = canvas;
  this.dangerZoneStepSize = 60 - Math.round(optimalHeightDiff / 5.5);
  this.dangerZonePosition = 0;
  this.canvasObject = this.createGameAreaObject();
  this.blockArea = this.createBlockAreaObject();
  this.dangerZone = this.createDangerZoneObject();
  this.instructionSteps = null;
  this.levelTimeText = null;
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

  var height = dpr * 95;
  var offset = dpr * 75;

  var instructionSteps = [
    stage.display.rectangle({
      width: gameArea.width - offset * 2, height: height,
      x: offset, y: object.height / 2 - height / 2 - dpr * 20,
      opacity: 0,
      duration: 1000
    }),
    stage.display.rectangle({
      width: gameArea.width - offset * 2, height: height,
      x: offset, y: object.height / 2 - height / 2 - dpr * 20,
      opacity: 0,
      duration: 1000
    }),
    stage.display.rectangle({
      width: gameArea.width - offset * 2, height: height,
      x: offset, y: object.height / 2 - height / 2 - dpr * 20,
      opacity: 0,
      duration: 500
    })
  ];
  this.instructionSteps = instructionSteps;

  object.addChild(instructionSteps[0]);
  object.addChild(instructionSteps[1]);
  object.addChild(instructionSteps[2]);

  var blockSize = 40;
  var fontSize = 26;

  var scoreBlock = stage.display.rectangle({
    x: 0, y: 0,
    width: dpr * blockSize, height: dpr * blockSize,
    fill: '#0bb'
  });
  instructionSteps[0].addChild(scoreBlock);

  var dangerBlock = stage.display.rectangle({
    x: scoreBlock.x, y: scoreBlock.y + scoreBlock.height + dpr * 10,
    width: dpr * blockSize, height: dpr * blockSize,
    fill: '#b00'
  });
  instructionSteps[0].addChild(dangerBlock);

  var scoreBlockText = stage.display.text({
    x: scoreBlock.x + dpr * (blockSize + 10), y: scoreBlock.y + scoreBlock.height / 2,
    origin: {x: 'left', y: 'center'},
    fill: '#222',
    text: '+ 20 points',
    font: (dpr * fontSize) + 'px ' + canvas.font
  });
  instructionSteps[0].addChild(scoreBlockText);

  var dangerBlockText = stage.display.text({
    x: dangerBlock.x + dpr * (blockSize + 10), y: dangerBlock.y + dangerBlock.height / 2,
    origin: {x: 'left', y: 'center'},
    fill: '#222',
    text: '- 20 points',
    font: (dpr * fontSize) + 'px ' + canvas.font
  });
  instructionSteps[0].addChild(dangerBlockText);

  object.setScoreBlockScore = function(score) {
    scoreBlockText.text = (score > 0 ? '+ ' : '- ') + Math.abs(score) + ' POINTS';
    scoreBlockText.fill = '#0aa';
  };

  object.setDangerBlockScore = function(score) {
    dangerBlockText.text = (score > 0 ? '+ ' : '- ') + Math.abs(score) + ' POINTS';
    dangerBlockText.fill = '#b00';
  };

  var timeText = stage.display.text({
    x: instructionSteps[0].width / 2, y: 0,
    origin: {x: 'center', y: 'top'},
    align: 'center',
    fill: '#222',
    text: '10 Levels',
    font: (dpr * 46) + 'px ' + canvas.font
  });
  instructionSteps[1].addChild(timeText);

  var timeText2 = stage.display.text({
    x: instructionSteps[1].width / 2, y: timeText.y + dpr * 60,
    origin: {x: 'center', y: 'top'},
    align: 'center',
    fill: '#222',
    text: '30 seconds each',
    font: (dpr * 24) + 'px ' + canvas.font,
    setTime: function(time) {
      this.text = time + ' seconds each';
    }
  });
  instructionSteps[1].addChild(timeText2);
  this.levelTimeText = timeText2;

  var readyText = stage.display.text({
    x: instructionSteps[2].width / 2, y: 0,
    origin: {x: 'center', y: 'top'},
    align: 'center',
    fill: '#222',
    text: 'GO!',
    font: (dpr * 46) + 'px ' + canvas.font
  });
  instructionSteps[2].addChild(readyText);

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
    y: Math.round(stage.height - height)
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
 *
 * @param {number} levelTime The number of seconds each level is.
 * @param {function=} opt_callback Optional callback that triggers when the
 *     animation is completed.
 */
GameArea.prototype.showInstructions = function(levelTime, opt_callback) {
  this.levelTimeText.setTime(levelTime);
  this.canvasObject.addChild(this.instructions);
  this.showInstructionStep(0, opt_callback);
};

/**
 * Show the specified instruction step. It will animate in and out and then
 * show the next instruction step.
 *
 * @param {function=} opt_callback Optional callback that triggers when all
 *     steps have been shown.
 */
GameArea.prototype.showInstructionStep = function(index, opt_callback) {
  var self = this;
  var step = this.instructionSteps[index];

  if (!step) {
    this.instructions.remove();
    if (opt_callback) opt_callback();
    return;
  }

  function fadeIn(cb) {
    step.animate({opacity: 1}, {
      easing: 'ease-in-out-cubic',
      duration: 500,
      callback: cb
    });
  }

  function fadeOut(cb) {
    step.animate({opacity: 0}, {
      easing: 'ease-in-out-cubic',
      duration: 500,
      callback: cb
    });
  }

  fadeIn(function() {
    setTimeout(function() {
      fadeOut(function() {
      });
      setTimeout(function() {
        self.showInstructionStep(++index, opt_callback);
      }, 250);
    }, step.duration);
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
