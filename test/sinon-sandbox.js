var sinon = require('sinon');

module.exports = function() {
  var sandbox = sinon.sandbox.create();;
  afterEach(function() { sandbox.restore(); });
  return sandbox;
};
