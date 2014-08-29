Feature: Examples of Scenario Steps
  In order to understand the types of steps that can be added to a scenario
  As a user
  I would like to see examples of all the types of steps a scenario can have
  # This is an example of a comment added to the feature by placing it after the Feature: tag but before the description.

  Scenario: This is a scenario with a standard step
    Given I am a standard step
    When I am run
    Then argument 1 to the matching method should be the callback function
    And inside the method this.$context should be
      """
      {
        "step": {
          "id": "gr-231939697",
          "name": "Given I am a standard step",
          "type": "step",
          "libraryName": "/features/step_definitions/test-examples.js",
          "libraryMethodName": "/^I am a standard step$/",
          "originalName": "Given I am a standard step",
          "runCondition": null,
          "scenario": {
            "id": "gr-441182706",
            "name": "This is a scenario with a standard step",
            "type": "scenario",
            "config": {},
            "feature": {
              "id": "gr-1383391462",
              "name": "Examples of Scenario Steps",
              "type": "feature"
            }
          }
        },
        "inlineArgs": [],
        "multiLineArg": [],
        "tableArgArray": [],
        "tableArg": [],
        "exampleArg": null
      }
      """

  Scenario: This is a scenario with a failing step
    Given I am a step that will fail
    When I am run
    Then I should fail

  Scenario: This is a scenario with a missing step definition
    Given I am a step that does not have a step definition
    When I am run
    Then I should be skipped

  Scenario: This is a scenario with an inline parameter step
    Given I am a step with an inline parameter of "A"
    When I am run
    Then argument 1 to the matching method should be "A"
    Then argument 2 to the matching method should be the callback function
    And inside the method this.$context should be
      """
      {
        "step": {
          "id": "gr-2126680208",
          "name": "Given I am a step with an inline parameter of \"A\"",
          "type": "step",
          "libraryName": "/features/step_definitions/test-examples.js",
          "libraryMethodName": "/^I am a step with an inline parameter of \"([^\"]*)\"$/",
          "originalName": "Given I am a step with an inline parameter of \"A\"",
          "runCondition": null,
          "scenario": {
            "id": "gr-318184935",
            "name": "This is a scenario with an inline parameter step",
            "type": "scenario",
            "config": {},
            "feature": {
              "id": "gr-1383391462",
              "name": "Examples of Scenario Steps",
              "type": "feature"
            }
          }
        },
        "inlineArgs": [
          "A"
        ],
        "multiLineArg": [],
        "tableArgArray": [],
        "tableArg": [],
        "exampleArg": null
      }
      """

  Scenario: This is a scenario with a multi-line parameter step
    Given I am a step with a multi-line parameter of
      """
      This is my
      multi-line parameter value
      """
    When I am run
    Then argument 1 to the matching method should be
      """
      [
        "This is my",
        "multi-line parameter value"
      ]
      """
    Then argument 2 to the matching method should be the callback function
    And inside the method this.$context should be
      """
      {
        "step": {
          "id": "gr2058978154",
          "name": "Given I am a step with a multi-line parameter of",
          "type": "step",
          "libraryName": "/features/step_definitions/test-examples.js",
          "libraryMethodName": "/^I am a step with a multi-line parameter of$/",
          "originalName": "Given I am a step with a multi-line parameter of",
          "runCondition": null,
          "scenario": {
            "id": "gr1116990778",
            "name": "This is a scenario with a multi-line parameter step",
            "type": "scenario",
            "config": {},
            "feature": {
              "id": "gr-1383391462",
              "name": "Examples of Scenario Steps",
              "type": "feature"
            }
          }
        },
        "inlineArgs": [],
        "multiLineArg": [
          "This is my",
          "multi-line parameter value"
        ],
        "tableArgArray": [],
        "tableArg": [],
        "exampleArg": null
      }
      """

  Scenario: This is a scenario with a table parameter step
    Given I am a step with a table parameter of
      | Column 1  | Column 2  |
      | Value 1.1 | Value 2.1 |
      | Value 1.2 | Value 2.2 |
    When I am run
    Then argument 1 to the matching method should be
      """
      [
        [
          "Value 1.1",
          "Value 2.1"
        ],
        [
          "Value 1.2",
          "Value 2.2"
        ]
      ]
      """
    Then argument 2 to the matching method should be the callback function
    And inside the method this.$context should be
      """
      {
        "step": {
          "id": "gr-1912800397",
          "name": "Given I am a step with a table parameter of",
          "type": "step",
          "libraryName": "/features/step_definitions/test-examples.js",
          "libraryMethodName": "/^I am a step with a table parameter of$/",
          "originalName": "Given I am a step with a table parameter of",
          "runCondition": null,
          "scenario": {
            "id": "gr-327850282",
            "name": "This is a scenario with a table parameter step",
            "type": "scenario",
            "config": {},
            "feature": {
              "id": "gr-1383391462",
              "name": "Examples of Scenario Steps",
              "type": "feature"
            }
          }
        },
        "inlineArgs": [],
        "multiLineArg": [],
        "tableArgArray": [
          [
            "Value 1.1",
            "Value 2.1"
          ],
          [
            "Value 1.2",
            "Value 2.2"
          ]
        ],
        "tableArg": [
          {
            "Column 1": "Value 1.1",
            "Column 1_Display": " Value 1.1 ",
            "Column 2": "Value 2.1",
            "Column 2_Display": " Value 2.1 "
          },
          {
            "Column 1": "Value 1.2",
            "Column 1_Display": " Value 1.2 ",
            "Column 2": "Value 2.2",
            "Column 2_Display": " Value 2.2 "
          }
        ],
        "exampleArg": null
      }
      """

  Scenario: This is a scenario with a step with an inline comment
    Given I am a step with an inline comment ## Here is my comment
    When I am run
    Then I should pass

  Scenario: This is a scenario with full line comments for the scenario and a step
    # This is an example of a comment for the scenario by placing if after the scenario line.
    Given I am a step followed by a full line comment
      # This is an example of a comment for a step by placing it after the step.
    When I am run
    Then I should pass

  Scenario: This is a scenario with an inline expression
    Given I am a step with an inline expression of "{{ 'Hello ' + 'World' }}" that verifies my inline parameter value is Hello World
    When I am run
    Then I should pass

  Scenario: This is a scenario with an inline expression that fails to compile
    Given I am a step with an inline expression of "{{ Hello.NotExist() }}" that verifies my inline parameter value is Hello World
    When I am run
    Then I should pass

  Scenario: This is a scenario with a true conditional step that passes
    Given I am a step with a true conditional that succeeds if(true == true)
    When I am run
    Then I should pass

  Scenario: This is a scenario with a true conditional step that fails
    Given I am a step with a true conditional that fails if(true == false)
    When I am run
    Then I should fail

  Scenario: This is a scenario with a false conditional step that fails
    Given I am a step with a false conditional that fails if(true == false)
    When I am run
    Then I should pass

  Scenario: This is a scenario with a conditional step that fails to compile
    Given I am a step with a false conditional that fails if(I.Fail.To.Compile)
    When I am run
    Then I should pass

# This is an example of a comment added to a feature by placing it at the end of the file.