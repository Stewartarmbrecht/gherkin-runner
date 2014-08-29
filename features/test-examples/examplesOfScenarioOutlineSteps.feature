Feature: Examples of Scenario Outline Steps
  In order to understand the types of steps that can be added to a scenario outline
  As a user
  I would like to see examples of all the types of steps a scenario outline can have

  Scenario Outline: This is a scenario outline with a standard step and non-standard step
    Given I am a <Arg 1> <Arg 2>
    When I am run
    Then I should pass

    Examples:
      | Arg 1        | Arg 2 |
      | standard     | step  |
      | non-standard | step  |

  Scenario Outline: This is a scenario outline with a missing and found step definition
    Given I am a step that <Arg 1> have a step definition
    When I am run
    Then I should <Arg 2>

    Examples:
      | Arg 1    | Arg 2      |
      | does     | pass       |
      | does not | be skipped |

  Scenario Outline: This is a scenario outline with an inline parameter step set by the example argument
    Given I am a step with an inline parameter of "<Arg 1>"
    When I am run
    Then I should have my first argument with a value of <Arg 1>

    Examples:
      | Arg 1 |
      | A     |
      | B     |

  Scenario Outline: This is a scenario outline with a multi-line parameter step that is seeded with the example argument
    Given I am a step with a multi-line parameter of
      """
      This is my
      multi-line parameter value
      of <Arg 1>
      """
    When I am run
    Then I should have my first argument with a flattened value of "This is my multi-line parameter value of <Arg 1>"

  Examples:
      | Arg 1 |
      | A     |
      | B     |

  Scenario Outline: This is a scenario outline with a table parameter step whose values are set by the example argument
    Given I am a step with a table parameter of
      | Column 1          | Column 2          |
      | Value 1.1.<Arg 1> | Value 2.1.<Arg 1> |
      | Value 1.2.<Arg 1> | Value 2.2.<Arg 1> |
    When I am run
    Then I should have my first argument to be an array of rows that each are an array of column values
    And tableArg[0][0] should equal "Value 1.1.<Arg 1>"
    And tableArg[1][1] should equal "Value 2.2.<Arg 1>"
    And this.$context.tableArg should be an array of objects whose properties are the names of the columns
    And this.$context.tableArg[1]['Column 1'] should equal "Value 1.2.<Arg 1>"
    And this.$context.tableArg[0]['Column 2'] should equal "Value 2.1.<Arg 1>"

    Examples:
      | Arg 1 |
      | A     |
      | B     |

  Scenario Outline: This is a scenario outline with an inline expression that includes the example argument
    Given I am a step with an inline expression of "{{ 'Hello ' + 'World ' + '<Arg 1>' }}" that verifies my inline parameter value is Hello World <Arg 1>
    When I am run
    Then I should pass

    Examples:
      | Arg 1 |
      | A     |
      | B     |

  Scenario Outline: This is a scenario outline with a conditional step that is set by the example argument
    Given I am a step with a true conditional that succeeds if('<Arg 1>' == 'A')
    When I am run
    Then I should pass

    Examples:
      | Arg 1 |
      | A     |
      | B     |
