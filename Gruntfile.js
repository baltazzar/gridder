module.exports = function (grunt) {
	require('jit-grunt')(grunt);

	var path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner: [
			'/**\n',
			' * Baltazzar Gridder %>\n',
			' * Versão: <%= pkg.version %>\n',
			' * <%= pkg.description %>\n',
			' * Autor: BaltazZar Team\n',
			' */\n'
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
				src: ['src/**/*.js', '!src/libs/**/*.js'],
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
			files: ['src/**/*.js', '!src/libs/**/*.js']
		},
		watch: {
			test: {
				files: ['test/**/*'],
				options: {
					livereload: '<%= livereloadPort %>'
				}
			},
			src: {
				files: ['src/**/*.js', '!src/libs/**/*.js'],
				tasks: ['browserify:dev'],
				options: {
					livereload: '<%= livereloadPort %>'
				}
			}
		},
		browserify: {
			dev: {
				src: ['src/<%= pkg.name %>.js'],
				dest: '<%= pkg.name %>.js',
				options: {
					alias: ['jquery.js:jquery', 'underscore.js:underscore', 'backbone.js:backbone', 'backbone-deep-model.js:backbone-deep-model'],
					bundleOptions: {
						standalone: 'baltazzar.<%= pkg.name %>'
					}
				}
			},
			dist: {
				src: ['src/<%= pkg.name %>.js'],
				dest: '<%= pkg.name %>.js',
				options: {
					external: ['jquery', 'underscore', 'backbone'],
					bundleOptions: {
						standalone: 'baltazzar.<%= pkg.name %>'
					}
				}
			}
		}
	});

	grunt.registerTask('dev', ['browserify:dev', 'connect', 'watch']);
	grunt.registerTask('default', ['dev']);
	grunt.registerTask('build', ['docco', 'jshint', 'browserify:dist', 'banner']);
	grunt.registerTask('banner', function() {
		var banner = grunt.config.get('banner'),
			fileContent = grunt.file.read('gridder.js');

		grunt.file.write('gridder.js', banner + fileContent);
	});
};