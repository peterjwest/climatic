module.exports = {
  argument: {
    tooMany: function(expected, actual) {
      return 'Too many arguments, expected ' + expected + ' got ' + actual;
    },
    missingRequired: function(name) {
      return 'Argument <' + name + '> is required';
    }
  },
  option: {
    notAllowed: function(name) {
      var type = name.length === 1 ? '-' : '--';
      return 'Option ' + type + name + ' not allowed';
    },
    shouldHaveValue: function(name) {
      return 'Option --' + name + ' should have a value';
    },
    shouldNotHaveValue: function(name) {
      return 'Option --' + name + ' is a flag and should not have a value';
    }
  },
  command: {
    notFound: function(name) {
      return 'Command "' + name + '" not found';
    }
  }
};
