# Blocks

Blocks is a simple game made with the help of the canvas library [oCanvas](http://ocanvas.org) (which is also written by me, [Johannes Koggdal](https://github.com/koggdal)).

## Game Play

The game is very simple in its nature. Blocks are falling from the top of the screen, and your task is to click on the good blocks that give you more points. You should get as high score as possible after 10 levels. Clicking on bad blocks removes some points from your score. The blocks will fall faster and faster as time goes by. If you fail to click a good block and it falls into the danger zone, the speed will increase slightly.

## Platforms

The game runs in the browser, but in a fixed size box (320x548), so you need a browser window at least that size. It is especially good on an iPhone 5, because of the tall retina display. If you run it on an iPhone, make sure you run it from the home screen and not from Safari (to get it fullscreen). The game supports mouse or touch, and has keyboard support for pause (letter 'p').

## Development

### Installation

If you want to run the game from the source, follow these steps:

1. Clone this repo.

        git clone https://github.com/koggdal/blocks-game.git


2. Install dependencies (installation requires [node.js and npm](http://nodejs.org/)).

        npm install

3. Build main file. (Requires grunt to be [installed globally](http://gruntjs.com/getting-started#installing-the-cli)).

        grunt prod

4. Run the game. Serving the game files can be done with a simple server like with the npm package [http-server](https://npmjs.org/package/http-server). Run it in the browser by going to http://localhost:8080.

        http-server -p 8080


### Run game with code changes

If you make changes to the code and want to see them in the game, you need to build the main file in dev mode:

    grunt dev

Then you reload the browser and see the changes. The grunt build steps use a build tool called QuickStart (not officially released yet). It has the ability to build a CommonJS project into a single JS file, but it can also build it all at runtime in the browser. The `prod` mode builds it in node.js and the `dev` mode builds it when running it in the browser. In the dev mode, the main.js file is a starter for QuickStart itself so it can start building the game, and finally run it. This means you run the `grunt dev` command to get the correct main.js file, and then make changes and see them immediately on browser reload.

### Generate documentation based on JSDoc

All of the code is annotated with JSDoc, which means you can generate a documentation site. This requires [JSDoc](https://github.com/jsdoc3/jsdoc/) to be installed on your machine. When you want to generate documentation, just run:

    grunt jsdoc


### Code Structure

The game is made with some classes that create the different parts of the game, and then a game controller that controls all of the game logic and user flows.

The entry point is `source/index.js`, which imports all the classes and passes them to a new game controller. The game controller puts together all the parts of the app and interacts with the parts when changes happen in the game.

When something is rendered to the canvas, an [oCanvas display object](http://ocanvas.org/docs/Display-Objects) is created and later interacted with.
