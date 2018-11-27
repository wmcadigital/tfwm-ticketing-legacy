module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                files: {
                    'css/compiled/ticketing.css' : 'css/sass/ticketing.scss'
                }
            }
        },
        postcss: {
            options: {
                // Task-specific options go here.
                processors:[
                    require('autoprefixer')({browsers: ['last 5 versions', 'ie 9','ie 11', '> 1% in GB']})
                ]
            },
            dist:{
                files: {
                    'css/compiled/ticketing.css' : 'css/compiled/ticketing.css'
                }
            }
        },
        uglify: {
            dev: {
                options: {
                    mangle: {
                        reserved: ['jQuery']
                    }
                },
                files: [{
                    expand: true,
                    src: ['app/*.js', '!app/*.min.js', 'app/live/*.js','!app/live/*.min.js'],
                    dest: '.',
                    cwd: '.',
                    rename: function (dst, src) {
                        // To keep the source js files and make new files as `*.min.js`:
                        return dst + '/' + src.replace('.js', '.min.js');
                        // Or to override to src:
                        // return src;
                    }
                }]
            }
        },
        watch: {
            options:{
                livereload: true
            },
            html: {
                files:['**/*.html']
            },
            css: {
                files: '**/css/sass/*.scss',
                tasks: ['sass','postcss']
            },
            scripts: {
                files: ['**/*.js', '!app/**/*.min.js'],
                tasks: ['uglify']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['watch']);
};