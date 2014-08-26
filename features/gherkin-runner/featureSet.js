module.exports = {
  name: "Gherkin Runner Features",  //This is the name that will display in the Gherkin Runner.
  featurePaths: [
    "/features/gherkin-runner/stepArgumentTypes",
    "/features/gherkin-runner/libraries"
  ],
  featureSetPaths: {},
  libraryPaths: [
    "/features/step_definitions/library",
    "/features/step_definitions/librariesFeatureTestLibrary"
  ]
};
