module.exports = {
  name: "Test Examples - Used to Test the Gherkin Runner",
  featureSetPaths: [
    "features/test-examples/featureSetX/featureSetX",
    "features/test-examples/featureSetY/featureSetY"
  ],
  featurePaths: [
    "features/test-examples/allCapabilities"
  ],
  libraryPaths: [
    '/features/step_definitions/test-examples'
  ]
};
