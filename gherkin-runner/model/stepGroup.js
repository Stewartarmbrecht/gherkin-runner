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
  this.childBreakpoints = ko.observable(0);
  this.childLoaded = ko.observable(0);
  this.childMissingMethod = ko.observable(0);
  this.childRun = ko.observable(0);
  this.childSkipped = ko.observable(0);
  this.childPassed = ko.observable(0);
  this.childFailed = ko.observable(0);
  this.feature = feature;
  feature.stepGroups.push(this);
};

StepGroup.prototype.addChildLoaded = function addChildLoaded(count) {
  this.childLoaded(this.childLoaded() + count);
};

StepGroup.prototype.resetResults = function resetResults() {
  utilities.resetStandardCounts(this);
  this.steps().forEach(function(step) {
    step.resetResults();
  });
};

StepGroup.prototype.addChildRunResult = function addChildRunResult(result) {
  utilities.addChildRunResult(this, result);
};

StepGroup.prototype.addChildMissingMethod = function addChildMissingMethod() {
  this.childMissingMethod(this.childMissingMethod + 1);
};

StepGroup.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints + 1);
};

StepGroup.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints - 1);
};

module.exports = StepGroup;