var _ = require('lodash');
var argvParser = require('./lib/argv-parser');
var errorTemplates = require('./lib/error-templates');
var messageFormatter = require('./lib/message-formatter');

var Climatic = module.exports = function(name) {
  this._name = name;
  this._options = {
    help: {
      short: 'h',
      flag: true,
      help: 'Display this help message',
      action: function() {
        Climatic._output(this.helpMessage());
      }
    },
    version: {
      short: 'v',
      flag: true,
      help: 'Display the command version',
      action: function() {
        Climatic._output(Climatic._messageFormatter.version(this));
      }
    }
  };
  this._arguments   = [];
  this._subcommands = {};
  this._root        = this;
};

Climatic._postAction = function(error) {
  if (error) {
    Climatic._output(Climatic._messageFormatter.inlineError(error));
    process.exit(1);
  }
};

Climatic._argvParser       = argvParser;
Climatic._output           = console.log;
Climatic._errorTemplates   = errorTemplates;
Climatic._messageFormatter = messageFormatter;

Climatic.prototype.version = function(version) {
  if (arguments.length > 0) {
    this._version = version;
    return this;
  }
  return this._version
};

Climatic.prototype.help = function(help) {
  if (arguments.length > 0) {
    this._help = help;
    return this;
  }
  return this._help;
};

Climatic.prototype.options = function(options) {
  if (arguments.length > 0) {
    this._options = _.assign(this._options, options);
    return this;
  }

  var parentOptions = this._parent ? _.clone(this._parent.options()) : {};
  return _.pick(_.assign(parentOptions, this._options), _.identity);
};

Climatic.prototype.arguments = function(args) {
  if (arguments.length > 0) {
    this._arguments = arguments.length > 1 ? [].slice.call(arguments) : args;
    return this;
  }

  return this._arguments;
};

Climatic.prototype.action = function(action) {
  if (arguments.length > 0) {
    this._action = action;
  }

  return this._action;
};

Climatic.prototype.subcommand = function(name) {
  var command = new Climatic(name, true);

  // Override defaults set for root commands
  command._options = {};
  command._parent  = this;
  command._root    = this._root;

  // Add to subcommands
  return this._subcommands[name] = command;
};

Climatic.prototype.subcommands = function() {
  return this._subcommands;
};

Climatic.prototype.hasSubcommands = function() {
  return _.keys(this._subcommands).length;
};

Climatic.prototype.path = function() {
  var parentPath = this._parent && this._parent.path();
  var path = parentPath ? parentPath.slice(0) : [];
  if (this._root !== this) path.push(this._name);
  return path;
};

Climatic.prototype.commandName = function() {
  return this._root._name;
};

Climatic.prototype.name = function() {
  return this.path().join(':');
};

Climatic.prototype.helpMessage = function() {
  return Climatic._messageFormatter.help(this);
};

Climatic.prototype.errorMessage = function(errors) {
  return Climatic._messageFormatter.error(this, errors);
};

Climatic.prototype._renderErrors = function(errors) {
  return errors.map(_.bind(function(error) {
    return {
      type: error[0],
      error: Climatic._errorTemplates[error[0]][error[1]].apply(this, error.slice(2))
    };
  }, this));
};

Climatic.prototype._parseArguments = function(payload) {
  if (payload.args.length > this._arguments.length) {
    payload.errors.push(['argument', 'tooMany', this._arguments.length, payload.args.length]);
  }

  return _.zipObject(this._arguments.map(function(arg, index) {
    if (payload.args[index] === undefined && !arg.optional) {
      payload.errors.push(['argument', 'missingRequired', arg.name]);
    }
    return [arg.name, payload.args[index] || null];
  }));
};

Climatic.prototype._parseOptions = function(payload) {
  var allowedOptions = this.options();

  // Create hash of default options
  var options = _.mapValues(allowedOptions, function(option) {
    return option.flag ? false : null;
  });

  _.assign(options, _.mapKeys(payload.options, function(value, key) {
    var found = _.findKey(allowedOptions, function(option, name) {
      return name === key || option.short === key;
    });

    if (!found) {
      payload.errors.push(['option', 'notAllowed', key]);
    }
    return found || key;
  }));

  _.forEach(options, function(value, name) {
    if (allowedOptions[name]) {
      if (allowedOptions[name].flag) {
        if (value !== true && value !== false) {
          payload.errors.push(['option', 'shouldNotHaveValue', name]);
        }
      }
      else {
        if (value === true || value === false) {
          payload.errors.push(['option', 'shouldHaveValue', name]);
        }
      }
    }
  });

  return options;
};

Climatic.prototype.parse = function(payload) {
  // For the root command, extract commands
  if (this._root === this) {
    payload = Climatic._argvParser(payload);
    payload = {
      raw: payload,
      commands: this.hasSubcommands() && payload.args[0] ? payload.args[0].split(':') : [],
      args: this.hasSubcommands() ? payload.args.slice(1) : payload.args,
      options: payload.options,
      errors: []
    };
  }

  var command = payload.commands[0];

  // If there is a matching subcommand, delegate parsing to it
  if (this._subcommands[command]) {
    payload = _.clone(payload);
    payload.commands = payload.commands.slice(1);
    return this._subcommands[command].parse(payload);
  }

  // If there are no more subcommands, this is the right command
  var valid = payload.commands.length === 0
  payload.args = valid ? this._parseArguments(payload) : {};

  if (!valid) {
    payload.errors.push(['command', 'notFound', payload.raw.args[0]]);
  }

  // Finalise payload by parsing options and generating error objects
  payload.command = this;
  payload.options = this._parseOptions(payload);
  payload.errors  = this._renderErrors(payload.errors);
  delete payload.commands;
  return payload;
};

Climatic.prototype._runAction = function(action, args) {
  var postAction = _.bind(Climatic._postAction, this);

  // Apply callback to arguments and run action
  var result = action.apply(this, args.concat(postAction));

  // Use promise if one was returned
  if (result) {
    if (result.then) {
      return result.then(postAction);
    };

    // Use an error if one was returned
    return postAction(result);
  }
};

Climatic.prototype.run = function(payload) {
  payload = this.parse(payload);
  var command = payload.command;

  // Check for command errors
  var commandErrors = _.filter(payload.errors, function(error) { return error.type === 'command'; });
  if (commandErrors.length) {
    return Climatic._output(command.errorMessage(commandErrors));
  }

  // Try to find an option with an action
  var options = command.options();
  var option = options[_.findKey(payload.options, _.bind(function(option, key) {
    return option && options[key] && options[key].action;
  }, this))] || {};

  // Run the option action if it exists (e.g. --help)
  if (option.action) {
    return command._runAction(option.action, [payload.options, payload.raw]);
  }

  // Otherwise check for option or argument errors
  var otherErrors = _.filter(payload.errors, function(error) { return error.type !== 'comand'; });
  if (otherErrors.length) {
    return Climatic._output(command.errorMessage(otherErrors));
  }

  // Then run the command action
  if (command._action) {
    return command._runAction(command._action, [payload.args, payload.options, payload.raw]);
  }

  Climatic._output(command.helpMessage());
};
