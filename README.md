# PFSWeb SalesForce Commerce Cloud Front-End Cartridge

## Why?

Gives developers tools and plugins to make their lives eaiser and enforce coding standards. Use this Cartridge as a template, if you need to add some plugins/tools thats fine but please keep in mind we want to follow company standards for all Front-End code.

In this document, we'll cover how [Gulp](https://gulpjs.com/), a popular, open-source task-runner, automates the following tasks for our SFCC projects:
* Script compression
* Style compression
* Images optimization
* Vector icon management
* Code linting
* Accessibility auditing

### Mandatory Installs

If you don't have `npm` installed, [install node.js](https://nodejs.org/en/download/).

Run `npm install` to install needed components

*** If you have problems getting install to compelet (i.e. installing node-sass) make sure you have xcode installed for Mac or a version of Visual Studios (recommend a free version of Visual Studtio Express)

### Include Wanted UI Plugins

The gulpfile includes task that adds certain UI Plugins to your package.json. Here is a list of the UI Plugins:
Bootstrap
Fontawesome
Swiper

Here's the commands you will want to run to add these:
`gulp add-bootstrap`
`gulp add-fontawesome`
`gulp add-swiper`

Once you have installed the UI Plugins run `npm install` agian

If you dont want to reference these lib files from node_modules (this is not recommended), we have added a gulp task to copy over the lib files you need for each UI Plugin to the 'cartridge/defualt/static/lib' folder. Run the following commands as needed:
`gulp copy-plugins --bootstrap`
`gulp copy-plugins --fontawesome` //also adds a reference to the style.scss file
`gulp copy-plugins --swiper`
    p.s. you can combine these arguments to run this command all at once

## IDE/Workspace Settings

Use whichever IDE you'd like. I use Visual Studio Code (VSC) and think it's superior to Sublime Text (which I had used for years, and loved), but your experience my differ. Essential tools, like Git and Emmet, are natively baked into the software. Another nice thing about VSC is that it monitors the kind of work you do and suggests useful extensions that make life easier. Here are my Workspace Settings within VSC. You'll want to install the following extensions (or something equivalent in your IDE):

* Shopify Liquid Template Snippets
* Prettier - Code formatter
* Liquid Language Support (highly recommended if you're working with Liquid files)
* Code Spell Checker (catches misspellings of English words in code)

```javascript
{
    "emmet.includeLanguages": {
        "liquid": "html"
    },
    "editor.rulers": [100],
    "window.zoomLevel": 0,
    "editor.minimap.enabled": false,
    "editor.formatOnSave": false,
    "[javascript]": {
        "editor.formatOnSave": true
    },    
    "javascript.format.enable": true,
    "prettier.singleQuote": true,
    "prettier.eslintIntegration": true,
    "prettier.tabWidth": 2,
    "editor.tabSize": 2,
    "editor.insertSpaces": true
}
```

## Script Compression

Take a look at the following files:
'cartridges/pfs_front_end/cartridge/js/test.js'
'cartridges/pfs_front_end/cartridge/js/test/test.js'

You will notice in 'cartridges/pfs_front_end/cartridge/js/test.js' on document ready we use the module exported from 'cartridges/pfs_front_end/cartridge/js/test/test.js'. I would suggest sticking with this stratigy. Our gulp task `gulp js` will browserify and minify any js in the root directory 'cartridges/pfs_front_end/cartridge/js/'. If you would like to bundle these files into one 'app.js' feel free to add a gulp task to do so.

## Style Compression

Take a look at the following files:
'cartridges/pfs_front_end/cartridge/scss/_variables.scss'
'cartridges/pfs_front_end/cartridge/scss/bootstrap.scss'
'cartridges/pfs_front_end/cartridge/scss/style.scss'

The gulpscript compiles 'cartridges/pfs_front_end/cartridge/scss/bootstrap.scss' and 'cartridges/pfs_front_end/cartridge/scss/style.scss' into '.css' and '.map' files and then creates a minified '.min.css' version.

## Images Optimization

First we should deal with the file size of the image itself. Although Shopify stores multiple (dimensional) sizes of the image, we should handle the initial optimization step locally, before the upload occurs. To accomplish this, we're using the [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) package, and have configured it to run whenever an image is added to the `lib/images` directory.

```js
gulp.task('images', () => {
  return gulp.src(paths.images)
    .pipe(plumber(plumberErrorHandler))
    .pipe(changed(paths.theme_assets))      // Ignore unchanged files
    .pipe(imagemin({optimizationLevel: 5})) // Optimize
    .pipe(gulp.dest(paths.theme_assets))
    .pipe(notify({ message: 'Images task complete' }));
});
```

We're off to a good start, but are not done yet. The last step is to serve an *appropriately sized* image given the user's context. For example, for a full-width banner image, we know we'll need to serve a large version of the image on desktop screens. For mobile, we don't want to serve the same, heavy image. This is where HTML5 `srcset` and `sizes` comes into play. 

Consider the following `include`, which uses a new snippet (`theme/snippets/la-image-sizer.liquid`). As a developer, you provide the sizes you think make the most sense given the screen size and the snippet handles the rest. The only required parameter (other than the `img`) is `medium_width`. The snippet will generate some reasonable defaults if only that parameter is provided.

Here, I've specified image sizes for the three contexts.

```
  {%
    include "la-image-sizer",
    img: section.settings.image,
    large_width: 1200,
    medium_width: 1024,
    small_width: 768
  %}
``` 

Our snippet looks at our desired sizes and generates `srcset` values for them. This provides the browser with a handful of choices regarding the best image to choose. The snippet also handles retina screen situations, since the browser takes into account the pixel density of the screen and chooses the best option to serve based on the `srcset` options. Have a look at the sample output. Because the original image uploaded to the store was very large (5272 pixels wide), the script can generate all of our retina sizes as well, adding them to the `srcset` list. **Note: If the original image was not more than double our desired output widths, the retina entries won't be generated.**. Finally, our `sizes` attribute instructs the browser how to select the image sizes we initially passed in as arguments to the include. The last value in `sizes` is the default size, if none of the other conditions are met.

```html
<img 
  src="//cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_1200x.jpg?v=1523557242" 
  alt=""
  srcset="//cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_768x.jpg?v=1523557242 768w, //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_1536x.jpg?v=1523557242 1536w,
     //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_1024x.jpg?v=1523557242 1024w, //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_2048x.jpg?v=1523557242 2048w,
     //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_1200x.jpg?v=1523557242 1200w, //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_2400x.jpg?v=1523557242 2400w,
     //cdn.shopify.com/s/files/1/0020/6435/1295/files/two_sheep_5472x.jpg?v=1523557242 5472w" 
  sizes=" (max-width:768px) 768px, (max-width:1024px) 1024px, 1200px">
```

This offers a lot of value for end-users, who are not concerned with optimized images. End-users should be able to upload gigantic, beautiful images to their stores without fear of ruining their customer's experience in low-bandwidth environments.

## Vector Icon Management

For icons, the Scalable Vector Graphic, or `SVG` is the way to go. Unlike the `PNG`, vectors scale endlessly with no loss in quality. This means we only need one version of the graphicâ€”and not a 2x and 3x version. One argument against `SVG` for icon systems is that it's hard to maintain and keep organized. With some more Gulp magic, we'll prove that this argument to be invalid. Let's examine the task.

```js
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
```

Here are the important takeaways:
1. Our sprite is outputted to `theme/snippets/icon-sprite.svg.liquid`
2. The `title` of each symbol comes from the name of the `SVG` we transformed into a symbol. For example, if we transform `twitter.svg`, our Gulp task will output something like this:

```html
<svg class="svg-icon-ilb" xmlns="http://www.w3.org/2000/svg">
  <symbol id="la-icon-facebook" viewBox="0 0 16.98 32">
  <title>facebook icon</title>
  ... path info ...
</svg>
```

Unlike our other automatic tasks, we'll trigger this one manually.

**Note: The following steps have already been completed in this repository, and explain how things should work for new projects.** 

Drag the original `SVG` file(s) into our `lib/svg` directory.

Build the sprite:

```
$ gulp build-sprite
```

Include the icon symbols in `theme.liquid`, just after the start of `<body>`.

```js
{% include 'icon-sprite.svg' %}
```

Include some `SVG`-related styles:

```scss
// lib/scss/_svg-icons.scss
// * Our sprite is visually hidden
// * Icons have a reasonable starting size. Sizes can be overridden.
// * Icons inherit colors from their parent using `currentColor`

.svg-icon-ilb {
  @include visually-hidden;
}

// Default icons styles
.la-icon {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 19px;
  height: 18px;
}

path {
  fill: currentColor;
}
```

In `theme/snippets` is a file named `la-symbol.liquid`. We're passing the name of the icon and it does the rest for us, printing the icon to the screen.

```html
<svg class="la-icon la-icon-{{la-symbol}}">
  <use xlink:href="#la-icon-{{la-symbol}}" />
</svg>

<!-- Sample Usage 
  {% include 'la-symbol' with 'twitter' %}
-->
```

Print a symbol to the screen using `JavaScript`:

```js
// Create a namespaced utility function in theme.liquid
theme.utils = {};
theme.utils.addSymbol = function(fileName) {
  return (
    '<svg class="la-icon la-icon-' + fileName + '"><use xlink:href="#la-icon-' + fileName + '" /></svg>'
  );
};

/* Sample call
  theme.utils.addSymbol('twitter');
*/
```

With a little work and a solid bridge between designers and developers, we can have a core set of beautiful, scalable icons that are reusable across multiple projects.

## Code Linting

To maintain a great reputation in the industry and a strong rapport with customers, our JavaScript should never be shipped with obvious bugs. To keep our code clean and our customers happy, we need to lint our JavaScript. Every time we save our code, Gulp runs a check. If our code passes the lint tests, the upload continues. Otherwise, a helpful error is thrown in the console. The error explains which file and line number the error(s) occurred. Here's the task:

```js
gulp.task('lint', () => {
  return gulp.src([paths.scripts,'!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
```

Notice that `node_modules` is excluded from our linting path. Also purposely absent from the lint is our `lib/js/plugins` directory. We can't control the quality of third-party code (and should be mindful when deciding to use it). We can only control our code, which is why the lint looks only ay the code we write. For a full list of linting rules we enforce, refer to `.eslintrc`, located in the root directory of the project.

## Uploading to Shopify

At the top of our `gulpfile.js`, we store our configuration data which lives in `config.json`.

```js
const config = require('./config.json');
```

Now we can use those values when authenticating during our upload request.

```js
gulp.task('shopifyWatch', () => {
  const options = { 'basePath': './theme/' };

  return watch([
    './theme/**',
    '!./theme/config/settings_data.json',
    '!./theme/assets/plugins.js'
    ])
    .pipe(plumber(plumberErrorHandler))
    .pipe(gulpShopify(
      config.api_key,
      config.api_password,
      config.url,
      config.theme_id,
      options
    ))
    .pipe(notify({ message: 'Upload complete' }));
});
```

Notice how we exclude `settings_data.json` from the upload. This file should be edited on the server and not overwritten by our local changes.

## Live Reloading Sass
 
Shopify code exists on a remote server, which makes live reloading our `sass` changes a bit trickier than opening `localhost:3000` and starting a `node` server. Actually, with Gulp and [Browsersync](https://browsersync.io/docs/gulp), we *can* have this. First, we'll add a new task to our `gulpfile.js`:

```javascript
gulp.task('server', () => {
  return browserSync.init({
    proxy: `https://${config.url}`
  });
});
```

Then, we'll make our `shopifyWatch` task (discussed above) dependent on our `server` task finishing.

```javascript
gulp.task('shopifyWatch', ['server'], () => { ... });
```

Our final step is to stream our `sass` changes after the changes are compiled:

```javascript
gulp.task('styles', () => {
  return gulp
    .src(paths.styles)
    ...
    .pipe(browserSync.stream())
    .pipe(notify({message: 'Styles task complete'}));
});
```

If everything is working, a new browser tab will open, pointing to `https://localhost:3000/`. If you do not have your `localhost` set up for `https`, you might have to add the current `URL` as an exception or [configure your local environment to run https](https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec). 

## Accessibility Auditing

Last, and certainly not least, we must ensure our apps are accessible. Currently, there is no full-proof, automated strategy to catch every possible accessibility violation. However, with the following task, we're going to provide a decent amount of coverage for users. This task should be run manually and frequently throughout the life cycle of the project. Don't leave accessibility last.

```javascript
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
```

Running the task...

```
$ gulp accessibility-test
Starting 'accessibility-test'...
```

It completes! 

```
Generated Report at :  reports/html
```

The results are generated locally and output in an easy-to-read `HTML` table. 

## Resources

* [ES6 For Beginners](https://codeburst.io/es6-tutorial-for-beginners-5f3c4e7960be)
* [Understanding SVG Symbols](https://css-tricks.com/svg-symbol-good-choice-icons/)
* [Accessibility Primer](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML)
* [Liquid Cheat Sheet](https://www.shopify.com/partners/shopify-cheat-sheet)
* [Srcset and sizes](https://ericportis.com/posts/2014/srcset-sizes/)