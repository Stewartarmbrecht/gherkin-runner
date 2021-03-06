var utilities = require('/gherkin-runner/model/utilities.js');
function Step(line, lineNumber, feature, stepOwner) {
  if(stepOwner.type === 'step') {
    this.type = 'sub-step';
    this.displayType = 'Sub Step';
    this.displayTypeAbbreviation = 'SSt';
  } else {
    this.type = 'step';
    this.displayType = 'Step';
    this.displayTypeAbbreviation = 'St';
  }
  this.name = line;
  this.id = utilities.encodeId(feature.path + '_' + stepOwner.id + '_' + this.name);
  this.runCondition = null;
  this.comments = ko.observableArray();
  if (this.name.indexOf('if(') > -1) {
    this.runCondition = this.name.trim().substring(this.name.trim().indexOf('if(') + 3, this.name.trim().length - 1);
    this.name = this.name.substring(0, this.name.indexOf('if('));
  }
  this.originalName = line;
  this.lineNumber = lineNumber;
  this.outline = false;
  this.steps = ko.observableArray();
  this.tableArg = [];
  this.tableArgArray = [];
  this.tableArgColumns = [];
  this.methodName = null;
  this.method = null;
  this.inlineArgs = [];
  this.multiLineArg = [];
  this.libraryName = null;
  this.libraryMethodName = null;
  this.libraryMethodFullName = null;
  this.clones = [];
  this.breakpoint = ko.observable(false);
  this.missingMethod = ko.observable(false);
  this.childBreakpoints = ko.observable(0);
  this.childLoaded = ko.observable(0);
  this.childMissingMethod = ko.observable(0);
  this.childRun = ko.observable(0);
  this.childSkipped = ko.observable(0);
  this.childPassed = ko.observable(0);
  this.childFailed = ko.observable(0);
  this.runResult = ko.observable();
  this.childLastRun = ko.observable(0);
  this.childLastSkipped = ko.observable(0);
  this.childLastPassed = ko.observable(0);
  this.childLastFailed = ko.observable(0);
  this.lastRunResult = ko.observable();
  this.error = ko.observable();
  this.lastError = ko.observable();
  this.aborted = false;
  this.expanded = ko.observable(false);
  this.detailsExpanded = ko.observable(false);
  this.commentsExpanded = ko.observable(false);
  this.errorExpanded = ko.observable(false);
  this.lastErrorExpanded = ko.observable(false);
  this.stepOwner = stepOwner;
  stepOwner.steps.push(this);
  stepOwner.addChildLoaded(1);
  this.level = stepOwner.level + 1;
};

Step.prototype.toggleExpanded = function toggleExpanded() {
  this.expanded(!this.expanded());
};

Step.prototype.toggleDetailsExpanded = function toggleDetailsExpanded() {
  this.detailsExpanded(!this.detailsExpanded());
};

Step.prototype.toggleCommentsExpanded = function toggleCommentsExpanded() {
  this.commentsExpanded(!this.commentsExpanded());
};

Step.prototype.toggleErrorExpanded = function toggleErrorExpanded() {
  this.errorExpanded(!this.errorExpanded());
};

Step.prototype.toggleLastErrorExpanded = function toggleLastErrorExpanded() {
  this.lastErrorExpanded(!this.lastErrorExpanded());
};

Step.prototype.addChildLoaded = function addChildLoaded(count) {
  var currentCount = this.childLoaded();
  this.childLoaded(this.childLoaded() + count);
  //Only add child loaded to the parent if this is not the first sub step.
  //This will avoid double counting because this step was also added to the
  //owners child count when it was created.
  if(currentCount > 0) {
    this.stepOwner.addChildLoaded(count);
  }
};

Step.prototype.resetResults = function resetResults() {
  utilities.resetStandardCounts(this);
  this.steps().forEach(function(subStep) {
    subStep.resetResults();
  });
};

Step.prototype.setRunResult = function setRunResult(result) {
  if(result !== -1 && result !== 0 && result !== 1)
    throw new Error('The value passed to setRunResult must be -1 (Failed), 0 (Skipped), or 1 (Passed)');
  this.runResult(result);
  if(this.childLoaded() === 0) {
    this.childLoaded(1);
    this.childRun(1);
    if(result === -1)
      this.childFailed(1);
    else if(result === 0)
      this.childSkipped(1);
    else
      this.childPassed(1);
  }
  this.stepOwner.addChildRunResult(result);
};

Step.prototype.addChildRunResult = function addChildRunResult(result) {
  utilities.addChildRunResult(this, result);
  this.stepOwner.addChildRunResult(result);
};

Step.prototype.setMissingMethod = function setMissingMethod() {
  this.missingMethod(true);
  this.stepOwner.addChildMissingMethod();
};

Step.prototype.addChildMissingMethod = function addChildMissingMethod() {
  this.childMissingMethod(this.childMissingMethod() + 1);
  this.stepOwner.addChildMissingMethod();
};

Step.prototype.setBreakpoint = function setBreakpoint() {
  this.breakpoint(true);
  this.stepOwner.addChildBreakpoint();
};

Step.prototype.removeBreakpoint = function removeBreakpoint() {
  this.breakpoint(false);
  this.stepOwner.removeChildBreakpoint();
};

Step.prototype.addChildBreakpoint = function addChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() + 1);
  this.stepOwner.addChildBreakpoint();
};

Step.prototype.removeChildBreakpoint = function removeChildBreakpoint() {
  this.childBreakpoints(this.childBreakpoints() - 1);
  this.stepOwner.removeChildBreakpoint();
};

Step.prototype.clone = function clone(exampleArg) {
  var steps = ko.observableArray();
  var clone = new Step(this.line, this.lineNumber, this.feature, this.stepOwner);
  clone.id = this.id + '_' + this.clones.length + 1;
  clone.type = 'sub-step';
  clone.displayType = 'Sub Step';
  clone.displayTypeAbbreviation = 'SSt';
  clone.name = this.name;
  clone.comments = this.comments;
  clone.runCondition = this.runCondition;
  clone.originalName = this.originalName;
  clone.lineNumber = this.lineNumber;
  clone.runResult = ko.observable();
  clone.lastRunResult = ko.observable();
  clone.error = ko.observable();
  clone.lastError = ko.observable();
  clone.outline = false;
  clone.steps = steps;
  clone.tableArg = [];
  clone.tableArgArray = [];
  clone.tableArgColumns = this.tableArgColumns.slice(0);
  clone.methodName = this.methodName;
  clone.method = this.method;
  clone.inlineArgs = this.inlineArgs.slice(0);
  clone.multiLineArg = this.multiLineArg.slice(0);
  clone.libraryName = this.libraryName;
  clone.libraryMethodName = this.libraryMethodName;
  clone.libraryMethodFullName = this.libraryMethodFullName;
  clone.clones = [];
  clone.breakpoint = ko.observable(false);
  if (exampleArg) {
    clone.name = utilities.replaceExampleParameters(clone.name, exampleArg);
    clone.type = 'example-step';
    clone.runCondition = (this.runCondition ? utilities.replaceExampleParameters(this.runCondition, exampleArg) : null);
    clone.multiLineArg.forEach(function (lineArg, index, multiLineArg) {
      multiLineArg[index] = (lineArg ? utilities.replaceExampleParameters(lineArg, exampleArg) : null);
    });
  }
  this.steps().forEach(function (subStep) {
    var stepClone = subStep.clone();
    stepClone.stepOwner = clone;
    clone.steps.push(stepClone);
  });

  this.tableArgArray.forEach(function (rowArg, index) {
    var cloneRowArg = rowArg.slice(0);
    if (exampleArg) {
      cloneRowArg.forEach(function (columnArg, index, cloneRowArg) {
        cloneRowArg[index] = utilities.replaceExampleParameters(columnArg, exampleArg);
      });
    }
    clone.tableArgArray[index] = cloneRowArg;
  });
  this.tableArg.forEach(function (tableRow, index) {
    var cloneTableRow = $.extend(true, {}, tableRow);
    if (exampleArg) {
      Object.keys(cloneTableRow).forEach(function (prop) {
        cloneTableRow[prop] = utilities.replaceExampleParameters(cloneTableRow[prop], exampleArg);
      });
    }
    clone.tableArg[index] = cloneTableRow;
  });
  this.clones[this.clones.length] = clone;
  this.addChildLoaded(clone.childLoaded());
  return clone;
};

Step.prototype.copyStepGroupStep = function copyStepGroupStep(step, outlineParameters) {
  var stepCopy = this.clone();

  stepCopy.name = utilities.replaceParameters(stepCopy.name, step.inlineArgs);
  if (stepCopy.runCondition)
    stepCopy.runCondition = utilities.replaceParameters(stepCopy.runCondition, step.inlineArgs);
  if (outlineParameters)
    stepCopy.name = utilities.replaceStepGroupOutlineParameters(stepCopy.name, outlineParameters);

  $.merge(stepCopy.inlineArgs, step.inlineArgs);
  if (stepCopy.tableArgColumns.length > 0 && stepCopy.tableArgColumns[0].trim() == 'PARENT_TABLE_ARG') {
    var copied = step.tableArg.slice(0);
    copied.forEach(function(tableRow, index) {
      copied[index] = $.extend(true, {}, tableRow);
    });
    stepCopy.tableArg = copied;

    var copiedArray = step.tableArgArray.slice(0);
    copiedArray.forEach(function (tableRow, index) {
      copiedArray[index] = tableRow.slice(0);
    });
    stepCopy.tableArgArray = copiedArray;

    stepCopy.tableArgColumns = $.extend(true, {}, step.tableArgColumns);
  }
  if (stepCopy.tableArgColumns.length > 0 && stepCopy.tableArgArray[0][0].trim() == 'MERGE_PARENT_TABLE') {
    var parent = step.tableArg.slice(0);
    var mergeIn = stepCopy.tableArg.slice(1);
    var merged = $.merge(parent, mergeIn);
    merged.forEach(function (tableRow, index) {
      merged[index] = $.extend(true, {}, tableRow);
    });
    stepCopy.tableArg = merged;

    var parentArray = step.tableArgArray.slice(0);
    var mergeInArray = stepCopy.tableArgArray.slice(1);
    var mergedArray = $.merge(parentArray, mergeInArray);
    mergedArray.forEach(function (tableRow, index) {
      mergedArray[index] = tableRow.slice(0);
    });
    stepCopy.tableArgArray = mergedArray;

    stepCopy.tableArgColumns = step.tableArgColumns.slice(0);
  }
  stepCopy.tableArg.forEach(function (tableRow, index) {
    for (var property in tableRow) {
      tableRow[property] = utilities.replaceParameters(tableRow[property], stepCopy.inlineArgs);
      if (outlineParameters)
        tableRow[property] = utilities.replaceStepGroupOutlineParameters(tableRow[property], outlineParameters);
    }
  });
  stepCopy.tableArgArray.forEach(function (index, tableRow) {
    tableRow.forEach(function (tableField, index) {
      tableRow[index] = utilities.replaceParameters(tableField, stepCopy.inlineArgs);
      if (outlineParameters)
        tableRow[index] = utilities.replaceStepGroupOutlineParameters(tableRow[index], outlineParameters);
    });
  });
  for (var property in stepCopy.exampleArg) {
    stepCopy.exampleArg[property] = utilities.replaceParameters(stepCopy.exampleArg[property], stepCopy.inlineArgs);
    if (outlineParameters)
      stepCopy.exampleArg[property] = utilities.replaceStepGroupOutlineParameters(stepCopy.exampleArg[property], outlineParameters);
  }

  stepCopy.stepOwner = step;
  step.steps.push(stepCopy);
};


module.exports = Step;