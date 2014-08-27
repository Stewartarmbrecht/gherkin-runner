module.exports = {
  name: "ToDo App Sample Features",  //This is the name that will display in the Gherkin Runner.
  featurePaths: [
    "/features/todo-app/buildToDoList", //This is the path to the file without the .html extension.
  ],
  featureSetPaths: {},
  libraryPaths: [
    "/features/step_definitions/library"
  ]
};
