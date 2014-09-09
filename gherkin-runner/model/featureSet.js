var utilities = require('/gherkin-runner/model/utilities.js');
function FeatureSet(featureSet, featureSetPath, parentFeatureSet) {
  this.id = utilities.encodeId(featureSetPath);
  this.type = 'feature-set';
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
  this.childBreakpoints = ko.observable(0);
  this.childLoaded = ko.observable(0);
  this.childMissingMethod = ko.observable(0);
  this.childRun = ko.observable(0);
  this.childSkipped = ko.observable(0);
  this.childPassed = ko.observable(0);
  this.childFailed = ko.observable(0);
  this.parentFeatureSet = parentFeatureSet
  this.comments = ko.observableArray();
  this.expanded = ko.observable(false);
  this.detailsExpanded = ko.observable(false);
  if(parentFeatureSet){
    this.level = parentFeatureSet.level + 1;
    parentFeatureSet.featureSets.push(this);
  } else {
    this.level = 0;
  }

};

FeatureSet.prototype.toggleExpanded = function toggleExpanded() {
  this.expanded(!this.expanded());
};

FeatureSet.prototype.toggleDetailsExpanded = function toggleDetailsExpanded() {
  this.detailsExpanded(!this.detailsExpanded());
};

FeatureSet.prototype.addChildLoaded = function addChildLoaded(count) {
  if(this.parentFeatureSet){
    this.parentFeatureSet.addChildLoaded(1);
  }
  this.childLoaded(this.childLoaded() + count);
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
  utilities.resetStandardCounts(this);
  this.features().forEach(function(feature) {
    feature.resetResults();
  });
  this.featureSets().forEach(function(featureSet) {
    featureSet.resetResults();
  });
};

FeatureSet.prototype.addChildRunResult = function addChildRunResult(result) {
  utilities.addChildRunResult(this, result);
  if(this.parentFeatureSet)
    this.parentFeatureSet.addChildRunResult(result);
};

FeatureSet.prototype.addChildMissingMethod = function addChildMissingMethod() {
  this.childMissingMethod(this.childMissingMethod() + 1);
  if(this.parentFeatureSet)
    this.parentFeatureSet.addChildMissingMethod();
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