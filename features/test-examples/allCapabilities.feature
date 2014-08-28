Feature: All Capabilities
  In order to demonstrate the full capabilities of the gherkin runner
  As a user
  I would like to see a single feature with every type of construct for defining a feature

#  Background: This is a backgound
#    Given I am a background scenario
#    When multiple scenarios are run
#    Then I should run before each scenario
#
#  Background Outline: This is a background that uses an outline
#    Given I am a background outline scenario
#    When "<Scenario Count>" scenarios are run
#    Then I should run <Example Count> examples before each scenario
#    And I should a total of <Total Run Count> times
#
#    Examples:
#      | Scenario Count  | Example Count | Total Run Count |
#      | 1               | 2             | 2               |
#      | 2               | 2             | 4               |

  Feature Background: This is a scenario that runs once for a feature regardless of how many scenarios are run in the feature
    Given I am a feature background
    When multiple scenarios are run
    Then I should run only once before all the scenarios

  Feature Background Outline: This is a scenario outline that runs once before one or more scenarios are run in a feature
    Given I am a feature background outline scenario
    When "<Scenario Count>" scenarios are run
    Then I should run <Example Count> examples before each scenario
    And I should a total of <Total Run Count> times

    Examples:
      | Scenario Count  | Example Count | Total Run Count |
      | 1               | 2             | 2               |
      | 2               | 2             | 2               |

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

  Scenario Outline: This is a scenario outline with a standard step
    Given I am a step with an example argument of <Example Argument 1> and <Example Argument 2>
    When I am run
    Then I should pass

    Examples:
      | Example Argument 1         | Example Argument 2         |
      | Example Argument Value 1.1 | Example Argument Value 2.1 |
      | Example Argument Value 1.2 | Example Argument Value 2.2 |

  Scenario Outline: This is scenario each type of step
    And I am a step with an inline argument that is seeded from the example "<Example Argument 1>"
    And I am a step with a multi-line argument seeded from the example:
      """
      This is my
      multi-line argument
      with an example argument of <Example Argument 2>.
      """
    And I am a step with a table argument seeded from the example:
      | Column 1  | Column 2  |
      | Value 1.1 | <Example Argument 1>.1 |
      | Value 1.2 | <Example Argument 1>.1 |
    And I am a step group
    And I am a step group with inline parameters "Step Group Value 1" and "Step Group Value 2"
    And I am a step group with inline parameters "Table Step Group Value 1" and "Table Step Group Value 2" and a table parameter
      | Column 1                   | Column 2                   |
      | Step Group Table Value 1.1 | Step Group Table Value 2.1 |
      | Step Group Table Value 1.2 | Step Group Table Value 2.2 |
    And I am a step group with inline parameters "Table Step Group Value 1" and "Table Step Group Value 2" and a multi-line parameter
      """
      This is my
      multi-line argument.
      """

    Examples:
      | Example Argument 1 | Example Argument 2 |
      | Example 1.1        | Example 2.1        |
      | Example 1.2        | Example 2.2        |

  Step Group: /^I am a step group$/
    And I am step 1 of the step group
    And I am step 2 of the step group

  Step Group: /^I am a step group with inline parameters "([^"]*)" and "([^"]*)"$/
    And I am a step that uses the inline parameter "1" value of "{0}"
    And I am a step that uses the inline parameter "2" value of "{1}"

  Step Group: /^I am a step group with inline parameters "([^"]*)" and "([^"]*)" and a table parameter$/
    And I am a step that uses the inline parameter 1 value of {0}
    And I am a step that uses the inline parameter 2 value of {1}
    And I am a step that uses the example parameter 1 value of {2}
    And I am a step that uses the example parameter 2 value of {3}
    And I am a step that uses the inline parameters and table parameters in my table argument
      | Column 1  | Column 2  | Column 3  | Column 4  |
      | {0}.1     | {1}.1     | {2}.1     | {3}.1     |
      | {0}.2     | {1}.2     | {2}.2     | {3}.2     |
    And I am a step that uses my own inline parameters "inline parameter 1" and "inline parameter 2" and my parent inline parameters in my table
      | Column 1  | Column 2  | Column 3  | Column 4  |
      | {0}.1     | {1}.1     | {2}.1     | {3}.1     |
      | {0}.2     | {1}.2     | {2}.2     | {3}.2     |
    And I am a step that uses the inline parameters and table parameters in my multi-line argument
      """
      This is my
      multi-line argument
      with step group inline argument 1: {0}
      and step group inline argument 2: {1}
      and step group table argument 1: {2}
      and step group table argument 2: {3}
      """

