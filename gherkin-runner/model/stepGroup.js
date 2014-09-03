var utilities = require('/gherkin-runner/model/utilities.js');
function StepGroup(line, lineNumber, feature) {
  var outline = line.toLowerCase().indexOf("step group outline:") === 0;
  this.used = 0;
  this.type = (outline ? 'step group outline' : 'step group');
  this.lineNumber = lineNumber;
  this.inlineArgs = [];
  this.multiLineArg = [];
  this.steps = ko.observableArray();
  this.name = (outline ? line.trim().substr(19, line.trim().length - 19).trim() : line.trim().substr(11, line.trim().length - 11).trim());
  this.id = utilities.encodeId(feature.path + '_' + this.name);
  this.runCondition = null;
  this.comments = ko.observableArray();
  if (this.name.indexOf('if(') > -1) {
    this.runCondition = this.name.trim().substring(this.name.trim().indexOf('if(') + 3, this.name.trim().length - 1);
    this.name = this.name.substring(0, this.name.indexOf('if('));
  }
  this.runResult = ko.observable();
  this.lastRunResult = ko.observable();
  this.missingChildMethods = ko.observable(0);
  this.childBreakpoints = ko.observable(0);
  this.childSkipped = ko.observable();
  this.childPassed = ko.observable();
  this.childFailed = ko.observable();
  this.feature = feature;
  feature.stepGroups.push(this);
};

StepGroup.prototype.resetResults = function resetResults() {
  this.lastRunResult(this.runResult());
  this.runResult(null);
  this.childSkipped(0);
  this.childPassed(0);
  this.childFailed(0);
  this.steps().forEach(function(step) {
    step.resetResults();
  });
};

StepGroup.prototype.addChildRunResult = function addChildRunResult(result) {
  if(result !== -1 && result !== 0 && result !== 1)
    throw new Error('The value passed to setRunResult must be -1 (Failed), 0 (Skipped), or 1 (Passed)');
  if(result === -1)
    this.childFailed(this.childFailed() + 1);
  else if(result === 0)
    this.childSkipped(this.childSkipped() + 1);
  else if(result === 1)
    this.childPassed(this.childPassed() + 1);

  this.runResult(utilities.aggregateRunResult(result, this.runResult()));

};

StepGroup.prototype.addMissingChildMethods = function addMissingChildMethods() {
  this.missingChildMethods(this.missingChildMethods + 1);
};

StepGroup.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints + 1);
};

StepGroup.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints - 1);
};

module.exports = StepGroup;