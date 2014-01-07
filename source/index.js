// Imports
var GameController = require('./GameController');
var Canvas = require('./Canvas');
var Menu = require('./Menu');
var Dashboard = require('./Dashboard');
var GameArea = require('./GameArea');
var BlockController = require('./BlockController');

// The controller will hold all the game flow logic
var controller = new GameController();

// Tell the controller about the canvas where the game is rendered
var canvas = controller.canvas = new Canvas('#canvas');

// Create the three menus needed in the game:
// mainMenu: Displayed when the game is launched.
// pauseMenu: Displayed when the game is paused.
// continue: Displayed when the time is up for a level.
controller.mainMenu = new Menu(canvas, 'main', 'Blocks', [
  ['play', 'Play', '#0aa', '#2cc']
]);
controller.pauseMenu = new Menu(canvas, 'pause', 'Paused', [
  ['resume', 'Resume', '#0aa', '#2cc'],
  ['restart', 'Restart', '#a22', '#c44', 40]
]);
controller.continueMenu = new Menu(canvas, 'continue', 'Time\'s Up', [
  ['continue', 'Next Level', '#0aa', '#2cc'],
  ['restart', 'Restart', '#a22', '#c44', 40]
]);

// The controller needs to know about the dashboard
controller.dashboard = new Dashboard(canvas);

// The controller needs to know about the game area
controller.gameArea = new GameArea(canvas);

// The controller needs to know about the block controller to spawn new blocks
controller.blockController = new BlockController(canvas);

// The controller now knows all about the game, so let's roll!
controller.initializeGame();
