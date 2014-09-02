Feature: Browse Features
  In order to review the scope of an application
  As a user
  I would like to be able to browse the tree of feature sets and features

  Scenario: Load gherkin walker with default feature set
    Given I am a new user
    When I navigate to the site
    Then the gherkin walker should display
    And it should load the "features/featureSet" feature set
    And it should show the following tree
    """
    All Features
      Gherkin Runner Features
      Gherkin Runner Test Samples
      Todo Sample Application
    """

  Scenario: Load gherkin walker with specific features set
    Given I am a new user
    When I navigate to the site with the following URL parameters
    | parameter      | value                                          |
    | walkFeatureSet | /features/test-examples/testExamplesFeatureSet |
    And I specify a feature set in the URL
    Then the gherkin walker should load
    And it should load the feature set at "/features/featureSet.js"

  Scenario: View feature set title, counts, and description
    Given I navigate to the site
    When I view a feature set
    Then I should see the feature set title
    And I should see the feature set description
    And I should see the count of features for the feature set
    And I should see the count of child feature sets for the feature set
    And I should see a link to drill into the feature set
    And I should see a link to expand the feature set

  Scenario: View feature set child feature sets

  Scenario: View feature set child features

  Scenario: Expand feature set

  Scenario: Collapse feature set

  Scenario: Expand feature

  Scenario: Expand feature with imports

  Scenario: Collapse feature

  Scenario: Expand scenario

  Scenario: Collapse scenario

  Scenario: View an inline parameter in a step

  Scenario: View a multi-line parameter in a step

  Scenario: View a table parameter in a step

  Scenario: Expand step information

  Scenario: Expand step group

  Scenario: Expand step implemented by step group

  Scenario: Expand scenario outline

  Scenario: Expand scenario outline example

  Scenario: View a scenario outline example step with an example argument substitution

  Scenario: View a scenario outline example step with an inline argument example argument substitution

  Scenario: View a scenario outline example step with a multi-line argument example argument substitution

  Scenario: View a scenario outline example step with a table argument example argument substitution

  Scenario: Expand background

  Scenario: Expand background outline

  Scenario: Expand feature background

  Scenario: Expand feature background outline

  Scenario: Expand feature comments

  Scenario: Expand scenario comments

  Scenario: Expand step comments

  Scenario: Expand step group comments

  Scenario: Drill into a feature set
    Given I am viewing a child feature set
    When I click the details icon for the feature set
    Then the page should refresh
    And the clicked feature set should be set as the root feature set