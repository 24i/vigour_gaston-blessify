var path = require('path')
  , less = require('less')
  , through = require('through2')
  , CSS_EXTENSIONS = ['.css', '.less']
  , JS_EXTENSIONS = ['.js', '.json']
  , importRegExp = /^(\s+)?(?!\s*\/\/\s*)@import(\ +)?url(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/gm
  , requireRegExp = /^(\s+)?(?!\s*\/\/\s*)require(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/gm
  , tildeRegExp = new RegExp('^\~\/')
  , appRegExp
  , options


var Blessify = module.exports = function(options){
  this.options = options;
  this.lessCode = '';
  this.originalCode = '';
  this.transform = transform(this);
};

Blessify.prototype.render = function(){
  return less.render(this.lessCode, this.options);
};

Blessify.prototype.clear = function(){
  this.lessCode = '';
  this.originalCode = '';
};

var transform = function(blessify){
  return function(file, opts){
    return through(function(buf, enc, next){
      //if it's not less or css file return original
      var ext = path.extname(file);
      if( !~CSS_EXTENSIONS.indexOf(ext) ){
        return ( this.push(buf) && next() );
      }

      var str = buf.toString('utf8');

      var output = '';
      while( match = importRegExp.exec(str) ){
        output += 'require(\'' + match[5] + '\');\n';
      }

      var lessCode = str.replace(importRegExp, '');
      blessify.lessCode += '/* file: ' + file + ' */\n';
      blessify.originalCode += '/* file: ' + file + ' */\n';
      blessify.originalCode += str + '\n';
      blessify.lessCode += lessCode += '\n';

      this.push(output);
      return next();
    });
  };
};
