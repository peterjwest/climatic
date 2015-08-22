module.exports = function(argv) {
  var results = { options: {}, args: [] };

  argv.slice(2).map(function(arg) {
    if (arg.match(/^-/)) {
      var option = arg.replace(/^-+/, '').split('=')
      results.options[option[0]] = option[1] === undefined ? true : option[1];
    }
    else {
      results.args.push(arg);
    }
  });

  return results;
};
