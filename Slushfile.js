/**
 * slush-simbo
 * ===========
 * https://github.com/simbo/slush-simbo
 *
 * Copyright © 2015 Simon Lepel <simbo@simbo.de>
 * Licensed under the MIT license.
 */

'use strict';


// required modules
var gulp      = require('gulp'),
    generator = require('./lib/generator.js');


// register gulp task
gulp.task('default', generator.task.bind(generator, gulp));
