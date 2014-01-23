/*
 * Gruntfile.js
 */

'use strict';

var path = require('path');
var project = require('./project');

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    project: project,
    cacheBust: {
      dist: {
        files: {
          src: [
            '<%= project.path.dist %>/index.html'
          ]
        }
      }
    },
    copy: {  // grunt-contrib-copy
      heroku: {
        src: '.gitignore-heroku',
        dest: '.gitignore'
      },
      github: {
        src: '.gitignore-github',
        dest: '.gitignore'
      },
      dev: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= project.path.bower %>',
            dest: '<%= project.path.dist %>/js/vendor',
            src: [
              'es5-shim/es5-shim.js',
              'json3/lib/json3.js',
              'modernizr/modernizr.js'
            ]
          },
          {
            expand: true,
            cwd: '<%= project.path.client %>',
            dest: '<%= project.path.dist %>',
            src: [
              'index.html'
            ]
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= project.path.bower %>',
            dest: '<%= project.path.dist %>/js/vendor',
            src: [
              'es5-shim/es5-shim.js',
              'json3/lib/json3.js',
              'modernizr/modernizr.js'
            ]
          },
          {
            expand: true,
            cwd: '<%= project.path.client %>',
            dest: '<%= project.path.dist %>',
            src: [
              'styles.css',
              '*.{ico,txt}'
            ]
          }
        ]
      }
    }
  });

  // Default
  grunt.registerTask('default', 'copy:dist');
};
