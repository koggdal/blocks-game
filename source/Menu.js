/**
 * @module Menu
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Menu class for rendering a menu with a title and clickable items.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {string} id The menu ID.
 * @property {string} title The title for the menu.
 * @property {Array.<Array>} items An array of items. Each item is an array
 *     where the first position contains the item ID and the second position
 *     contains the item label.
 * @property {Object} canvasObject An oCanvas object for the whole menu.
 * @property {Object} titleObject An oCanvas object for the title.
 * @property {Array.<Object>} itemObjects An array of oCanvas objects for
 *     all items.
 * @property {boolean} isAnimating Whether the menu is currently animating.
 *
 * @constructor
 * @augments {module:EventEmitter~EventEmitter}
 *
 * @param {Object} Options object.
 */
function Menu(options) {
  EventEmitter.call(this);

  this.canvas = options.canvas;
  this.id = options.id || '';
  this.title = options.title || '';
  this.subtitle = options.subtitle || '';
  this.offset = options.offset || 0;
  this.items = options.items || [];
  this.canvasObject = this.createMenuObject();
  this.titleObject = this.createTitleObject();
  this.subtitleObject = this.createSubtitleObject();
  this.itemObjects = [];
  this.isAnimating = false;

  var items = options.items;
  for (var i = 0, l = items.length; i < l; i++) {
    var item = items[i];
    this.itemObjects.push(this.createItemObject(i, {
      id: item[0],
      label: item[1],
      fill: item[2],
      fillHighlight: item[3],
      offset: item[4]
    }));
  }
}
inherit(Menu, EventEmitter);

/**
 * Create a renderable wrapper object for the whole menu. This allows us to
 * move and work with the menu as a whole, including the title and all items.
 *
 * @return {Object} An oCanvas object for the menu.
 */
Menu.prototype.createMenuObject = function() {
  var stage = this.canvas.stage;
  var object = stage.display.rectangle({
    x: -stage.width, y: 0,
    width: stage.width,
    height: stage.height
  });
  return object;
};

/**
 * Create a renderable object for the title.
 *
 * @return {Object} An oCanvas object for the title.
 */
Menu.prototype.createTitleObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var menu = this.canvasObject;

  var object = stage.display.text({
    x: menu.width / 2,
    y: menu.height / 2 - dpr * (150 - this.offset),
    origin: {x: 'center', y: 'center'},
    align: 'center',
    fill: '#222',
    text: this.title.toUpperCase(),
    font: (dpr * 60) + 'px ' + canvas.font
  });
  menu.addChild(object);

  return object;
};

/**
 * Create a renderable object for the subtitle.
 *
 * @return {Object} An oCanvas object for the title.
 */
Menu.prototype.createSubtitleObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var menu = this.canvasObject;

  var object = stage.display.text({
    x: menu.width / 2,
    y: menu.height / 2 - dpr * 75,
    origin: {x: 'center', y: 'center'},
    align: 'center',
    fill: '#222',
    text: this.subtitle,
    font: (dpr * 40) + 'px ' + canvas.font
  });
  menu.addChild(object);

  return object;
};

/**
 * Create a renderable object for a menu item.
 *
 * @param {number} index The index within the menu list.
 * @param {Object} options Object with options.
 *
 * @return {Object} An oCanvas object for the menu item.
 */
Menu.prototype.createItemObject = function(index, options) {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var menu = this.canvasObject;

  var id = options.id;
  var label = options.label;
  var fill = options.fill || '#222';
  var fillHighlight = options.fillHighlight || '#444';
  var itemHeight = 50;
  var itemOffset = options.offset || 10;

  var object = stage.display.rectangle({
    x: menu.width / 2,
    y: menu.height / 2 + index * (itemHeight + 10) * dpr + (itemOffset - 10) * dpr,
    width: menu.width / 2,
    height: itemHeight * dpr,
    origin: {x: 'center', y: 'center'},
    fill: fill
  });

  var text = stage.display.text({
    origin: {x: 'center', y: 'center'},
    align: 'center',
    fill: '#fff',
    text: label,
    font: (dpr * 30) + 'px ' + canvas.font
  });

  object.addChild(text);
  menu.addChild(object);

  var self = this;
  object.bind('click tap', function() {
    if (self.isAnimating) return;
    self.emit('click', {id: id});
  });
  var pressed = false;
  object.bind('mousedown touchstart', function() {
    if (self.isAnimating) return;
    pressed = true;
    this.fill = fillHighlight;
    canvas.requestRender();
  });
  stage.bind('mouseup touchend', function() {
    if (self.isAnimating) return;
    if (!pressed) return;
    pressed = false;
    object.fill = fill;
    canvas.requestRender();
  });

  return object;
};

/**
 * Show menu with an animation.
 *
 * @param {Object} parentObject An oCanvas object to add the menu object to.
 * @param {function=} opt_callback Callback triggered when animation is done.
 */
Menu.prototype.show = function(parentObject, opt_callback) {
  var self = this;
  this.isAnimating = true;
  parentObject.addChild(this.canvasObject);
  this.canvasObject.animate({
    x: 0
  }, {
    easing: 'ease-out-back',
    duration: 500,
    callback: function() {
      self.isAnimating = false;
      if (opt_callback) opt_callback();
    }
  });
};

/**
 * Hide menu with an animation.
 *
 * @param {function=} opt_callback Callback triggered when animation is done.
 */
Menu.prototype.hide = function(opt_callback) {
  var self = this;
  this.isAnimating = true;
  this.canvasObject.animate({
    x: -this.canvas.stage.width
  }, {
    easing: 'ease-in-back',
    duration: 500,
    callback: function() {
      self.canvasObject.remove();
      self.isAnimating = false;
      if (opt_callback) opt_callback();
    }
  });
};

module.exports = Menu;
