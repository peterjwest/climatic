var LineMapper = require('../../lib/line-mapper');
var assert = require('assert');

describe('line-mapper', function() {
  describe('new', function() {
    it('returns a line mapper instance', function() {
      var text = LineMapper.new(['foo', 'bar', 'zim']);
      assert(text instanceof LineMapper);
      assert.deepEqual(text._lines, ['foo', 'bar', 'zim']);
    });
  });

  describe('lines', function() {
    it('returns a line mapper instance using the arguments as input', function() {
      var text = LineMapper.lines('foo', 'bar', 'zim');
      assert(text instanceof LineMapper);
      assert.deepEqual(text._lines, ['foo', 'bar', 'zim']);
    });
  });

  describe('instance', function() {
    describe('join', function() {
      it('joins together the input strings with newlines', function() {
        assert.equal(LineMapper.lines('foo', 'bar', 'zim').join(), 'foo\nbar\nzim');
      });

      it('joins together the input strings with a custom string', function() {
        assert.equal(LineMapper.lines('foo', 'bar', 'zim').join(' '), 'foo bar zim');
      });
    });
    describe('lines', function() {
      it('adds more lines to the instance', function() {
        assert.equal(
          LineMapper.lines('foo', 'bar').lines('zim', 'gir').join(),
          'foo\nbar\nzim\ngir'
        );
      });
    });
    describe('add', function() {
      it('adds any array of lines to the instance', function() {
        assert.equal(
          LineMapper.lines('foo', 'bar').add(['zim', 'gir']).join(),
          'foo\nbar\nzim\ngir'
        );
      });
    });
    describe('indent', function() {
      it('indents the lines with a string', function() {
        assert.equal(
          LineMapper.lines('foo', 'bar', 'zim').indent('  ').join(),
          '  foo\n  bar\n  zim'
        );
      });
    });
    describe('pad', function() {
      it('pads the lines to the right by a specified amount', function() {
        assert.equal(
          LineMapper.lines('foolish', 'bar', 'zim').pad(8).join(),
          'foolish \nbar     \nzim     '
        );
      });

      it('pads the lines with a custom character', function() {
        assert.equal(
          LineMapper.lines('foolish', 'bar', 'zim').pad(8, '~').join(),
          'foolish~\nbar~~~~~\nzim~~~~~'
        );
      });
    });
    describe('concat', function() {
      it('joins the lines to another set of lines', function() {
        assert.equal(
          LineMapper.lines('foo', 'bar').concat(['-zim', '-gir']).join(),
          'foo-zim\nbar-gir'
        );
      });
    });

    it('combines fluent methods correctly', function() {
      assert.equal(
        LineMapper.lines('foolish', 'barter').pad(8).indent('->').concat(['zim', 'gir']).join(),
        '->foolish zim\n->barter  gir'
      );
    });
  });
});
