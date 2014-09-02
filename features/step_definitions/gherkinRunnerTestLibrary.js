module.exports = function () {
  var utilities = require('gherkin-runner/gherkinUtilities');
  this.Given(/^this scenario$/, function (callback) {
    callback();
  });
  this.When(/^I define a library at "([^"]*)"$/, function (libraryPath, callback) {
    callback();
  });
  this.Then(/^I can cover all steps with this definition$/, function (libraryCode, callback) {
    var actualLibraryCodeResult = require('gherkin-runner/scripts/text!/features/step_definitions/gherkinRunnerTestLibrary.js');
    var actualLibraryCode = utilities.convertMultlineStringToLineArray(actualLibraryCodeResult);
    var errorMsg = utilities.compareStringArrays(libraryCode, actualLibraryCode);
    if(errorMsg)
      callback(new Error(errorMsg));
    else
      callback();
  });
};