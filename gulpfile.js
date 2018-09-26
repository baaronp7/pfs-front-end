// Include the different modules to be used throughout the program 
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	prefix = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	jeditor = require("gulp-json-editor"),
	modifyFile = require('gulp-modify-file'),
	wcagAccess = require('gulp-wcag-accessibility'),
	config = require('./config.json'),
	eslint = require('gulp-eslint'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	buffer = require('vinyl-buffer'),
	browserify = require('gulp-browserify'),
	plumber = require('gulp-plumber'),
	changed = require('gulp-changed'),
	imagemin = require('gulp-imagemin'),
	debug = require('gulp-debug'),
	svgSprite = require('gulp-svg-sprite'),
	path = require('path'),
	glob = require('glob'),
	size = require('gulp-size');

// Transpile ES6 => ES5
const babel = require('gulp-babel');

const plumberErrorHandler = {
	errorHandler: notify.onError({
	  title: 'Gulp',
	  message: 'Error: <%= error.message %>'
	})
};

const paths = {
	scripts: './cartridges/pfs_front_end/cartridge/js/**/*.js',
	scriptsCompile: './cartridges/pfs_front_end/cartridge/js/*.js',
	jsOutput: './cartridges/pfs_front_end/cartridge/static/default/js',
	styles: './cartridges/pfs_front_end/cartridge/scss/*.scss',
	cssOutput: './cartridges/pfs_front_end/cartridge/static/default/css',
	images: './cartridges/pfs_front_end/cartridge/images/*.{jpg,jpeg,png,gif,svg}',
	imagesOutput: './cartridges/pfs_front_end/cartridge/static/default/images',
	svg: './cartridges/pfs_front_end/cartridge/svgs'
};

gulp.task('help', function () {
	console.log('\n\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\n\\* PFS Front-End Cartridge \\*\n\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\n');
	console.log('This cartridge contains all the front-end libraries PFS recommends.');
	console.log('The cartridge is totally configurable.');
	console.log('Run "gulp tasks" for more info on the tasks available.\n');
});

gulp.task('tasks', function () {
	console.log('\n\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\n\\* PFS Front-End Cartridge \\*\n\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\n');
	console.log('add-bootstrap - adds bootstrap reference to package.json and sets bootsrap json attribute to true in config.json (this tells sass task to compile cartridge/scss/bootstrap.scss)');
	console.log('add-fontawesome - adds fontawesome reference to package.json and adds scss reference to cartridge/scss/style.scss');
	console.log('add-swiper - adds swiper reference to package.json');
	console.log('copy-plugins - copys plugin folders from node-modules to cartridge/static/lib add parameter for the plugin you want to copy --bootsrap, --fontawesome, or --swiper\n');
});

gulp.task('add-bootstrap', function () {
	gulp.src("./package.json")
		.pipe(jeditor(function (json) {
			json.dependencies.bootstrap = "*";
			console.log("\nBootstrap has been added to the package.json.\nPlease run 'npm install'.\nThen run 'gulp --bootstrap --basedir YOURLOACLDIR copy-plugins'.")
			return json;
		}))
		.pipe(gulp.dest("./"));
});

gulp.task('add-fontawesome', function () {
	gulp.src("./package.json")
		.pipe(jeditor(function (json) {
			json.dependencies['font-awesome'] = "*";
			console.log("\nFontawesome has been added to the package.json.\nPlease run 'npm install'.\nThen run 'gulp --fontawesome --basedir YOURLOACLDIR copy-plugins'.")
			return json;
		}))
		.pipe(gulp.dest("./"));
	gulp.src('./cartridges/**/scss/style.scss')
		.pipe(modifyFile((content, path, file) => {
			const end = '\n@import "../cartridges/pfs_front_end/static/default/lib/font-awesome/scss/font-awesome.scss";'

			return `${content}${end}`
		}))
		.pipe(gulp.dest('./cartridges/**/scss/'))

});

gulp.task('add-swiper', function () {
	gulp.src("./package.json")
		.pipe(jeditor(function (json) {
			json.dependencies.swiper = "*";
			console.log("\nSwiper has been added to the package.json.\nPlease run 'npm install'.\nThen run 'gulp --swiper --basedir YOURLOACLDIR copy-plugins'.")
			return json;
		}))
		.pipe(gulp.dest("./"));

});

gulp.task('copy-plugins', function () {
	var copy = function (proj, folder) {
		console.log('./cartridges/' + proj + '/cartridge/static/default/lib');
		return gulp.src('node_modules/' + folder, {
			base: 'node_modules'
		}).pipe(gulp.dest('./cartridges/' + proj + '/cartridge/static/default/lib'));
	}

	if (process.argv.indexOf('--bootstrap') >= 0) {
		copy("pfs_front_end", 'bootstrap/dist/**/*');
		copy("pfs_front_end", 'bootstrap/scss/**/*');
	}
	if (process.argv.indexOf('--fontawesome') >= 0)
		copy("pfs_front_end", 'font-awesome/**/*');
	if (process.argv.indexOf('--swiper') >= 0)
		copy("pfs_front_end", 'swiper/dist/**/*');
	if (process.argv.indexOf('--bootstrap') < 0 && process.argv.indexOf('--fontawesome') < 0 && process.argv.indexOf('--swiper') < 0)
		console.log("No action taken please use arg --pluginname (Example: --bootstrap)");
});


gulp.task('sass', function () {
	var pathsArry = [paths.styles];
	var isBootstrap = (config.bootstrap === 'true');
	if(isBootstrap) {
		pathsArry.push('./cartridges/pfs_front_end/cartridge/scss/bootstrap/*.scss');
	}
	return gulp.src(pathsArry)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 5 versions'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.cssOutput));
});

//Create minified CSS version
gulp.task('minify', ['sass'], function () {
	return gulp.src(paths.styles)
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(paths.cssOutput));
});

gulp.task('lint', () => {
	return gulp
		.src([paths.scripts, '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('scripts', ['lint'], () => {
	return gulp.src(paths.scriptsCompile)
		.pipe(browserify())
		.pipe(debug())
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env']
			})
		)
		.pipe(
			uglify({
				mangle: {
					safari10: true
				}
			})
		)
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.jsOutput))
		.pipe(notify({
			message: 'Scripts task complete'
		}));
});

gulp.task('accessibility-test', () => {
	return gulp.src('').pipe(
		wcagAccess({
			accessibilityLevel: 'WCAG2AA',
			maxBuffer: 1048576,
			force: true,
			verbose: false,
			reportLevels: {
				notice: false,
				warning: false,
				error: true
			},
			forceUrls: true,
			urls: [`https://${config.url}`]
		})
	);
});

gulp.task('images', () => {
	return gulp
		.src(paths.images)
		.pipe(plumber(plumberErrorHandler))
		.pipe(changed(paths.imagesOutput)) // Ignore unchanged files
		.pipe(imagemin({
			optimizationLevel: 5
		})) // Optimize
		.pipe(gulp.dest(paths.imagesOutput))
		.pipe(notify({
			message: 'Images task complete'
		}));
});

gulp.task('build-sprite', () => {
	return gulp
		.src(paths.svg)
		.pipe(svgo())
		.pipe(
			svgSymbols({
				title: '%f icon',
				svgAttrs: {
					class: 'svg-icon-ilb'
				},
				slug: name => {
					return `la-icon-${name}`;
				},
				templates: ['default-svg']
			})
		)
		.pipe(concat('icon-sprite.svg.liquid'))
		.pipe(gulp.dest('./theme/snippets'));
});

gulp.task('svg', function () {
	var svgDest = paths.imagesOutput;
   
	function makeSvgSpriteOptions(dirPath) {
	  return {
		mode: {
		  symbol: {
			dest: '.',
			example: true,
			sprite: 'main.svg'
		  },
		}
	  };
	}
   
	return glob(paths.svg, function (err, dirs) {
	  dirs.forEach(function (dir) {
		gulp.src(path.join(dir, '*.svg'))
		  .pipe(svgSprite(makeSvgSpriteOptions(dir)))
		  .pipe(size({showFiles: true, title: svgDest}))
		  .pipe(gulp.dest(svgDest))
	  })
	}); 
	
   });

// Run the style tasks
gulp.task('styles', ['minify']);

// Run the Javascript tasks
gulp.task('js', ['scripts']);

// Run all tasks without deploy
gulp.task('default', ['styles', 'js', 'images', 'svg']);

gulp.task('watch', ['default'], function () {
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.scripts, ['js']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.svg, ['svg']);
})