# blessify
### browserify transform for require('something.less')

This came from being inspired but at the same time disappointed with lessify/node-lessify; it works well, but has some use cases where i needed to change it so i decided to create one that fits my needs.
The goal is to be able to require less files from whatever browserify module.
Let's take this example

```
- app  
  - modules
    - some-module
      - index.html
      - index.js  
      - style.less  
  - index.html  
  - index.js
  - global.less
- node_modules
- package.json
```

#### The Problem:  
Your application will bundle with one or more modules and will include global.less either through a require in index.js or an @import in style.less.  
You also want to be able to run every module in isolation so each module will also have to include global.less for compilation.  
Lessify inserts style tags to the head of the HTML document but global.less gets included multiple times when you compile app/index.js which bloats the js bundle.
This also leads for if you @import global.less from other less files, it won't be watched when you run watchify.

#### The Solution  
I wrote this browserify transform that is extended with:
* blessify.render: method that returns a promise fulfilled with the less output

The transform parses all the less files in a consistent way, and buffers them until the JS compilation is successful.
I expose a render method that will render the less with no such caveats and returns a promise with the result of the compilation.

#### Usage  
```
$ npm install blessify
```
```javascript
var browserify = require('browserify')
  , Blessify = require('blessify');

var wStream = fs.createWriteStream('path/to/bundle.js');
var b = browserify();
var blessify = new Blessify(options);
b.transform(blessify.transform, options);
b.add('path/to/index.js');
b.bundle().pipe(wStream);

wStream.on('close', function(){
  blessify.render()
    .then(function(output){
       //write output.css to a bundle.css
       fs.writeFile('path/to/bundle.css', 'utf8', function(err){
          console.log('compilation successfull');
       });
    });
});
```
