module.exports = function () {
  var utilities = require('gherkin-runner/gherkinUtilities');
  this.Given(/^this scenario$/, function (callback) {
    callback();
  });
  this.When(/^I define a library at "([^"]*)"$/, function (libraryPath, callback) {
    callback();
  });
  this.Then(/^I can cover all steps with this definition$/, function (libraryCode, callback) {
    var actualLibraryCode = require('gherkin-runner/scripts/text!/features/step_definitions/librariesFeatureTestLibrary.js').split('\r\n');
    var errorMsg = utilities.compareStringArrays(libraryCode, actualLibraryCode);
    if(errorMsg)
      callback(new Error(errorMsg));
    else
      callback();
  });
};