var utilities = require('/gherkin-runner/model/utilities.js');
function FeatureSet(featureSet, featureSetPath, parentFeatureSet) {
  this.id = utilities.encodeId(featureSetPath);
  this.name = featureSet.name || 'Unnamed Feature Set';
  this.description = featureSet.description || null;
  this.featureSetPaths = featureSet.featureSetPaths || [];
  this.featurePaths = featureSet.featurePaths || [];
  this.libraryPaths = featureSet.libraryPaths || [];
  this.path = featureSetPath;
  this.featureSets = ko.observableArray();
  this.features = ko.observableArray();
  this.selected = ko.observable(false);
  this.expanded = ko.observable(false);
  this.loaded = ko.observable(-1);
  this.runResult = ko.observable();
  this.lastRunResult = ko.observable();
  this.missingChildMethods = ko.observable(0);
  this.childBreakpoints = ko.observable(0);
  this.childSkipped = ko.observable();
  this.childPassed = ko.observable();
  this.childFailed = ko.observable();
  this.parentFeatureSet = parentFeatureSet;
  if(parentFeatureSet)
    parentFeatureSet.featureSets.push(this);
};

FeatureSet.prototype.resetState = function resetState() {
  this.features().forEach(function(feature) {
    feature.resetState();
  });
  this.featureSets().forEach(function(featureSet) {
    featureSet.resetState();
  });
};

FeatureSet.prototype.resetResults = function resetResults() {
  this.lastRunResult(this.runResult);
  this.runResult(null);
  this.childSkipped(0);
  this.childPassed(0);
  this.childFailed(0);
  this.features().forEach(function(feature) {
    feature.resetResults();
  });
  this.featureSets().forEach(function(featureSet) {
    featureSet.resetResults();
  });
};

FeatureSet.prototype.addChildRunResult = function addChildRunResult(result) {
  if(result !== -1 && result !== 0 && result !== 1)
    throw new Error('The value passed to setRunResult must be -1 (Failed), 0 (Skipped), or 1 (Passed)');
  if(result === -1)
    this.childFailed(this.childFailed() + 1);
  else if(result === 0)
    this.childSkipped(this.childSkipped() + 1);
  else if(result === 1)
    this.childPassed(this.childPassed() + 1);

  if(!this.runResult())
    this.runResult(result);
  else if(result === -1)
    this.runResult(-1);
  else if(result === 0 && this.runResult() !== -1)
    this.runResult(0);

  if(this.parentFeatureSet)
    this.parentFeatureSet.addChildRunResult(result);
};

FeatureSet.prototype.addMissingChildMethods = function addMissingChildMethods() {
  this.missingChildMethods(this.missingChildMethods() + 1);
  if(this.parentFeatureSet)
    this.parentFeatureSet.addMissingChildMethods();
};

FeatureSet.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() + 1);
  if(this.parentFeatureSet)
    this.parentFeatureSet.addChildBreakpoint();
};

FeatureSet.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() - 1);
  if(this.parentFeatureSet)
    this.parentFeatureSet.removeChildBreakpoint();
};

module.exports = FeatureSet;