Feature: Step Definitions
  In order to automate the steps of a scenaio in as effecient of a way as possible
  As a developer
  I would like to have a standard way of defining step methods

  Scenario: Step Definition No Arguments
    Given I have a step with no argument like this one
    Then I should be able to create a step definition using the following syntax
      """
        Given('I have a step with no argument like this one', function(callback) {
          //Code goes here.
        };
      """
    And the value of "this" should be set to the world object
    And the callback argument should be a function


