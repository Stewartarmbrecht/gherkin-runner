Feature: Libraries
  In order to automate scenarios
  As a developer
  I would like to use javascript libraries to define and match steps to methods

  Scenario: Standard Library Definition
    Given this scenario
    When I define a library at "features/step_definitions/librariesFeatureTestLibrary.js"
    Then I can cover all steps with this definition
    """
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
    """

  Scenario: Step Definition
    Given I have a step like this one
    Then I can create a step definition using the following syntax
    """
    this.Given(/^I have a step like this one$/, function(callback) {
      callback();
    });
    """

  Scenario: Requiring Other Files
    Given I have a library
    When I need to require another javascript module
    Then I can specify a path that is from the root of the site like this "features/support/utilities"