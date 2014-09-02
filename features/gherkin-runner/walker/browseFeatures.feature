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