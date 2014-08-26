Feature: Step Definitions
  In order to automate the steps of a scenario in as efficient of a way as possible
  As a developer
  I would like to have a standard way of defining step methods

  Scenario: Step Definition
    Given I have a step like this one
    Then I should be able to create a step definition using the following syntax
      """
        Given('I have a step like this one', function(callback) {
          //Code goes here.
        };
      """
    And the value of "this" should be set to the world object
    And the callback argument should be a function

  Scenario: Requiring Other Files
    Given I have a library
    When I need to require another javascript module
    Then I should be able to specify a path that is from the root of the site like this "features/support/utilities"