/**
 * @module Block
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Block class for rendering a normal block.
 *
 * @property {Canvas} canvas The Canvas instance used for rendering.
 * @property {number} size The size of the square block, in CSS pixels.
 * @property {Object} canvasObject An oCanvas object for the block.
 *
 * @constructor
 * @augments {EventEmitter}
 *
 * @param {Canvas} canvas A Canvas instance.
 * @param {number} size The size in CSS pixels.
 */
function Block(canvas, size) {
  EventEmitter.call(this);

  this.canvas = canvas;
  this.size = size;
  this.canvasObject = this.createObject();
}
inherit(Block, EventEmitter);

/**
 * Create a renderable wrapper object for the whole game area.
 *
 * @return {Object} An object representing an oCanvas rectangle object.
 */
Block.prototype.createObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;

  var object = stage.display.rectangle({
    width: this.size * dpr,
    height: this.size * dpr
  });

  return object;
};

module.exports = Block;
