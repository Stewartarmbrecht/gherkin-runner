module.exports = {
  name: "Test Examples",
  description: "This is a series of features and scenarios that are used for testing the gherkin runner.",
  featureSetPaths: [
    "/features/test-examples/featureSetX/featureSetX.js",
    "/features/test-examples/featureSetY/featureSetY.js"
  ],
  featurePaths: [
    "/features/test-examples/featureA.feature",
    "/features/test-examples/featureB.feature",
    "/features/test-examples/featureC.feature"
  ],
  libraryPaths: [
    '/features/step_definitions/testExamplesLibrary.js'
  ]
};
