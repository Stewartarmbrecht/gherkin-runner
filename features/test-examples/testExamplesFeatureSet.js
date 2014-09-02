module.exports = {
  name: "Test Examples - Used to Test the Gherkin Runner",
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
