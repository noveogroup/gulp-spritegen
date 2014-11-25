# [gulp](http://gulpjs.com)-spritegen

### Requirements
* [Cairo](https://github.com/Automattic/node-canvas/wiki)

### Options
* `{String|Array<String>} ratio` List of required ratios. Each output sprite identified by ratio(e.g. `icons@2x.png` for ratio: `2`)
* `{String} spriteImg` Name of output image.
* `{String} spriteMeta` Name of file contains stylesheets for sprites.
* `{Integer} gutter` Size of frame around each of inputs image in final sprite.
* `{String} algorithm` [Algorithm for laying](https://github.com/twolfson/layout) inputs images in final sprite.
* `{String|Function} engine` Engine which used for create stylesheets for sprites.

### Engines
Plugin have following default engines:
* `css` (Using CSS as stylesheet for sprites)
* `less` (Using LESS as stylesheet for sprites)
* `scss` (Using SCSS as stylesheet for sprites)

### Restrictions
* All files which you piped to this plugin should be an image and have PNG format.
* All files which you piped to this plugin should have one of the following formats:
  * `myImage-30x35.png` (where: `30` - width, `35` - height)
  * `myImage-30.png` (where: `30` - width, height calculates automatically)
  * `myImage-x35.png` (where: `35` - height, width calculates automatically)

> Size which you define in filename means size of that image **for ratio equals to one**. Best practice is creating image with big size(e.g. 1024x1024) with name containing small size(e.g. 128x128).

### Examples
Simple usage:

```js
gulp.src('./images/icons/*.png')
  .pipe(spritegen({
    ratio: [1, 2],
    spriteImg: 'icons',
    spriteMeta: 'incons'
    engine: 'css'
  }))
  .pipe(gulp.dest('./dest'));
```

As a result you can see in `./dest` directory following files: `icons@1x.png`, `icons@2x.png`, `icons.css`

## License

MIT
