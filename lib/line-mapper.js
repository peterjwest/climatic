var _ = require('lodash');

var pad = function(string, length, padding) {
  return (string + _.repeat((padding || ' ')[0], length)).slice(0, length);
};

var LineMapper = module.exports = function(lines) {
  this._lines = lines || [];
};

LineMapper.new = function(lines) {
  return new LineMapper(lines);
}

LineMapper.lines = function() {
  var mapper = new LineMapper();
  mapper.lines.apply(mapper, arguments);
  return mapper;
};

LineMapper.prototype.add = function(lines) {
  this._lines = this._lines.concat(lines);
  return this;
};

LineMapper.prototype.lines = function() {
  this._lines = this._lines.concat(this._lines.slice.call(arguments, 0));
  return this;
};

LineMapper.prototype.indent = function(indent) {
  this._lines = this._lines.map(function(str) { return indent + str; });
  return this;
};

LineMapper.prototype.pad = function(length, padding) {
  this._lines = this._lines.map(function(str) { return pad(str, length, padding); });
  return this;
};

LineMapper.prototype.concat = function(lines) {
  this._lines = this._lines.map(function(str, i) { return str + lines[i]; });
  return this;
};

LineMapper.prototype.trim = function() {
  this._lines = this._lines.map(function(str) { return str.replace(/\s+$/g, ''); });
  return this;
};

LineMapper.prototype.join = function(delimiter) {
  return this._lines.join(delimiter || '\n');
};
