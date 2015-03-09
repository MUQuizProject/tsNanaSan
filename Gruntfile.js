module.exports = function  (grunt) {
	grunt.initConfig({
		typescript: {
			main: {
				src: ['ts/Main.ts'],
				dest: 'js/Main.js',
				options: {
					noImplicitAny: true,
					module: 'commonjs',
					target: 'es5',
					comments: true
				}
			}
		},

		sass: {
			options: {
				style: 'compressed',
				sourcemap: true,
				noCache: true
			},
			styles: {
				src: ['sass/style.scss'],
				dest: 'css/style.css'
			}
		}
	});

	grunt.registerTask(
		"default",
		"Compile the typescript codes and SASS files",
		["typescript:main","sass"]);

	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-sass');
};