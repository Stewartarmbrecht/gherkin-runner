module.exports = {
  name: "Gherkin Engine Features",
  description: "Contains all features that specify how the features, scenarios, steps, outlines, backgrounds, and step groups should be processed.",
  featurePaths: [
    "/features/gherkin-runner/engine/scenarioSteps.feature",
    "/features/gherkin-runner/engine/scenarioOutlines.feature",
    "/features/gherkin-runner/engine/backgrounds.feature",
    "/features/gherkin-runner/engine/featureBackgrounds.feature",
    "/features/gherkin-runner/engine/stepGroups.feature",
    "/features/gherkin-runner/engine/libraries.feature"
  ],
  featureSetPaths: [],
  libraryPaths: [
    "/features/step_definitions/gherkinRunnerTestLibrary.js",
    "/features/step_definitions/gherkinRunnerLibrary.js"
  ]
};
