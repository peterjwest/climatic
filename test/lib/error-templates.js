var errorTemplates = require('../../lib/error-templates');
var assert = require('assert');

describe('error-templates', function() {
  describe('argument', function() {
    describe('tooMany', function() {
      assert.equal(
        errorTemplates.argument.tooMany(3, 2),
        'Too many arguments, expected 3 got 2'
      );
    });

    describe('missingRequired', function() {
      assert.equal(
        errorTemplates.argument.missingRequired('banana'),
        'Argument <banana> is required'
      );
    });
  });

  describe('option', function() {
    describe('notAllowed', function() {
      it('formats long arguments correctly', function() {
        assert.equal(
          errorTemplates.option.notAllowed('apple'),
          'Option --apple not allowed'
        );
      });

      it('formats short arguments correctly', function() {
        assert.equal(
          errorTemplates.option.notAllowed('a'),
          'Option -a not allowed'
        );
      });
    });

    describe('shouldHaveValue', function() {
      assert.equal(
        errorTemplates.option.shouldHaveValue('mango'),
        'Option --mango should have a value'
      );
    });

    describe('shouldNotHaveValue', function() {
      assert.equal(
        errorTemplates.option.shouldNotHaveValue('mango'),
        'Option --mango is a flag and should not have a value'
      );
    });
  });

  describe('command', function() {
    describe('notFound', function() {
      assert.equal(
        errorTemplates.command.notFound('orange:grapefruit'),
        'Command "orange:grapefruit" not found'
      );
    });
  });
});
