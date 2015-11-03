var path = require('path')
var less = require('less')
var through = require('through2')
var CSS_EXTENSIONS = ['.css', '.less']
var importRegExp = /^(\s+)?(?!\s*\/\/\s*)@import(\ +)?url(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/gm
var tildeRegExp = new RegExp('^\~')
console.log('blessify linked')
var Blessify = module.exports = function (app) {
  this.app = app || {}
  this.app.project = app.project || {}
  this.options = app.gaston['less-options']
  this.files = {}
  this.lessCode = ''
  this.imports = ''
  this.originalCode = ''
  this.transform = transform(this)
}

Blessify.prototype.render = function () {
  var self = this
  self.lessCode = self.imports
  var files = Object.keys(self.files)
  for (var i = files.length - 1; i >= 0; i--) {
    var file = files[i]
    var str = self.files[file]
    self.lessCode += '/* file: ' + file + ' */\n'
    self.originalCode += '/* file: ' + file + ' */\n'
    self.originalCode += str + '\n'
    var lessCode = str.replace(importRegExp, '')
    self.lessCode += lessCode += '\n'
  }
  return less.render(self.lessCode, self.options)
}

var transform = function (blessify) {
  return function (file, opts) {
    return through(function (buf, enc, next) {
      // if it's not less or css file return original
      var ext = path.extname(file)
      if (!~CSS_EXTENSIONS.indexOf(ext)) {
        return (this.push(buf) && next())
      }

      var str = buf.toString('utf8')

      var output = ''
      var match = importRegExp.exec(str)
      while (match) {
        var importPath = match[5].replace(tildeRegExp, blessify.app.project['base-path'])
        if(importPath.indexOf('http') === 0 || importPath.indexOf('//') === 0){
          blessify.imports += match[0] + '\n'
        } else {
          output += "require('" + importPath + "');\n"
        }
        match = importRegExp.exec(str)
      }

      blessify.files[file] = str

      this.push(output)
      return next()
    })
  }
}
