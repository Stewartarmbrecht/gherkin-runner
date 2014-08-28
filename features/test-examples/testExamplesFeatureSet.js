module.exports = {
  name: "Test Examples - Used to Test the Gherkin Runner",
  featureSetPaths: [
    "features/test-examples/featureSetX/featureSetX",
    "features/test-examples/featureSetY/featureSetY"
  ],
  featurePaths: [
    "features/test-examples/examplesOfScenarioSteps",
    "features/test-examples/examplesOfScenarioOutlineSteps",
    "features/test-examples/examplesOfBackgrounds",
    "features/test-examples/examplesOfFeatureBackgrounds",
    "features/test-examples/examplesOfStepGroups"
  ],
  libraryPaths: [
    '/features/step_definitions/test-examples'
  ]
};
