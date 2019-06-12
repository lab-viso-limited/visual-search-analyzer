module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-nw-builder');
  grunt.registerTask('default', ['nwjs']);
  
  grunt.initConfig({
    nwjs: {
      options: {
        macIcns: './src/icon/icon.icns',
        winIco: './src/icon/icon.ico',
        platforms: ['osx64','win64'],
        buildDir: '../Release/2.0.0',
        cacheDir: '../Cache',
        version: '0.12.3'
      },
      src: ['./src/**']
    }
  });
};
