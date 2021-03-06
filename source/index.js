// Imports
var GameController = require('./GameController');
var Canvas = require('./Canvas');
var Menu = require('./Menu');
var HighScoreMenu = require('./HighScoreMenu');
var Dashboard = require('./Dashboard');
var GameArea = require('./GameArea');
var BlockController = require('./BlockController');
var SoundManager = require('./SoundManager');
var iphone = require('./utils/iphone');

if (iphone.isSafariApp) {
  var safariInstructions = document.getElementById('safari-instructions');
  safariInstructions.className = 'active';

} else {

  // The controller will hold all the game flow logic
  var controller = new GameController();

  // Tell the controller about the canvas where the game is rendered
  var canvas = controller.canvas = new Canvas('#canvas');
  var optimalHeightDiff = canvas.optimalHeight - canvas.height;

  // Create the three menus needed in the game:
  // mainMenu: Displayed when the game is launched.
  // pauseMenu: Displayed when the game is paused.
  // continue: Displayed when the time is up for a level.
  controller.mainMenu = new Menu({
    canvas: canvas,
    id: 'main',
    title: 'Blocks',
    offset: 50,
    items: [
      ['play', 'Play', '#0aa', '#2cc'],
      ['high-scores', 'High Scores', '#222', '#444']
    ]
  });
  controller.pauseMenu = new Menu({
    canvas: canvas,
    id: 'pause',
    title: 'Paused',
    offset: 40,
    items: [
      ['resume', 'Resume', '#0aa', '#2cc'],
      ['restart', 'Restart', '#a22', '#c44', 40 - Math.round(optimalHeightDiff / 4)],
      ['main-menu', 'Main Menu', '#222', '#444', 70 - Math.round(optimalHeightDiff / 2)]
    ]
  });
  controller.continueMenu = new Menu({
    canvas: canvas,
    id: 'continue',
    title: 'Time\'s Up',
    subtitle: '',
    offset: optimalHeightDiff / 8,
    items: [
      ['continue', 'Next Level', '#0aa', '#2cc', 20 + Math.round(optimalHeightDiff / 5)],
      ['restart', 'Restart', '#a22', '#c44', 50 - Math.round(optimalHeightDiff / 20)],
      ['main-menu', 'Main Menu', '#222', '#444', 80 - Math.round(optimalHeightDiff / 4)]
    ]
  });
  controller.highScoreMenu = new HighScoreMenu(canvas);

  // The controller needs to know about the dashboard
  controller.dashboard = new Dashboard(canvas);

  // The controller needs to know about the game area
  controller.gameArea = new GameArea(canvas);

  // The controller needs to know about the block controller to spawn new blocks
  controller.blockController = new BlockController(canvas);

  // The controller needs to know about the sound manager to control the sounds
  controller.soundManager = new SoundManager();

  // The controller now knows all about the game, so let's roll!
  controller.initializeGame();
}
