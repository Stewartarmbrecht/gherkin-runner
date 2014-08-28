Feature: Using the Gherkin Walker
  In order to understand the behaviors of a system
  As a user
  I would like to be able to browse the features organized by feature sets

  Background: Setup a generic feature set
    Given a file "features/featureSet.js" with the following content:
    """
    module.exports = {
      name: "All Features",
      featureSetPaths: [
        "features/gherkin-runner/featureSet",
        "features/todo-app/featureSet",
        "features/test-examples/featureSet",
      ]
    };
    """


  Scenario: The system will load a default feature set if none is provided
    Given the user navigates to "/"
    When the user navigates to the gherkin runner without any feature set specified
    Then the system should load
