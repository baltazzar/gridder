module.exports = function (grunt) {
	require('jit-grunt')(grunt);

	var path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: [
			'/**\n',
			' * Baltazzar <%= pkg.name %>\n',
			' * Versão: <%= pkg.version %>\n',
			' * <%= pkg.description %>\n',
			' * Autor: BaltazZar Team\n',
			' */\n\n'
		].join(''),
		livereloadPort : 4000,
		connect: {
			server: {
				options: {
					hostname: '*',
					port: 3000,
					livereload: '<%= livereloadPort %>',
					open: 'http://localhost:3000/test/index.html'
				}
			}
		},
		docco: {
			debug: {
				src: ['src/**/*.js'],
				options: {
					output: 'docs/'
				}
			}
		},
		jshint: {
			options: {
				'-W030': true,
				'-W061': true,
				'-W116': true,
				'-W041': true,
				'-W069': true
			},
			files: ['src/**/*.js', '!src/templates.js']
		},
		watch: {
			files: {
				files: ['test/**/*', 'dist/**/*'],
				options: {
					livereload: '<%= livereloadPort %>'
				}
			},
			dist: {
				files: ['src/**/*.js'],
				tasks: ['browserify']
			}
		},
		browserify: {
			dist: {
				src: ['src/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js',
				options: {
					debug: true,
					bundleOptions: {
						standalone: 'baltazzar.<%= pkg.name %>'
					}
				}
			}
		}
	});

	grunt.registerTask('build', ['docco', 'jshint', 'browserify']);
	grunt.registerTask('dev', ['browserify', 'connect', 'watch']);
	grunt.registerTask('default', ['build']);
};