var messageFormatter = require('../../lib/message-formatter');
var _ = require('lodash');
var assert = require('assert');
var format = require('../../lib/bash-format');
var LineMapper = require('../../lib/line-mapper');

describe('message-formatter', function() {
  describe('version', function() {
    it('formats the command name and version', function() {
      var command = {
        version: _.constant('1.2.3'),
        commandName: _.constant('fruit')
      }
      assert.equal(format.strip(messageFormatter.version(command)), 'fruit version 1.2.3');
    });

    it('formats an unknown version', function() {
      var command = {
        version: _.constant(null),
        commandName: _.constant('fruit')
      }
      assert.equal(format.strip(messageFormatter.version(command)), 'fruit version unknown');
    });
  });

  describe('error', function() {
    it('formats errors below the help message', function() {
      var command = {
        helpMessage: _.constant('Yadda yadda yadda')
      };
      var errors = [
        { error: 'Shut up, fool!' },
        { error: 'Quit yo jibber jabber' }
      ];
      assert.equal(
        format.strip(messageFormatter.error(command, errors)),
        LineMapper.lines(
          '<help>',
          '',
          'Error:',
          '  Shut up, fool!',
          '  Quit yo jibber jabber'
        ).join()
      );
    });
  });

  describe('help', function() {
    it('formats the help message for an empty command', function() {
      var command = {
        name: _.constant('fruit'),
        commandName: _.constant(null),
        help: _.constant(null),
        arguments: _.constant([]),
        options: _.constant({}),
        subcommands: _.constant({})
      };
      assert.equal(
        format.strip(messageFormatter.help(command)),
        LineMapper.lines(
          'Description:',
          '  none',
          '',
          'Usage:',
          '  fruit',
          '',
          'Arguments:',
          '  none',
          '',
          'Options:',
          '  none'
        ).join()
      );
    });

    it('formats the help message for a command with arguments and options', function() {
      var command = {
        commandName: _.constant('fruit'),
        name: _.constant('banana'),
        help: _.constant(null),
        arguments: _.constant([{ name: 'size' }, { name: 'colour', optional: true }]),
        options: _.constant({ washed: { flag: true, short: 'w' }, ripeness: {}}),
        subcommands: _.constant({})
      };
      assert.equal(
        format.strip(messageFormatter.help(command)),
        LineMapper.lines(
          'Description:',
          '  none',
          '',
          'Usage:',
          '  fruit banana <size> [<colour>]',
          '',
          'Arguments:',
          '  <size>',
          '  [<colour>]',
          '',
          'Options:',
          '  --washed (-w)',
          '  --ripeness=<value>'
        ).join()
      );
    });

    it('formats the help message for a command with help specified', function() {
      var command = {
        commandName: _.constant('fruit'),
        name: _.constant('banana'),
        help: _.constant('Gives you a banana'),
        arguments: _.constant([
          { name: 'size', help: 'Size of banana' },
          { name: 'colour', optional: true, help: 'Colour of banana' }
        ]),
        options: _.constant({
          washed: { flag: true, short: 'w', help: 'Whether the banana should be washed' },
          ripeness: { help: 'Desired ripeness of the banana' }
        }),
        subcommands: _.constant({})
      };
      assert.equal(
        format.strip(messageFormatter.help(command)),
        LineMapper.lines(
          'Description:',
          '  Gives you a banana',
          '',
          'Usage:',
          '  fruit banana <size> [<colour>]',
          '',
          'Arguments:',
          '  <size>              Size of banana',
          '  [<colour>]          Colour of banana',
          '',
          'Options:',
          '  --washed (-w)       Whether the banana should be washed',
          '  --ripeness=<value>  Desired ripeness of the banana'
        ).join()
      );
    });

    it('formats the help message for a command with subcommands', function() {
      var command = {
        commandName: _.constant('fruit'),
        name: _.constant('banana'),
        help: _.constant('Gives you a banana'),
        arguments: _.constant([
          { name: 'size', help: 'Size of banana' }
        ]),
        options: _.constant({
          washed: { flag: true, short: 'w', help: 'Whether the banana should be washed' }
        }),
        subcommands: _.constant({
          plantain: {
            commandName: _.constant('fruit'),
            name: _.constant('banana:plantain'),
            help: _.constant('Gives you a plantain')
          },
          red: {
            commandName: _.constant('fruit'),
            name: _.constant('banana:red'),
            help: _.constant(null)
          }
        })
      };
      assert.equal(
        format.strip(messageFormatter.help(command)),
        LineMapper.lines(
          'Description:',
          '  Gives you a banana',
          '',
          'Usage:',
          '  fruit banana <size>',
          '',
          'Arguments:',
          '  <size>                 Size of banana',
          '',
          'Subcommands:',
          '  fruit banana:plantain  Gives you a plantain',
          '  fruit banana:red',
          '',
          'Options:',
          '  --washed (-w)          Whether the banana should be washed'
        ).join()
      );
    });
  });
});

