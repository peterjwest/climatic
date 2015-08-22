var format = require('../../lib/bash-format');
var assert = require('assert');

describe('bash-format', function() {
  describe('format', function() {
    it('should format text using a specified code', function() {
      assert.equal(format.format(42, 'foo bar'), '\033[42mfoo bar\033[0m');
    });
  });

  describe('strip', function() {
    it('should strip formatting from text', function() {
      assert.equal(format.strip('\033[42mfoo bar\033[0m'), 'foo bar');
    });
  });

  describe('colours', function() {
    assert.equal(format.format(31, 'foo bar'), format.red('foo bar'));
    assert.equal(format.format(32, 'foo bar'), format.green('foo bar'));
    assert.equal(format.format(36, 'foo bar'), format.cyan('foo bar'));
  });
});
