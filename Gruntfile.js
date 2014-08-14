'use strict';

var pathogen = require('pathogen');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    exec: {
      'quickstart-dev': {
        cmd: function() {
          return pathogen.sys('./node_modules/.bin/quickstart') + ' --self > ./main.js';
        }
      },
      'quickstart-prod': {
        cmd: function() {
          return pathogen.sys('./node_modules/.bin/quickstart') + ' --compress > ./main.js';
        }
      },
      'jsdoc': {
        cmd: function() {
          var commands = [
            'jsdoc -r source -d docs',
            'echo "\nJSDoc Documentation is now created in docs/"',
            'echo "\nRun \\`http-server docs\\` and open your browser to localhost:<port>"'
          ];
          return commands.join(' && ');
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', [
    'exec:quickstart-prod'
  ]);

  grunt.registerTask('dev', [
    'exec:quickstart-dev'
  ]);

  grunt.registerTask('prod', [
    'exec:quickstart-prod'
  ]);

  grunt.registerTask('jsdoc', [
    'exec:jsdoc'
  ]);

};
