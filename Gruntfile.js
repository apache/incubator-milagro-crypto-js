module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
		    options: {
				separator: ';'
			},
			mergeJs: {
				src: ['bower_components/amcl/js/DBIG.js','bower_components/amcl/js/BIG.js', 'bower_components/amcl/js/FP.js', 'bower_components/amcl/js/ROM.js', 'bower_components/amcl/js/HASH.js', 'bower_components/amcl/js/RAND.js', 'bower_components/amcl/js/AES.js', 'bower_components/amcl/js/GPM.js', 'bower_components/amcl/js/ECP.js', 'bower_components/amcl/js/FP2.js', 'bower_components/amcl/js/ECP2.js', 'bower_components/amcl/js/FP4.js', 'bower_components/amcl/js/FP12.js', 'bower_components/amcl/js/PAIR.js', 'bower_components/amcl/js/MPIN.js', 'bower_components/amcl/js/MPINAuth.js', 'lib/mpin.js'],
				dest: './dist/mpinjs.js'
			}
		},
		bgShell: {
			createDir: {
				cmd: "mkdir -p ./dist",
				options: {
	            	stdout: true
				}
			},
			test: {
				cmd: 'mocha',
				options: {
					stdout: true
				}
			},
			testCoverage: {
				cmd: 'mocha test --require blanket --reporter html-cov > test/coverage.html',
				options: {
					stdout: true
				}
			},
			bowerInstall: {
				cmd: 'bower install --allow-root',
				options: {
					stdout: true
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-bg-shell');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('build',  ['bgShell:createDir', 'bgShell:bowerInstall', 'concat']);
	grunt.registerTask('chk',  ['bgShell:createDir', 'bgShell:bowerInstall', 'concat']);
	grunt.registerTask('test',  ['bgShell:test']);
	grunt.registerTask('testCover',  ['bgShell:testCoverage']);
};