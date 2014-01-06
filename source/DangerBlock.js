/**
 * @module DangerBlock
 */
'use strict';

var Block = require('./Block');
var inherit = require('./utils/inherit');

/**
 * @classdesc Danger block class for rendering a dangerous block.
 *
 * @constructor
 * @augments {Block}
 *
 * @param {Canvas} canvas A Canvas instance.
 * @param {number} size The size in CSS pixels.
 */
function DangerBlock(canvas, size) {
  Block.call(this, canvas, size);

  this.canvasObject.fill = '#b00';
}
inherit(DangerBlock, Block);

module.exports = DangerBlock;
