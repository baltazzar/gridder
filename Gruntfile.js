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
		},
		uglify: {
			'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
		}
	});

	grunt.registerTask('dev', ['browserify', 'connect', 'watch']);
	grunt.registerTask('default', ['dev']);
	grunt.registerTask('build', ['docco', 'jshint', 'browserify', 'uglify', 'banner']);
	grunt.registerTask('banner', function() {
		var banner = grunt.config.get('banner'),
			fileContent = grunt.file.read('dist/gridder.js'),
			minFileContent = grunt.file.read('dist/gridder.min.js');

		grunt.file.write('dist/gridder.js', banner + fileContent);
		grunt.file.write('dist/gridder.min.js', banner + minFileContent);
	});

};