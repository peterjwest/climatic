var Climatic = require('../index');
var format = require('../lib/bash-format');
var assert = require('assert');
var _ = require('lodash');
var sinon = require('sinon');

describe('climatic', function() {
  describe('version', function() {
    it('returns undefined by default', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.version(), undefined);
    });

    it('returns the version if set', function() {
      var cmd = new Climatic('fruit');
      cmd.version('1.2.3');
      assert.equal(cmd.version(), '1.2.3');
    });

    it('returns fluently when used as a setter', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.version('1.2.3'), cmd);
    });
  });

  describe('help', function() {
    it('returns undefined by default', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.help(), undefined);
    });

    it('stores and returns the help text', function() {
      var cmd = new Climatic('fruit');
      cmd.help('Description of the command');
      assert.equal(cmd.help(), 'Description of the command');
    });

    it('returns fluently when used as a setter', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.help('Description of the command'), cmd);
    });
  });

  describe('options', function() {
    it('returns default options by default', function() {
      var cmd = new Climatic('fruit');
      assert.deepEqual(_.keys(cmd.options()), ['help', 'version']);
    });

    it('stores and returns additional options', function() {
      var cmd = new Climatic('fruit');
      cmd.options({ foo: { help: 'Foo help' }, bar: { flag: true }});
      assert.deepEqual(_.keys(cmd.options()), ['help', 'version', 'foo', 'bar']);
      assert.deepEqual(cmd.options().foo, { help: 'Foo help' });
      assert.deepEqual(cmd.options().bar, { flag: true });
    });

    it('excludes options which have been set to a false value', function() {
      var cmd = new Climatic('fruit');
      cmd.options({ help: null, bar: { flag: true }});
      assert.deepEqual(_.keys(cmd.options()), ['version', 'bar']);
    });

    it('returns fluently when used as a setter', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.options({}), cmd);
    });

    it('includes and excludes hierarchically from parent commands', function() {
      var cmd = new Climatic('fruit');
      var sub1 = cmd.subcommand('apple');
      var sub2 = sub1.subcommand('granny-smith');

      cmd.options({ foo: {} });
      sub1.options({ bar: {}, version: null });
      sub2.options({ zim: {} });

      assert.deepEqual(_.keys(cmd.options()), ['help', 'version', 'foo']);
      assert.deepEqual(_.keys(sub1.options()), ['help', 'foo', 'bar']);
      assert.deepEqual(_.keys(sub2.options()), ['help', 'foo', 'bar', 'zim']);
    });
  });

  describe('arguments', function() {
    it('has no arguments by default', function() {
      var cmd = new Climatic('fruit');
      assert.deepEqual(cmd.arguments(), []);
    });

    it('stores and returns arguments from an array', function() {
      var cmd = new Climatic('fruit');
      cmd.arguments([{ name: 'foo' }, { name: 'bar' }]);
      assert.deepEqual(cmd.arguments(), [{ name: 'foo' }, { name: 'bar' }]);
    });

    it('stores and returns arguments from arguments', function() {
      var cmd = new Climatic('fruit');
      cmd.arguments({ name: 'foo' }, { name: 'bar' });
      assert.deepEqual(cmd.arguments(), [{ name: 'foo' }, { name: 'bar' }]);
    });

    it('returns the command when used as a setter', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.arguments({}), cmd);
    });
  });

  describe('action', function() {
    it('has no action by default', function() {
      var cmd = new Climatic('fruit');
      assert.deepEqual(cmd.action(), undefined);
    });

    it('stores and returns the action', function() {
      var cmd = new Climatic('fruit');
      var action = function() {};
      cmd.action(action);
      assert.deepEqual(cmd.action(), action);
    });
  });

  describe('subcommand', function() {
    it('returns a new command', function() {
      var cmd = new Climatic('fruit');
      var sub = cmd.subcommand('apple');

      assert(sub instanceof Climatic);
      assert.notEqual(cmd, sub);
    });

    it('uses the name provided', function() {
      var cmd = new Climatic('fruit');
      var sub = cmd.subcommand('apple');
      assert.equal(sub.name(), 'apple');
    });
  });

  describe('subcommands', function() {
    it('has no subcommands by default', function() {
      var cmd = new Climatic('fruit');
      assert.deepEqual(cmd.subcommands(), {});
    });

    it('returns defined subcommands', function() {
      var cmd = new Climatic('fruit');
      var sub = cmd.subcommand('apple');
      assert.deepEqual(sub.subcommands(), {});
      assert.deepEqual(cmd.subcommands(), { apple: sub });
    });
  });

  describe('hasSubcommands', function() {
    it('returns false if there are no subcommands', function() {
      var cmd = new Climatic('fruit');
      assert.equal(cmd.hasSubcommands(), false);
    });

    it('returns true if there are subcommands', function() {
      var cmd = new Climatic('fruit');
      var sub = cmd.subcommand('apple');
      assert.equal(cmd.hasSubcommands(), true);
    });
  });

  describe('commandName', function() {
    var cmd = new Climatic('fruit');
    var sub = cmd.subcommand('apple');

    describe('root command', function() {
      it('has a command name', function() {
        assert.equal(cmd.commandName(), 'fruit');
      });
    });

    describe('subcommand', function() {
      it('has the same command name as the root command', function() {
        assert.equal(sub.commandName(), 'fruit');
      });
    });
  });

  describe('path', function() {
    var cmd = new Climatic('fruit');
    var sub1 = cmd.subcommand('apple');
    var sub2 = sub1.subcommand('granny-smith');

    describe('root command', function() {
      it('has a no subcommand path', function() {
        assert.deepEqual(cmd.path(), []);
      });
    });

    describe('subcommand', function() {
      it('has a subcommand path', function() {
        assert.deepEqual(sub1.path(), ['apple']);
      });
    });

    describe('nested subcommand', function() {
      it('has a subcommand path', function() {
        assert.deepEqual(sub2.path(), ['apple', 'granny-smith']);
      });
    });
  });

  describe('name', function() {
    var cmd = new Climatic('fruit');
    var sub1 = cmd.subcommand('apple');
    var sub2 = sub1.subcommand('granny-smith');

    describe('root command', function() {
      it('has a no subcommand name', function() {
        assert.equal(cmd.name(), '');
      });
    });

    describe('subcommand', function() {
      it('has a subcommand name', function() {
        assert.equal(sub1.name(), 'apple');
      });
    });

    describe('nested subcommand', function() {
      it('has a namespaced subcommand name', function() {
        assert.equal(sub2.name(), 'apple:granny-smith');
      });
    });
  });

  describe('helpMessage', function() {
    it('uses the message formatter', function() {
      var cmd = new Climatic('fruit');
      cmd._messageFormatter = {
        help: sinon.stub().returns('<message>')
      };

      assert.equal(cmd.helpMessage(), '<message>');
      assert.deepEqual(cmd._messageFormatter.help.getCall(0).args, [cmd]);
    });
  });

  describe('errorMessage', function() {
    it('uses the message formatter', function() {
      var cmd = new Climatic('fruit');
      cmd._messageFormatter = {
        error: sinon.stub().returns('<message>')
      };

      assert.equal(cmd.errorMessage([1, 2, 3]), '<message>');
      assert(cmd._messageFormatter.error.calledOnce);
      assert.deepEqual(cmd._messageFormatter.error.getCall(0).args, [cmd, [1, 2, 3]]);
    });
  });

  describe('_renderErrors', function() {
    var errorTemplates = {
      argument: {
        tooMany: sinon.stub().returns('<tooMany>')
      },
      option: {
        notAllowed: sinon.stub().returns('<notAllowed>')
      }
    };

    it('renders errors into their templates', function() {
      var cmd = new Climatic('fruit');
      cmd._errorTemplates = errorTemplates;

      var errors = [
        ['argument', 'tooMany', '3', '2'],
        ['option', 'notAllowed', 'apple']
      ];

      assert.deepEqual(cmd._renderErrors(errors), [
        { error: '<tooMany>', type: 'argument' },
        { error: '<notAllowed>', type: 'option' }
      ]);

      assert(errorTemplates.argument.tooMany.calledOnce);
      assert(errorTemplates.argument.tooMany.getCall(0).args, ['3', '2']);

      assert(errorTemplates.option.notAllowed.calledOnce);
      assert(errorTemplates.option.notAllowed.getCall(0).args, ['apple']);
    });
  });

  describe('_parseArguments', function() {
    var cmd = new Climatic('fruit');
    cmd.arguments([
      { name: 'apple' },
      { name: 'banana' },
      { name: 'cherry', optional: true }
    ]);

    it('maps arguments to their named definitions', function() {
      var payload = {
        args: ['a', 'b', 'c'],
        errors: []
      };

      assert.deepEqual(cmd._parseArguments(payload), {
        apple: 'a', banana: 'b', cherry: 'c'
      });
      assert.deepEqual(payload.errors, []);
    });

    it('creates an error if there are too many arguments', function() {
      var payload = {
        args: ['a', 'b', 'c', 'd'],
        errors: []
      };

      assert.deepEqual(cmd._parseArguments(payload), {
        apple: 'a', banana: 'b', cherry: 'c'
      });
      assert.deepEqual(payload.errors, [['argument', 'tooMany', 3, 4]]);
    });

    it('creates an error for required arguments which are missing', function() {
      var payload = {
        args: ['a'],
        errors: []
      };

      assert.deepEqual(cmd._parseArguments(payload), {
        apple: 'a', banana: null, cherry: null
      });
      assert.deepEqual(payload.errors, [['argument', 'missingRequired', 'banana']]);
    });
  });

  describe('_parseOptions', function() {
    var cmd = new Climatic('fruit');
    cmd.options({
      foo: { short: 'f', flag: true },
      bar: {},
      help: false,
      version: false
    });

    it('maps options to their definitions', function() {
      var payload = {
        options: { f: true, bar: 'value' },
        errors: []
      };

      assert.deepEqual(cmd._parseOptions(payload), {
        foo: true,
        bar: 'value'
      });
      assert.deepEqual(payload.errors, []);
    });

    it('includes help and version by default', function() {
      var cmd = new Climatic('fruit');
      cmd.options({
        foo: { short: 'f', flag: true },
        bar: {}
      });

      var payload = {
        options: { f: true, bar: 'value', help: true, v: true },
        errors: []
      };

      assert.deepEqual(cmd._parseOptions(payload), {
        help: true,
        version: true,
        foo: true,
        bar: 'value'
      });
      assert.deepEqual(payload.errors, []);
    });

    it('creates an error if an option is not allowed', function() {
      var payload = {
        options: { foo: true, bar: 'value', cat: 'dog' },
        errors: []
      };

      assert.deepEqual(cmd._parseOptions(payload), {
        foo: true,
        bar: 'value',
        cat: 'dog'
      });
      assert.deepEqual(payload.errors, [
        ['option', 'notAllowed', 'cat']
      ]);
    });

    it('creates an error if an option should have a value', function() {
      var payload = {
        options: { foo: true, bar: true },
        errors: []
      };

      assert.deepEqual(cmd._parseOptions(payload), {
        foo: true,
        bar: true
      });
      assert.deepEqual(payload.errors, [
        ['option', 'shouldHaveValue', 'bar']
      ]);
    });

    it('creates an error if an option should have a value', function() {
      var payload = {
        options: { foo: 'value', bar: 'value' },
        errors: []
      };

      assert.deepEqual(cmd._parseOptions(payload), {
        foo: 'value',
        bar: 'value'
      });
      assert.deepEqual(payload.errors, [
        ['option', 'shouldNotHaveValue', 'foo']
      ]);
    });
  });

  describe('parse', function() {
    describe('blank command', function() {
      var cmd = new Climatic('fruit');

      it('parses blank input', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit']), {
          args: {},
          options: {
            help: false,
            version: false
          },
          command: cmd,
          errors: [],
          raw: {
            args: [],
            options: {}
          }
        });
      });

      it('parses invalid input', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', '--cactus', 'banana', 'plantain']), {
          args: {},
          options: {
            help: false,
            version: false,
            cactus: true
          },
          command: cmd,
          errors: [
            { error: 'Too many arguments, expected 0 got 2', type: 'argument' },
            { error: 'Option --cactus not allowed', type: 'option' }
          ],
          raw: {
            args: ['banana', 'plantain'],
            options: {
              cactus: true
            }
          }
        });
      });
    });

    describe('simple command', function() {
      var cmd = new Climatic('fruit');
      cmd.arguments([
        { name: 'name' }
      ]);
      cmd.options({
        ripeness: { short: 'r' },
        reduced: { flag: true }
      });

      it('parses valid input', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'apple', '-r=9', '--reduced']), {
          args: { name: 'apple' },
          options: {
            help: false,
            reduced: true,
            ripeness: '9',
            version: false
          },
          command: cmd,
          errors: [],
          raw: {
            args: ['apple'],
            options: {
              r: '9',
              reduced: true
            }
          }
        });
      });
    });

    describe('command with subcommands', function() {
      var cmd = new Climatic('fruit');
      cmd.options({
        ripeness: { short: 'r' },
        reduced: { flag: true },
        help: false,
        version: false
      });

      var sub1 = cmd.subcommand('apple');
      sub1.arguments([
        { name: 'type' }
      ]);

      var sub2 = cmd.subcommand('coconut');
      sub2.options({
        hardness: {},
        ripeness: false
      });

      it('parses the base command', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit']), {
          args: {},
          options: {
            reduced: false,
            ripeness: null
          },
          command: cmd,
          errors: [],
          raw: {
            args: [],
            options: {}
          }
        });
      });

      it('parses a subcommand with arguments', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'apple', 'granny smith']), {
          args: { type: 'granny smith' },
          options: {
            reduced: false,
            ripeness: null
          },
          command: sub1,
          errors: [],
          raw: {
            args: ['apple', 'granny smith'],
            options: {}
          }
        });
      });

      it('parses a subcommand with different options', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'coconut', '--hardness=70%']), {
          args: {},
          options: {
            reduced: false,
            hardness: '70%'
          },
          command: sub2,
          errors: [],
          raw: {
            args: ['coconut'],
            options: { hardness: '70%' }
          }
        });
      });

      it('returns an error if there is no valid subcommand', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'banana', '--reduced']), {
          args: {},
          options: {
            reduced: true,
            ripeness: null
          },
          command: cmd,
          errors: [
            { error: 'Command "banana" not found', type: 'command' }
          ],
          raw: {
            args: ['banana'],
            options: { reduced: true }
          }
        });
      });

      it('returns an error if there is no valid nested subcommand', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'banana:plantain']), {
          args: {},
          options: {
            reduced: false,
            ripeness: null
          },
          command: cmd,
          errors: [
            { error: 'Command "banana:plantain" not found', type: 'command' }
          ],
          raw: {
            args: ['banana:plantain'],
            options: {}
          }
        });
      });
    });

    describe('command with nested subcommands', function() {
      var cmd = new Climatic('fruit');
      cmd.options({
        ripeness: { short: 'r' },
        reduced: { flag: true },
        help: false,
        version: false
      });

      var sub1 = cmd.subcommand('banana');
      sub1.options({
        ripeness: false,
        colour: {}
      });

      var sub2 = sub1.subcommand('plantain');
      sub2.arguments([
        { name: 'flavour' }
      ]);

      it('parses a subcommand with different options', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'banana', '--colour=green']), {
          args: {},
          options: {
            reduced: false,
            colour: 'green'
          },
          command: sub1,
          errors: [],
          raw: {
            args: ['banana'],
            options: { colour: 'green' }
          }
        });
      });

      it('parses a nested subcommand with different options', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'banana:plantain', '--colour=green' , 'sweet']), {
          args: { flavour: 'sweet' },
          options: {
            reduced: false,
            colour: 'green'
          },
          command: sub2,
          errors: [],
          raw: {
            args: ['banana:plantain', 'sweet'],
            options: { colour: 'green' }
          }
        });
      });

      it('returns an error if there is no valid nested subcommand', function() {
        assert.deepEqual(cmd.parse(['node', 'fruit', 'banana:plantain:acuminata']), {
          args: {},
          options: {
            reduced: false,
            colour: null
          },
          command: sub2,
          errors: [
            { error: 'Command "banana:plantain:acuminata" not found', type: 'command' }
          ],
          raw: {
            args: ['banana:plantain:acuminata'],
            options: {}
          }
        });
      });
    });
  });

  describe('run', function() {
    describe('blank command', function() {
      var cmd = new Climatic('fruit');
      cmd._messageFormatter = {
        help: function() { return '<help>'; },
        error: function() { return '<error>'; },
        version: function() { return '<version>'; }
      }
      cmd._output = sinon.stub();

      beforeEach(function() {
        cmd._output.reset();
      });

      it('outputs the help message', function() {
        cmd.run(['node', 'fruit']);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['<help>']);
      });

      it('outputs the help message if the help flag is given', function() {
        cmd.run(['node', 'fruit', '--help']);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['<help>']);
      });

      it('outputs the version if the version flag is given', function() {
        cmd.run(['node', 'fruit', '--version']);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['<version>']);
      });

      it('outputs an error message if the input is invalid', function() {
        cmd.run(['node', 'fruit', 'cactus']);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['<error>']);
      });
    });

    describe('simple command', function() {
      var cmd = new Climatic('fruit');
      cmd.arguments([
        { name: 'name' }
      ]);
      cmd.action(sinon.stub());

      var optionAction = sinon.stub();
      cmd.options({
        ripeness: { short: 'r', action: optionAction },
        reduced: { flag: true },
        help: false,
        version: false
      });

      beforeEach(function() {
        cmd._action.reset();
        optionAction.reset();
      });

      it('runs the action passing the arguments, options and raw payload', function() {
        cmd.run(['node', 'fruit', 'banana', '--reduced']);
        assert(cmd._action.calledOnce);
        assert(optionAction.notCalled);
        assert.equal(cmd._action.getCall(0).thisValue, cmd);
        assert.deepEqual(cmd._action.getCall(0).args, [
          { name: 'banana' },
          {
            reduced: true,
            ripeness: null
          },
          {
            args: ['banana'],
            options: {
              reduced: true
            }
          }
        ]);
      });

      it('runs an option action instead of the command action if there is one', function() {
        cmd.run(['node', 'fruit', 'banana', '--ripeness=3']);
        assert(cmd._action.notCalled);
        assert(optionAction.calledOnce);
        assert.equal(optionAction.getCall(0).thisValue, cmd);
        assert.deepEqual(optionAction.getCall(0).args, [
          {
            reduced: false,
            ripeness: 3
          },
          {
            args: ['banana'],
            options: {
              ripeness: '3'
            }
          }
        ]);
      });
    });

    describe('command with subcommands', function() {
      var cmd = new Climatic('fruit');
      cmd.action(sinon.stub());
      cmd._messageFormatter = {
        error: function(command, errors) {
          return _.pluck(errors, 'error').join(', ');
        }
      }
      cmd._output = sinon.stub();

      var optionAction = sinon.stub();
      cmd.options({
        ripeness: { short: 'r', action: optionAction },
        reduced: { flag: true },
        help: false,
        version: false
      });

      var sub = cmd.subcommand('coconut');
      sub.arguments([
        { name: 'type' }
      ]);
      sub.options({
        hardness: {},
        ripeness: false
      });
      sub.action(sinon.stub());

      beforeEach(function() {
        cmd._output.reset();
        cmd._action.reset();
        sub._action.reset();
        optionAction.reset();
      });

      it('runs base command action', function() {
        cmd.run(['node', 'fruit', '--reduced']);
        assert(cmd._action.calledOnce);
        assert(sub._action.notCalled);
        assert.equal(cmd._action.getCall(0).thisValue, cmd);
        assert.deepEqual(cmd._action.getCall(0).args, [
          {},
          {
            reduced: true,
            ripeness: null
          },
          {
            args: [],
            options: {
              reduced: true
            }
          }
        ]);
      });

      it('runs a subcommand action', function() {
        cmd.run(['node', 'fruit', 'coconut', 'kappadam']);
        assert(cmd._action.notCalled);
        assert(sub._action.calledOnce);
        assert.equal(sub._action.getCall(0).thisValue, sub);
        assert.deepEqual(sub._action.getCall(0).args, [
          { type: 'kappadam' },
          {
            reduced: false,
            hardness: null
          },
          {
            args: ['coconut', 'kappadam'],
            options: {}
          }
        ]);
      });

      it('outputs an error if there is no valid subcommand', function() {
        cmd.run(['node', 'fruit', 'banana']);
        assert(cmd._action.notCalled);
        assert(sub._action.notCalled);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['Command "banana" not found']);
      });

      it('outputs an error if there is no valid nested subcommand', function() {
        cmd.run(['node', 'fruit', 'coconut:kappadam']);
        assert(cmd._action.notCalled);
        assert(sub._action.notCalled);
        assert(cmd._output.calledOnce);
        assert.deepEqual(cmd._output.getCall(0).args, ['Command "coconut:kappadam" not found']);
      });
    });
  });
});
