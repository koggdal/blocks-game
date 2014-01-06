/**
 * @module Dashboard
 */
'use strict';

var EventEmitter = require('./EventEmitter');
var inherit = require('./utils/inherit');

/**
 * @classdesc Dashboard class for rendering game play information.
 *
 * @property {module:Canvas~Canvas} canvas The Canvas instance used for
 *     rendering.
 * @property {number} height The height of the dashboard, in canvas pixels.
 * @property {Object} canvasObject The oCanvas object for the dashboard.
 * @property {Object} pauseButton The oCanvas object for the pause button.
 * @property {Object} levelTitle The oCanvas object for the level title.
 * @property {Object} scoreText The oCanvas object for the score.
 * @property {Object} timer The oCanvas object for the timer.
 * @property {number} totalTime The total time for a level, used by the timer.
 *
 * @constructor
 * @augments {module:EventEmitter~EventEmitter}
 *
 * @param {module:Canvas~Canvas} canvas A Canvas instance.
 */
function Dashboard(canvas) {
  EventEmitter.call(this);

  this.canvas = canvas;
  this.height = canvas.dpr * 40;
  this.canvasObject = this.createDashboardObject();
  this.pauseButton = this.createPauseButton();
  this.levelTitle = this.createLevelTitle();
  this.scoreText = this.createScoreText();
  this.timer = this.createTimer();
  this.totalTime = 1;
}
inherit(Dashboard, EventEmitter);

/**
 * Create a renderable wrapper object for the whole dashboard.
 *
 * @return {Object} An oCanvas object for the dashboard background.
 */
Dashboard.prototype.createDashboardObject = function() {
  var stage = this.canvas.stage;
  var object = stage.display.rectangle({
    width: stage.width,
    height: this.height,
    fill: '#ddd'
  });
  return object;
};

/**
 * Create a renderable object for the pause button. This will also set up event
 * handlers for press state and click events.
 *
 * @return {Object} An oCanvas object for the pause button.
 */
Dashboard.prototype.createPauseButton = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var dashboard = this.canvasObject;

  var offset = this.height / 5;
  var pauseButtonHeight = offset * 3;
  var lineWidth = Math.round(offset / 1.2);

  var object = stage.display.rectangle({
    width: this.height, height: this.height,
    opacity: 0
  });
  var line1 = stage.display.rectangle({
    x: Math.round(offset + lineWidth / 4), y: offset,
    width: lineWidth,
    height: pauseButtonHeight,
    fill: '#222'
  });
  var line2 = stage.display.rectangle({
    x: Math.floor(offset + lineWidth * 2), y: offset,
    width: lineWidth,
    height: pauseButtonHeight,
    fill: line1.fill
  });
  var play = stage.display.polygon({
    x: object.width / 2 - offset / 5, y: object.height / 2,
    sides: 3,
    radius: pauseButtonHeight / 2,
    fill: line1.fill,
    opacity: 0
  });
  object.addChild(play);
  object.addChild(line1);
  object.addChild(line2);

  dashboard.addChild(object);

  var self = this;
  object.bind('click tap', function() {
    self.emit('click-pause-resume');
  });
  var pressed = false;
  object.bind('mousedown touchstart', function() {
    pressed = true;
    line1.fill = line2.fill = play.fill = '#444';
    canvas.requestRender();
  });
  stage.bind('mouseup touchend', function() {
    if (!pressed) return;
    pressed = false;
    line1.fill = line2.fill = play.fill = '#222';
    canvas.requestRender();
  });

  this.on('pause-game', function() {
    line1.opacity = 0;
    line2.opacity = 0;
    play.opacity = 1;
    canvas.requestRender();
  });
  this.on('resume-game', function() {
    play.opacity = 0;
    line1.opacity = 1;
    line2.opacity = 1;
    canvas.requestRender();
  });
  this.on('stop-level', function() {
    line1.opacity = 0;
    line2.opacity = 0;
    play.opacity = 1;
    canvas.requestRender();
  });

  return object;
};

/**
 * Create a renderable object for the level title.
 *
 * @return {Object} An oCanvas object for the level title.
 */
Dashboard.prototype.createLevelTitle = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var dashboard = this.canvasObject;

  var levelValue = 1;

  var object = stage.display.text({
    x: dashboard.width / 2,
    y: dashboard.height / 2,
    origin: {x: 'center', y: 'center'},
    align: 'center',
    fill: '#222',
    text: 'Level ' + levelValue,
    font: (dpr * 28) + 'px ' + canvas.font,
    opacity: 0
  });
  dashboard.addChild(object);

  return object;
};

/**
 * Create a renderable object for the score.
 *
 * @return {Object} An oCanvas object for the score text.
 */
Dashboard.prototype.createScoreText = function() {
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var dashboard = this.canvasObject;

  var scoreValue = 0;

  var object = stage.display.text({
    x: dashboard.width - dpr * 10,
    y: dashboard.height / 2,
    origin: {x: 'right', y: 'center'},
    align: 'right',
    fill: '#222',
    text: scoreValue,
    font: (dpr * 28) + 'px ' + canvas.font,
    opacity: 0
  });
  dashboard.addChild(object);

  return object;
};

/**
 * Create a renderable object for the timer.
 *
 * @return {Object} An oCanvas object for the timer.
 */
Dashboard.prototype.createTimer = function() {
  var self = this;
  var canvas = this.canvas;
  var stage = canvas.stage;
  var dpr = canvas.dpr;
  var dashboard = this.canvasObject;

  var background = stage.display.rectangle({
    y: dashboard.height,
    width: stage.width,
    height: dpr * 5,
    fill: '#ccc'
  });
  dashboard.addChild(background);

  var timer = stage.display.rectangle({
    width: 0,
    height: background.height,
    fill: '#0bb',
    setValue: function(value) {
      this.width = background.width * value;
    }
  });
  background.addChild(timer);

  return timer;
};

/**
 * Show the pause button.
 */
Dashboard.prototype.showPauseButton = function() {
  this.pauseButton.opacity = 1;
  this.canvas.requestRender();
};

/**
 * Hide the pause button.
 */
Dashboard.prototype.hidePauseButton = function() {
  this.pauseButton.opacity = 0;
  this.canvas.requestRender();
};

/**
 * Show the info (level and score).
 */
Dashboard.prototype.showInfo = function() {
  this.levelTitle.opacity = 1;
  this.scoreText.opacity = 1;
};

/**
 * Hide the info (level and score).
 */
Dashboard.prototype.hideInfo = function() {
  this.levelTitle.opacity = 0;
  this.scoreText.opacity = 0;
};

/**
 * Set the level text to a new level.
 *
 * @param {number} level The new level.
 */
Dashboard.prototype.setLevel = function(level) {
  this.levelTitle.text = 'Level ' + level;
};

/**
 * Set the score text to a new score.
 *
 * @param {number} score The new score.
 */
Dashboard.prototype.setScore = function(score) {
  this.scoreText.text = score;
};

/**
 * Update the timer progress.
 *
 * @param {number} progress The new progress, number between 0 and 1.
 */
Dashboard.prototype.setTimerProgress = function(progress) {
  this.timer.setValue(progress);
  this.canvas.requestRender();
};

module.exports = Dashboard;
