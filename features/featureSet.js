module.exports = {
  name: "Create New To Do List",  //This is the name that will display in the Gherkin Runner.
  featurePaths: [
    "features/createToDoList", //This is the path to the file without the .html extension.
    "features/stepArgumentTypes",
    "features/stepDefinitions",
    "features/libraries"
  ],
  libraryPaths: [
    "features/step_definitions/library",
    "features/step_definitions/librariesFeatureTestLibrary"
  ]
};
