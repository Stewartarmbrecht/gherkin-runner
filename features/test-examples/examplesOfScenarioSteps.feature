Feature: All Capabilities
  In order to understand the types of steps that can be added to a scenario
  As a user
  I would like to see examples of all the types of steps a scenario can have

  Scenario: This is a scenario with a standard step
    Given I am a standard step
    When I am run
    Then I should pass

  Scenario: This is a scenario with a failing step
    Given I am a step that will fail
    When I am run
    Then I should fail

  Scenario: This is a scenario with a missing step definition
    Given I am a step that does not have a step definition
    When I am run
    Then I should be skipped

  Scenario: This is a scenario with an inline parameter step
    Given I am a step with an inline parameter of "X"
    When I am run
    Then I should pass

  Scenario: This is a scenario with a multi-line parameter step
    Given I am a step with a multi-line parameter of
    """
      This is my
      multi-line parameter value
      """
    When I am run
    Then I should pass

  Scenario: This is a scenario with a table parameter step
    Given I am a step with a table parameter of
      | Column 1  | Column 2  |
      | Value 1.1 | Value 2.1 |
      | Value 1.2 | Value 2.2 |
    When I am run
    Then I should pass

  Scenario: This is a scenario with a step with an inline comment
    Given I am a step with an inline comment ## Here is my comment
    When I am run
    Then I should pass

  Scenario: This is a scenario with a full line comment
    Given I am a step followed by a full line comment
    ## Here is my full line comment
    When I am run
    Then I should pass

  Scenario: This is a scenario with an inline expression
    Given I am a step with an inline expression of "{{ 'Hello ' + 'World' }}" that verifies my inline parameter value is Hello World
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
