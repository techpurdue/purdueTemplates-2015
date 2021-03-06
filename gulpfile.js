// Include gulp and gulp 
var gulp = require('gulp'),
    //general
    ifelse = require('gulp-if-else'),
    connect = require('gulp-connect'),
    //html
    fileinclude = require('gulp-file-include'),
    htmlPrettify = require('gulp-html-prettify'),
    //css
	sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    //async
    async = require('async');

//initiate variables
var env,
	htmlSources,
	scssSources,
	outputDir;

//retrieve environment variable. 'development' by default
env = process.env.NODE_ENV || 'development';

var devOutputDir = 'builds/development/',
    prodOutputDir = 'builds/production/';

//set the output directory based on enviroment variable
if(env==='development')
{ //node environment variable  set to development
	outputDir = 'builds/development/'; //set ouput directory to development
}
else
{ //node environment variable is not set to development
	outputDir = 'builds/production/'; //set output directory to production
}

componentSources = ['components/**/*'];
htmlSources = ['components/html/templates/**/*.html'];
templateSources = ['components/html/modules/**/*.html'];
scssSources = ['components/css/**/*.scss'];

//HTML task
gulp.task('html', function(){
    async.series([
        function(next)
        {
            gulp.src(htmlSources)
                .pipe(fileinclude({
                  prefix: '@@',
                  basepath: '@file'
                }))
                .pipe(htmlPrettify({indent_char:' ',indent_size:4}))
                .pipe(gulp.dest(outputDir+'templates/'))
                .on('end',next);
        },
        function(next)
        {
            gulp.src(componentSources)
                .pipe(connect.reload());
        }
    ])
});

gulp.task('sass', function(){
    async.series([ //development build functions
        function(next)
        {
            gulp.src(scssSources)
                .pipe(sourcemaps.init())
                .pipe(sass({outputStyle:'expanded'}).on('error',sass.logError))
                .pipe(sourcemaps.write('./sourcemaps'))
                .pipe(gulp.dest(devOutputDir+'css/'))
                .on('end',next);

        },
        function(next)
        {
            gulp.src(componentSources)
                .pipe(ifelse(env === 'development',
                    function(){
                        return connect.reload()
                    }
                ));
        }
    ]);
    async.series([ //production builds functions
        function(next)
        {
            gulp.src(scssSources)
                .pipe(sass({outputStyle:'compressed'}).on('error',sass.logError))
                .pipe(gulp.dest(prodOutputDir+'css/'))
                .on('end',next);

        },
        function(next)
        {
            gulp.src(componentSources)
                .pipe(ifelse(env === 'production',
                    function(){
                        console.log('reload');
                        return connect.reload()
                    }
                ));
        }
    ]);
});

gulp.task('watch', function() {
    gulp.watch(htmlSources,['html']);
    gulp.watch(templateSources,['html']);
    gulp.watch(scssSources,['sass']);
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    });
});

// Default Task
/*gulp.task('default', ['fileinclude','html','lint','css','scripts','watch']);*/

gulp.task('default',['html','sass','connect','watch']);