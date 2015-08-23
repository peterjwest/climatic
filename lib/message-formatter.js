var _ = require('lodash');
var LineMapper = require('./line-mapper');
var format = require('./bash-format');

var messageFormatter = module.exports = {
  version: function(command) {
    var version = format.cyan(command.version() || 'unknown');
    return format.green(command.commandName()) + ' version ' + version;
  },

  error: function(command, errors) {
    return LineMapper.lines(
      messageFormatter.help(command),
      '',
      format.red('Error:'),
      LineMapper.new(_.pluck(errors, 'error')).indent('  ').join()
    ).join();
  },

  help: function(command) {
    var args = command.arguments().map(function(argument) {
      var arg = '<' + argument.name + '>';
      return argument.optional ? '[' + arg + ']' : arg;
    });

    var argsHelp = command.arguments().map(function(argument) {
      return argument.help || '';
    });

    var opts = _.map(command.options(), function(option, name) {
      var value = option.flag ? '' : '=' + '<value>';
      return '--' + name + value + (option.short ? ' (-' + option.short + ')' : '');
    });

    var optsHelp = _.map(command.options(), function(option) {
      return option.help || '';
    });

    var subcommands = _.map(command.subcommands(), function(subcommand) {
      return [command.commandName(), subcommand.name()].join(' ')
    });

    var subcommandsHelp = _.map(command.subcommands(), function(subcommand) {
      return subcommand.help() || '';
    });

    var padding = _.max(args.concat(opts).concat(subcommands), 'length').length + 2;

    var message = LineMapper.lines(
      format.green('Description:'),
      '  ' + (command.help() || 'none'),
      ''
    );

    message.lines(
      format.green('Usage:'),
      '  ' + [command.commandName(), command.name(), args.join(' ')].filter(_.identity).join(' '),
      '',
      format.green('Arguments:'),
      LineMapper.new(args).pad(padding).concat(argsHelp).indent('  ').trim().join() || '  none',
      ''
    );

    if (subcommands.length) {
      message.lines(
        format.green('Subcommands:'),
        LineMapper.new(subcommands).pad(padding).concat(subcommandsHelp).indent('  ').trim().join(),
        ''
      );
    }

    message.lines(
      format.green('Options:'),
      LineMapper.new(opts).pad(padding).concat(optsHelp).indent('  ').trim().join() || '  none'
    );

    return message.join();
  }
};
