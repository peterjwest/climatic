var parser = require('../../lib/argv-parser');
var assert = require('assert');

describe('argv-parser', function() {
  it('parses arguments', function() {
    assert.deepEqual(
      parser(['node', 'file.js', 'foo', 'bar']),
      { args: ['foo', 'bar'], options: {} }
    );
  });

  it('parses options', function() {
    assert.deepEqual(
      parser(['node', 'file.js', '--foo', '--bar=zim']),
      { args: [], options: { foo: true, bar: 'zim' } }
    );
  });

  it('parses short options', function() {
    assert.deepEqual(
      parser(['node', 'file.js', '-f', '-b=zim']),
      { args: [], options: { f: true, b: 'zim' } }
    );
  });

  it('parses arguments and options in any order', function() {
    assert.deepEqual(
      parser(['node', 'file.js', '--foo', 'bar', '-z=gir', 'grue']),
      { args: ['bar', 'grue'], options: { foo: true, z: 'gir' } }
    );
  });
});
