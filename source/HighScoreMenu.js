/**
 * @module HighScoreMenu
 */
'use strict';

var Menu = require('./Menu');
var inherit = require('./utils/inherit');
var json = require('./utils/json');

/**
 * @classdesc Class for rendering the high score view.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {Object} canvasObject An oCanvas object for the high score view.
 * @property {string} serverPathLoad Path to the endpoint for getting the list
 *     of top high scores.
 * @property {string} serverPathSave Path to the endpoint for saving a new
 *     high score.
 * @property {Array.<Object>} highScoreItemObjects Array of oCanvas objects for
 *     the high score list items.
 * @property {Array.<Object>} highScoreData Array of score items, where each
 *     item has a `name` and a `score` property.
 * @property {boolean} highScoreDataLoading Whether the high score list is
 *     currently being loaded from the server.
 * @property {number} highScoreCount The number of items in the high score list.
 * @property {number} newHighScoreIndex The index at which the new score is
 *     placed in the list of high scores.
 * @property {boolean} waitingForRealInput Whether the list is waiting for the
 *     menu to be animated in, and to finally replace the new high score item
 *     with a real HTML input.
 * @property {boolean} realInputVisible Whether the real HTML input is visible.
 * @property {Object} highScoreObject The oCanvas object for the high score
 *     list.
 * @property {HTMLInputElement} inputElement The HTML input element.
 *
 * @constructor
 * @augments {module:Menu~Menu}
 *
 * @param {module:Canvas~Canvas} canvas A Canvas instance.
 */
function HighScoreMenu(canvas) {
  var optimalHeightDiff = canvas.optimalHeight - canvas.height;

  Menu.call(this, {
    canvas: canvas,
    id: 'gameover',
    title: 'Game Over',
    offset: -30 + optimalHeightDiff / 2,
    items: [
      ['main-menu', 'Main Menu', '#222', '#444'],
      ['restart', 'Restart', '#0aa', '#2cc']
    ]
  });

  this.serverPathLoad = 'http://ocanvas.org/demo/blocks/highscore/load';
  this.serverPathSave = 'http://ocanvas.org/demo/blocks/highscore/save';

  this.highScoreItemObjects = [];
  this.highScoreData = null;
  this.highScoreDataLoading = false;
  this.highScoreCount = 5;
  this.newHighScoreIndex = 0;
  this.waitingForRealInput = false;
  this.realInputVisible = false;

  this.highScoreObject = this.createHighScoreObject();
  this.inputElement = this.createRealInput();

  this.repositionMenuItems();
  this.createHighScoreItems();

  this.on('show', function() {
    if (this.waitingForRealInput) {
      this.switchToRealInput();
    }
  });

  this.on('before:hide', function() {
    if (this.realInputVisible) {
      this.hideRealInput();
    }
  });
}
inherit(HighScoreMenu, Menu);

/**
 * Create a renderable object for the high score list.
 *
 * @return {Object} An oCanvas object.
 */
HighScoreMenu.prototype.createHighScoreObject = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var view = this.canvasObject;

  var optimalHeightDiff = canvas.optimalHeight - canvas.height;
  var offsetY = dpr * (220 - optimalHeightDiff / 2);
  var offsetX = dpr * 20;
  var object = stage.display.rectangle({
    x: offsetX, y: offsetY,
    width: view.width - offsetX * 2,
    height: dpr * 200
  });
  view.addChild(object);

  return object;
};

/**
 * Reposition the menu items to be next to each other.
 * This is so that the game over view can fit a small high score list.
 */
HighScoreMenu.prototype.repositionMenuItems = function() {
  var canvas = this.canvas;
  var dpr = canvas.dpr;
  var view = this.canvasObject;

  var optimalHeightDiff = canvas.optimalHeight - canvas.height;

  var sideOffset = dpr * 10;
  var bottomOffset = Math.max(sideOffset, dpr * (40 - optimalHeightDiff / 2));
  var buttonWidth = Math.round(view.width / 2.2);

  var mainMenu = this.itemObjects[0];
  var restart = this.itemObjects[1];

  if (mainMenu) {
    mainMenu.width = buttonWidth;
    var mainMenuOrigin = mainMenu.getOrigin();
    mainMenu.x = mainMenuOrigin.x + sideOffset;
    mainMenu.y = view.height - mainMenuOrigin.y - bottomOffset;
  }

  if (restart) {
    restart.width = buttonWidth;
    var restartOrigin = restart.getOrigin();
    restart.x = view.width - restartOrigin.x - sideOffset;
    restart.y = view.height - restartOrigin.y - bottomOffset;
  }
};

/**
 * Set the final score for the player.
 *
 * @param {number} score The score.
 */
HighScoreMenu.prototype.setScore = function(score) {
  this.subtitleObject.text = score + ' points';

  var items = this.highScoreData;
  if (items) {
    var index;
    for (var i = 0, l = this.highScoreCount; i < l; i++) {
      if (!items[i] || items[i].score < score) {
        index = i;
        break;
      }
    }

    if (index !== undefined) {
      items.splice(index, 0, {
        name: 'Enter Name',
        score: score,
        newScore: true
      });
      this.waitingForRealInput = true;
      this.newHighScoreIndex = index;
    }

    this.setHighScoresFromData(this.highScoreData);
  }
};

/**
 * Create the renderable objects for the items in the high score list.
 * This adds objects to the `highScoreItemObjects` array. These objects have
 * methods for controlling the content and appearance of the items.
 */
HighScoreMenu.prototype.createHighScoreItems = function() {
  for (var i = 0, l = this.highScoreCount; i < l; i++) {
    this.createHighScoreItem(i);
  }
};

/**
 * Create a rendereable object for one item in the high score list.
 * This adds an object to the `highScoreItemObjects` array. That object has
 * methods for controlling the content and appearance of the item.
 *
 * @param {number} index The index to create the item for.
 */
HighScoreMenu.prototype.createHighScoreItem = function(index) {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;

  var parent = this.highScoreObject;

  var itemHeight = dpr * 40;

  function prepareName(name) {
    return (name || '').toUpperCase().substring(0, 10);
  }

  function prepareScore(score) {
    score = parseInt(score, 10);
    return isNaN(score) ? '' : score;
  }

  var positionText = stage.display.text({
    y: index * itemHeight + itemHeight / 2,
    origin: {x: 'left', y: 'center'},
    align: 'center',
    fill: '#222',
    text: (index + 1),
    font: (dpr * 30) + 'px ' + canvas.font
  });

  var nameText = positionText.clone({
    align: 'left',
    x: dpr * 40,
    text: ''
  });

  var scoreText = positionText.clone({
    origin: {x: 'right', y: 'center'},
    align: 'right',
    x: parent.width,
    text: ''
  });

  parent.addChild(positionText);
  parent.addChild(nameText);
  parent.addChild(scoreText);

  this.highScoreItemObjects.push({
    getOffset: function() {
      return (parent.y + nameText.y - itemHeight / 2 - 3) / dpr;
    },
    setName: function(name) {
      nameText.text = prepareName(name);
      parent.redraw();
    },
    setScore: function(score) {
      scoreText.text = prepareScore(score);
      parent.redraw();
    },
    setMode: function(mode) {
      if (mode === 'new') {
        positionText.fill = '#0bb';
        nameText.fill = '#999';
        scoreText.fill = '#0bb';
      } else if (mode === 'new-done') {
        positionText.fill = '#0bb';
        nameText.fill = '#0bb';
        scoreText.fill = '#0bb';
      } else {
        positionText.fill = '#222';
        nameText.fill = '#222';
        scoreText.fill = '#222';
      }
      parent.redraw();
    }
  });
};

/**
 * Set the mode for the high score view. The view can be seen in two different
 * modes: Game Over or High Scores. This will update the visuals to adapt for
 * the set mode.
 *
 * @param {string} mode The new mode. Can be 'game-over' or 'high-scores'.
 */
HighScoreMenu.prototype.setMode = function(mode) {
  var canvas = this.canvas;
  var dpr = canvas.dpr;
  var view = this.canvasObject;

  var optimalHeightDiff = canvas.optimalHeight - canvas.height;

  if (mode === 'game-over') {
    this.titleObject.text = 'Game Over';
    this.subtitleObject.opacity = 1;
    this.subtitleObject.y = view.height / 2 - dpr * (75 - this.offset + optimalHeightDiff / 5);
    this.highScoreObject.y = dpr * (220 - optimalHeightDiff / 2.5);
    this.itemObjects[1].children[0].text = 'Restart';
  }

  if (mode === 'high-scores') {
    this.titleObject.text = 'High Scores';
    this.subtitleObject.opacity = 0;
    this.highScoreObject.y = dpr * (190 - optimalHeightDiff / 2.5);
    this.itemObjects[1].children[0].text = 'Play';
  }
};

/**
 * Set the visual objects for the high score list to reflect the new data.
 *
 * @param {Array.<Object>} items An array of objects with `name` and `score`
 *     properties. The object can also have a `newScore` property, which if
 *     set to `true` will make the high score item pop out with a different
 *     color.
 */
HighScoreMenu.prototype.setHighScoresFromData = function(items) {
  var itemObjects = this.highScoreItemObjects;
  for (var i = 0, l = itemObjects.length; i < l; i++) {
    itemObjects[i].setName(items[i] && items[i].name);
    itemObjects[i].setScore(items[i] && items[i].score);
    itemObjects[i].setMode((items[i] && items[i].newScore) ? 'new' : '');
  }
};

/**
 * Get the latest high score list from the server.
 * This will update the `highScoreData` property with the new data, as well as
 * update the visual list.
 */
HighScoreMenu.prototype.getHighScores = function() {
  var self = this;

  // Cancel if we're already loading the data, to prevent
  // multiple calls to the backend at the same time.
  if (this.highScoreDataLoading) return;

  this.highScoreDataLoading = true;

  json.load(this.serverPathLoad, function(error, data) {
    if (error) {
      setTimeout(function() {
        self.getHighScores();
      }, 1000);
      return;
    }

    self.highScoreDataLoading = false;
    self.highScoreData = data;

    self.setHighScoresFromData(data);
  });
};

/**
 * Save the new high score item to the server.
 * If the server call fails, it will try again.
 *
 * @param {Array.<Object>=} opt_data Optional data to save. If not provided, it
 *     will use the data from `highScoreData` at index `newHighScoreIndex`.
 */
HighScoreMenu.prototype.saveHighScore = function(opt_data) {
  var dataItem = opt_data || this.highScoreData[this.newHighScoreIndex];
  var self = this;

  json.save(this.serverPathSave, dataItem, function(error) {
    if (error) {
      setTimeout(function() {
        self.saveHighScore(dataItem);
      }, 1000);
    }
  });
};

/**
 * Create the real HTML input element.
 * This will also attach a keyboard event listener to catch presses on the
 * `enter` key and save the high score to the server when that happens.
 *
 * @return {HTMLInputElement} An HTML input element.
 */
HighScoreMenu.prototype.createRealInput = function() {
  var self = this;
  var input = document.createElement('input');
  input.id = 'name-input';
  input.maxlength = 10;
  input.placeholder = 'Enter Name';

  input.addEventListener('keydown', function(event) {
    if ((event.key || event.which || event.keyCode) === 13) {
      self.switchToFakeInput(this.value);
      self.saveHighScore();
    }
  }, false);

  input.addEventListener('blur', function(event) {
    if (this.value !== '') {
      self.switchToFakeInput(this.value);
      self.saveHighScore();
    }
  }, false);

  var canvasWrapper = document.getElementById('canvaswrapper');
  canvasWrapper.appendChild(input);

  return input;
};

/**
 * Show the real HTML input element. This also puts keyboard focus in the
 * input element.
 *
 * @param {Object} item Object that contains an `offset` property, which is
 *     the offset from the top of the game view to where the text object is.
 */
HighScoreMenu.prototype.showRealInput = function(item) {
  this.inputElement.value = '';
  this.inputElement.style.top = item.getOffset() + 'px';
  this.inputElement.className = 'visible';
  this.inputElement.focus();
  this.realInputVisible = true;
};

/**
 * Hide the real HTML input element.
 */
HighScoreMenu.prototype.hideRealInput = function() {
  this.inputElement.blur();
  this.inputElement.className = '';
  this.realInputVisible = false;
};

/**
 * Switch to show a real HTML input instead of the fake canvas name field.
 */
HighScoreMenu.prototype.switchToRealInput = function() {
  var item = this.highScoreItemObjects[this.newHighScoreIndex];
  if (!item) return;

  this.showRealInput(item);
  item.setName('');
  this.waitingForRealInput = false;
};

/**
 * Switch to show the fake canvas name field instead of the HTML input.
 *
 * @param {string} name The name that was typed into the HTML input element.
 */
HighScoreMenu.prototype.switchToFakeInput = function(name) {
  var item = this.highScoreItemObjects[this.newHighScoreIndex];
  if (!item) return;

  this.hideRealInput();
  item.setName(name);
  item.setMode('new-done');

  var dataItem = this.highScoreData[this.newHighScoreIndex];
  dataItem.name = name;
  delete dataItem.newScore;
};

module.exports = HighScoreMenu;
