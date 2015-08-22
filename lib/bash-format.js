var _ = require('lodash');

var format = function(code, string) {
  return '\033[' + code + 'm' + string + '\033[0m';
};

module.exports = {
  strip: function(string) {
    return string.replace(/\033\[\d+m/g, '');
  },
  format: format,
  red: _.partial(format, 31),
  green: _.partial(format, 32),
  cyan: _.partial(format, 36)
};
