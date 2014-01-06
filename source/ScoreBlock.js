/**
 * @module ScoreBlock
 */
'use strict';

var Block = require('./Block');
var inherit = require('./utils/inherit');

/**
 * @classdesc Score block class for rendering a score block.
 *
 * @constructor
 * @augments {Block}
 *
 * @param {Canvas} canvas A Canvas instance.
 * @param {number} size The size in CSS pixels.
 */
function ScoreBlock(canvas, size) {
  Block.call(this, canvas, size);

  this.canvasObject.fill = '#0bb';
}
inherit(ScoreBlock, Block);

module.exports = ScoreBlock;
