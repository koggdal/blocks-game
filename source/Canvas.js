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
 * @property {number} optimalWidth The optimal width if the screen fits it.
 * @property {number} optimalHeight The optimal height if the screen fits it.
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

  this.optimalWidth = this.element.width;
  this.optimalHeight = this.element.height;

  var width = Math.min(this.element.width, window.innerWidth);
  var height = Math.min(this.element.height, window.innerHeight);

  this.setSize(width, height);
  this.createStage();

  this.isTouch = this.stage.touch.isTouch;
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

  var parent = this.element.parentNode;
  if (parent) {
    parent.style.width = width + 'px';
    parent.style.height = height + 'px';
    parent.style.marginTop = (-height / 2) + 'px';
  }

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
