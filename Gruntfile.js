module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
		    options: {
				separator: ';'
			},
			mergeJs: {
				src: ['bower_components/milagro-crypto/js/DBIG.js','bower_components/milagro-crypto/js/BIG.js', 'bower_components/milagro-crypto/js/FP.js', 'bower_components/milagro-crypto/js/ROM.js', 'bower_components/milagro-crypto/js/HASH.js', 'bower_components/milagro-crypto/js/RAND.js', 'bower_components/milagro-crypto/js/AES.js', 'bower_components/milagro-crypto/js/GPM.js', 'bower_components/milagro-crypto/js/ECP.js', 'bower_components/milagro-crypto/js/FP2.js', 'bower_components/milagro-crypto/js/ECP2.js', 'bower_components/milagro-crypto/js/FP4.js', 'bower_components/milagro-crypto/js/FP12.js', 'bower_components/milagro-crypto/js/PAIR.js', 'bower_components/milagro-crypto/js/MPIN.js', 'bower_components/milagro-crypto/js/MPINAuth.js', 'lib/mpin.js'],
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