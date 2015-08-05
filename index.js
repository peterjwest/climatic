var _ = require('lodash');

var Command = module.exports = function(name, sub) {
  this._name = name;
  this._allowedOptions = {};
  this._expectedArguments = [];
  this._subcommands = {};
  this._sub = sub;
};

Command.prototype.help = function(message) {
  this._helpMessage = message;
  return this;
};

Command.prototype.options = function(options) {
  this._allowedOptions = _.assign(this._allowedOptions, options);
  return this;
};

Command.prototype.arguments = function(args) {
  this._expectedArguments = this._expectedArguments.concat(
    Array.isArray(args) ? args : [].slice.call(arguments)
  );
  return this;
};

Command.prototype.command = function(name) {
  var command = new Command(name, true);
  command._parent = this;
  command._root = this._root || this;
  return this._subcommands[name] = command;
};

Command.prototype.allowedOptions = function() {
  var parentOptions = this._parent ? _.clone(this._parent.allowedOptions()) : {};
  return _.assign(parentOptions, this._allowedOptions);
};

Command.prototype.parseArguments = function(args) {
  if (args.length > this._expectedArguments.length) {
    throw 'Too many arguments, expected ' + this._expectedArguments.length + ' got ' + args.length;
  }

  return _.zipObject(this._expectedArguments.map(function(arg, index) {
    if (args[index] === undefined && !arg.optional) {
      throw 'Argument ' + (index + 1) + ' "' + arg.name + '" is required';
    }
    return [arg.name, args[index] || null];
  }));
};

Command.prototype.parseOptions = function(opts) {
  var allowedOptions = this.allowedOptions();

  var options = _.mapValues(allowedOptions, function(option) {
    return option.flag ? false : null;
  });

  _.assign(options, _.mapKeys(opts, function(value, key) {
    var found = _.findKey(allowedOptions, function(option, name) {
      return name === key || option.short === key;
    });

    if (!found) throw 'Option "' + key + '" not allowed';
    return found;
  }));

  return _.mapValues(options, function(value, name) {
    if (allowedOptions[name].flag) {
      if (value !== true && value !== false) {
        throw 'Option "' + name + '" is a flag and should not have a value';
      }
    }
    else {
      if (value === true || value === false) {
        throw 'Option "' + name + '" should have a value';
      }
    }
    return value;
  });
};

Command.prototype.hasSubcommands = function() {
  return _.keys(this._subcommands).length;
};

Command.prototype.commandPath = function(additional) {
  var path = [];
  var parentPath = this._parent && this._parent.commandPath();
  if (parentPath) path.push(parentPath);
  if (this._sub) path.push(this._name);
  if (additional) path.push(additional);
  return path.join(':');
};

Command.prototype.generateHelp = function() {
  var args = this._expectedArguments.map(function(argument) {
    var arg = '<' + argument.name + '>';
    return argument.optional ? '[' + arg + ']' : arg;
  });

  var opts = _.map(this.allowedOptions(), function(option, name) {
    var value = option.flag ? '' : '=<' + name + '>';
    var opt = '--' + name + (option.short ? '|-' + option.short : '') + value;
    return '[' + opt + ']';
  });

  return [this._root._name, this.commandPath(), args.join(' '), opts.join(' ')].join(' ');
}

Command.prototype.run = function(payload) {
  if (this.hasSubcommands() && payload.commands === undefined) {
    payload = {
      commands: payload.args[0] ? payload.args[0].split(':') : [],
      args: payload.args.slice(1),
      options: payload.options
    };
  }

  var command = payload.commands[0];

  if (this.hasSubcommands() && command) {
    if (!this._subcommands[command]) {
      return 'Command "' + this.commandPath(payload.commands[0]) + '" not found';
    }

    payload = _.clone(payload);
    payload.commands = payload.commands.slice(1);

    return this._subcommands[command].run(payload);
  }
  else {
    if (payload.commands.length) {
      return 'Command "' + this.commandPath(payload.commands[0]) + '" not found';
    }

    try {
      return {
        args: this.parseArguments(payload.args),
        options: this.parseOptions(payload.options)
      };
    } catch (e) {
      return e;
    }
  }
};
