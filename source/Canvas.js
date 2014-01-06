/**
 * @module Canvas
 */
'use strict';

/**
 * @classdesc Canvas element handling for where things get rendered.
 *
 * @property {HTMLCanvasElement} element The canvas element.
 * @property {number} width The width of the canvas in CSS pixels.
 * @property {number} height The height of the canvas in CSS pixels.
 * @property {number} dpr The device pixel ratio, 1 for a normal display.
 * @property {Object} stage The oCanvas core instance.
 * @property {string} font The font family used throughout the game.
 *
 * @constructor
 *
 * @param {string|HTMLCanvasElement} element A CSS selector for finding a
 *     canvas element, or an actual canvas element.
 */
function Canvas(element) {
  if (typeof element === 'string') {
    this.element = document.querySelector(element);
  } else {
    this.element = element;
  }

  if (!(this.element instanceof HTMLCanvasElement)) {
    throw new Error('The Canvas instance does not have a valid canvas element');
  }

  this.width = 0;
  this.height = 0;
  this.dpr = window.devicePixelRatio || 1;
  this.stage = null;
  this.font = 'Squada One, sans-serif';

  this.setSize(this.element.width, this.element.height);
  this.createStage();
}

/**
 * Set the size of the canvas. The values should be in CSS pixels and the
 * method will then automatically make the real canvas pixel storage in
 * accordance with the device pixel ratio.
 *
 * @param {number} width The width in CSS pixels.
 * @param {number} height The height in CSS pixels.
 */
Canvas.prototype.setSize = function(width, height) {
  this.element.style.width = width + 'px';
  this.element.style.height = height + 'px';
  this.element.width = width * this.dpr;
  this.element.height = height * this.dpr;

  this.width = width;
  this.height = height;
};

/**
 * Create the oCanvas stage.
 */
Canvas.prototype.createStage = function() {
  this.stage = oCanvas.create({
    canvas: this.element,
    background: '#fff',
    fps: 60,
    disableScrolling: true
  });
};

/**
 * Request to re-render the canvas.
 */
Canvas.prototype.requestRender = function() {
  this.stage.redraw();
};

module.exports = Canvas;
