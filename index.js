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
  this.files = {};
  this.lessCode = '';
  this.originalCode = '';
  this.transform = transform(this);
};

Blessify.prototype.render = function(){
  var self = this;
  self.lessCode = '';
  var files = Object.keys(self.files);
  for(var i = 0, l = files.length; i < l; i++){
    var file = files[i];
    var str = self.files[file];
    self.lessCode += '/* file: ' + file + ' */\n';
    self.originalCode += '/* file: ' + file + ' */\n';
    self.originalCode += str + '\n';
    var lessCode = str.replace(importRegExp, '');
    self.lessCode += lessCode += '\n';
  }
  return less.render(self.lessCode, self.options);
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

      blessify.files[file] = str;

      this.push(output);
      return next();
    });
  };
};
