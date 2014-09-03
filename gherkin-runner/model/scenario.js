var utilities = require('/gherkin-runner/model/utilities.js');
function Scenario(line, lineNumber, feature) {
  this.lineNumber = lineNumber;
  this.line = line;
  this.steps = ko.observableArray();
  this.examples = [];
  this.examplesDisplay = [];
  this.examplesArrays = [];
  this.exampleArgColumns = [];
  this.exampleArgColumnsDisplay = null;
  this.exampleArg = null;
  this.exampleArgDisplay = null;
  this.number = feature.scenarios.length;
  this.runResult = ko.observable();
  this.lastRunResult = ko.observable();
  this.breakpoint = ko.observable(false);
  this.clones = [];
  this.aborted = false;
  this.step = null;
  this.error = ko.observable();
  this.lastError = ko.observable();
  this.state = {};
  this.scenarios = ko.observableArray();
  this.comments = ko.observableArray();
  this.feature = feature;
  this.childMissingMethod = ko.observable(0);
  this.childBreakpoints = ko.observable(0);
  this.childSkipped = ko.observable(0);
  this.childPassed = ko.observable(0);
  this.childFailed = ko.observable(0);
  if (line.toLowerCase().indexOf("scenario:") === 0) {
    this.type = 'scenario';
    this.name = line.trim().substr(10, line.length - 10);
    this.id = utilities.encodeId(feature.path + '_' + this.name);
    this.outline = false;
    feature.scenarios.push(this);
  } else if (line.toLowerCase().indexOf("scenario outline:") === 0) {
    this.type = 'scenario outline';
    this.name = line.trim().substr(18, line.length - 18);
    this.id = utilities.encodeId(feature.path + '_' + this.name);
    this.outline = true;
    feature.scenarios.push(this);
  } else if (line.toLowerCase().indexOf("feature background:") === 0) {
    this.type = 'feature background';
    this.name = line.trim().substr(19, line.length - 19);
    this.id = utilities.encodeId(feature.path + '_' + this.name);
    this.outline = false;
    feature.backgrounds.push(this);
  } else if (line.toLowerCase().indexOf("feature background outline:") === 0) {
    this.type = 'feature background outline';
    this.name = line.trim().substr(27, line.length - 27);
    this.id = utilities.encodeId(feature.path + '_' + this.name);
    this.outline = true;
    feature.backgrounds.push(this);
  }
  this.feature = feature;
};

Scenario.prototype.createExample = function createExample(exampleIndex) {
  var clone = new Scenario(this.line, this.lineNumber, this.feature)
  clone.id = this.id + '_' + this.clones.length + 1,
  clone.type = this.type.replace(' outline', ''),
  clone.exampleArgColumns = this.exampleArgColumns,
  clone.exampleArgColumnsDisplay = this.exampleArgColumnsDisplay,
  clone.exampleArg = this.examples[exampleIndex],
  clone.exampleArgDisplay = this.examplesDisplay[exampleIndex],
  clone.outline = false,
  $.each(this.steps(), function (index, step) {
    step.outline = true;
    var stepClone = step.clone(this.examples[exampleIndex]);
    stepClone.stepOwner = clone;
    clone.steps.push(stepClone);
  });
  this.clones.push(clone);
  return clone;
};

Scenario.prototype.resetState = function resetState() {
  this.state = {};
  this.scenarios().forEach(function(scenario) {
    scenario.resetState();
  });
};

Scenario.prototype.resetResults = function resetResults() {
  this.lastRunResult(this.runResult());
  this.runResult(null);
  this.childSkipped(0);
  this.childPassed(0);
  this.childFailed(0);
  this.steps().forEach(function(step) {
    step.resetResults();
  });
  this.scenarios().forEach(function(scenario) {
    scenario.resetResults();
  });
};

Scenario.prototype.addChildRunResult = function addChildRunResult(result) {
  if(result !== -1 && result !== 0 && result !== 1)
    throw new Error('The value passed to setRunResult must be -1 (Failed), 0 (Skipped), or 1 (Passed)');
  if(result === -1)
    this.childFailed(this.childFailed() + 1);
  else if(result === 0)
    this.childSkipped(this.childSkipped() + 1);
  else if(result === 1)
    this.childPassed(this.childPassed() + 1);

  this.runResult(utilities.aggregateRunResult(result, this.runResult()));

  this.feature.addChildRunResult(this.runResult());
};

Scenario.prototype.addChildMissingMethod = function addChildMissingMethod() {
  this.childMissingMethod(this.childMissingMethod() + 1);
  this.feature.addChildMissingMethod();
};

Scenario.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() + 1);
  this.feature.addChildBreakpoint();
};

Scenario.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() - 1);
  this.feature.removeChildBreakpoint();
};

module.exports = Scenario;