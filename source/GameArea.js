/**
 * @module GameArea
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Game area class for rendering the game area.
 *
 * @property {Canvas} canvas The Canvas instance used for rendering.
 * @property {number} dangerZoneStepSize The size which the danger zone will
 *     increase with for each level.
 * @property {number} dangerZonePosition The position (from the top, in canvas
 *     pixels) where the danger zone starts.
 * @property {Object} canvasObject An oCanvas object for the game area.
 * @property {Object} blockArea An oCanvas object where blocks should be added.
 * @property {Object} dangerZone An oCanvas object for the danger zone.
 *
 * @constructor
 * @augments {EventEmitter}
 *
 * @param {Canvas} canvas A Canvas instance.
 */
function GameArea(canvas) {
  EventEmitter.call(this);

  this.canvas = canvas;
  this.dangerZoneStepSize = 40;
  this.dangerZonePosition = 0;
  this.canvasObject = this.createGameAreaObject();
  this.blockArea = this.createBlockAreaObject();
  this.dangerZone = this.createDangerZoneObject();
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
  var dangerColors = this.generateStripedGradientColors(50, '#999', '#000').join(', ');

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
 * Generate a striped gradient.
 *
 * @param {number} stripes The number of stripes.
 * @param {} color1 The first color.
 * @param {} color2 The second color.
 * @return {Array.<string>} An array of color values (with positions). These
 *     can be used in a gradient syntax, by joining the array values with ', '.
 */
GameArea.prototype.generateStripedGradientColors = function(stripes, color1, color2) {
  var colors = [];

  var colorSize = 100 / stripes;
  color1 = color1 || 'white';
  color2 = color2 || 'black';

  for (var i = 0, l = stripes; i < l; i++) {
    if (i % 2) {
      colors.push(color1 + ' ' + (i * colorSize) + '%');
      colors.push(color1 + ' ' + ((i + 1) * colorSize) + '%');
    } else {
      colors.push(color2 + ' ' + (i * colorSize) + '%');
      colors.push(color2 + ' ' + ((i + 1) * colorSize) + '%');
    }
  }

  return colors;
};

module.exports = GameArea;
