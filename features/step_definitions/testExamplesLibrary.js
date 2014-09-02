module.exports = function () {
  var utilities = require('gherkin-runner/gherkinUtilities');
  this.Given(/^X$/, function(callback) {
    callback();
  });
  this.Given(/^Y$/, function(callback) {
    callback();
  });
  this.Given(/^Z$/, function(callback) {
    callback();
  });
};