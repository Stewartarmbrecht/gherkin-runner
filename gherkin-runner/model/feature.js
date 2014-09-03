var utilities = require('/gherkin-runner/model/utilities.js');
function Feature(line, lineNumber, featurePath, featureSet) {
  this.id = utilities.encodeId(featurePath);
  this.path = featurePath;
  this.type = 'feature';
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
  this.missingChildMethods = ko.observable(0);
  this.childBreakpoints = ko.observable(0);
  this.childSkipped = ko.observable();
  this.childPassed = ko.observable();
  this.childFailed = ko.observable();
  this.featureSet = featureSet;
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
  this.lastRunResult(this.runResult());
  this.runResult(null);
  this.childSkipped(0);
  this.childPassed(0);
  this.childFailed(0);
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
  if(result !== -1 && result !== 0 && result !== 1)
    throw new Error('The value passed to setRunResult must be -1 (Failed), 0 (Skipped), or 1 (Passed)');
  if(result === -1)
    this.childFailed(this.childFailed() + 1);
  else if(result === 0)
    this.childSkipped(this.childSkipped() + 1);
  else if(result === 1)
    this.childPassed(this.childPassed() + 1);

  this.runResult(utilities.aggregateRunResult(result, this.runResult()));

  this.featureSet.addChildRunResult(this.runResult());
};

Feature.prototype.addMissingChildMethods = function addMissingChildMethods() {
  this.missingChildMethods(this.missingChildMethods() + 1);
  this.featureSet.addMissingChildMethods();
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