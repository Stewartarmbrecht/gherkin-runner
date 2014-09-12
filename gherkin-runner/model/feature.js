var utilities = require('/gherkin-runner/model/utilities.js');
function Feature(line, lineNumber, featurePath, featureSet) {
  this.id = utilities.encodeId(featurePath);
  this.path = featurePath;
  this.type = 'feature';
  this.displayType = 'Feature';
  this.displayTypeAbbreviation = 'F';
  this.name = line.substr(9, line.length - 9);
  this.lineNumber = lineNumber;
  this.description = ko.observableArray();
  this.scenarios = ko.observableArray();
  this.backgrounds = ko.observableArray();
  this.stepGroups = ko.observableArray();
  this.comments = ko.observableArray();
  this.extraLines = ko.observableArray();
  this.runResult = ko.observable();
  this.lastRunResult = ko.observable();
  this.breakpoint = ko.observable(false);
  this.state = {};
  this.childBreakpoints = ko.observable(0);
  this.childLoaded = ko.observable(0);
  this.childMissingMethod = ko.observable(0);
  this.childRun = ko.observable(0);
  this.childSkipped = ko.observable(0);
  this.childPassed = ko.observable(0);
  this.childFailed = ko.observable(0);
  this.expanded = ko.observable(false);
  this.detailsExpanded = ko.observable(false);
  this.commentsExpanded = ko.observable(false);
  this.featureSet = featureSet;
  this.level = featureSet.level + 1;
};

Feature.prototype.toggleExpanded = function toggleExpanded() {
  this.expanded(!this.expanded());
};

Feature.prototype.toggleDetailsExpanded = function toggleDetailsExpanded() {
  this.detailsExpanded(!this.detailsExpanded());
};

Feature.prototype.toggleCommentsExpanded = function toggleCommentsExpanded() {
  this.commentsExpanded(!this.commentsExpanded());
};

Feature.prototype.addChildLoaded = function addChildLoaded(count) {
  this.childLoaded(this.childLoaded() + count);
  this.featureSet.addChildLoaded(count);
};

Feature.prototype.resetState = function resetState() {
  this.state = {};
  this.scenarios().forEach(function(scenario) {
    scenario.resetState();
  });
  this.backgrounds().forEach(function(background) {
    background.resetState();
  });
};

Feature.prototype.resetResults = function resetResults() {
  utilities.resetStandardCounts(this);
  this.scenarios().forEach(function(scenario) {
    scenario.resetResults();
  });
  this.backgrounds().forEach(function(background) {
    background.resetResults();
  });
  this.stepGroups().forEach(function(stepGroup) {
    stepGroup.resetResults();
  });
};

Feature.prototype.addChildRunResult = function addChildRunResult(result) {
  utilities.addChildRunResult(this, result);
  this.featureSet.addChildRunResult(result);
};

Feature.prototype.addChildMissingMethod = function addChildMissingMethod() {
  this.childMissingMethod(this.childMissingMethod() + 1);
  this.featureSet.addChildMissingMethod();
};

Feature.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() + 1);
  this.featureSet.addChildBreakpoint();
};

Feature.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() - 1);
  this.featureSet.removeChildBreakpoint();
};

module.exports = Feature;