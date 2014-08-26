Feature: Step Argument Types
  In order to maximize step reuse
  As a feature writer
  I should be able to define steps using multiple argument types

Scenario: No Argument
  Given I have a step with no arguments like this one
  When the step runs
  Then the step method should have "1" argument
   And argument "1" should be the callback

Scenario: Inline Arguments
  Given I have a step with "an inline argument" like this one
  When the step runs
  Then the step method should have "2" argument
   And argument "1" should have the value "an inline argument"
   And argument "2" should be the callback

Scenario: Multi-line Argument
  Given I have a step with a multi line argument:
    """
      Like
      This
      One
    """
  When the step runs
  Then the step method should have "2" argument
   And argument "1" should be an array with these values:
    """
    ['      Like','      This','      One']
    """

Scenario: Table Argument
  Given I have a step with a table argument:
    | Column 1  | Column 2  |
    | Test 1.1  | Test 2.1  |
    | Test 1.2  | Test 2.2  |
    | Test 1.3  | Test 2.3  |
  When the step runs
  Then the step method should have "2" argument
   And argument "1" should be an array with these values:
    """
    [
      ['Test 1.1', 'Test 2.1'],
      ['Test 1.2', 'Test 2.2'],
      ['Test 1.3', 'Test 2.3']
    ]
    """