/*jslint node: true */
"use strict";
var ParsingContext = require('/gherkin-runner/model/parsingContext.js'),
  Feature = require('/gherkin-runner/model/feature.js'),
  FeatureDescription = require('/gherkin-runner/model/featureDescription.js'),
  Scenario = require('/gherkin-runner/model/scenario.js'),
  Step = require('/gherkin-runner/model/step.js'),
  StepGroup = require('/gherkin-runner/model/stepGroup.js'),
  utilities = require('/gherkin-runner/model/utilities.js');
var _this = {};
_this.parseFeature = function parseFeature(featureText, featurePath, featureSet) {
  var lines = featureText.split('\n');
  var parsingContext = new ParsingContext(featurePath, featureSet);
  lines.forEach(function (line, index) {
    _this.setCurrentLine(line, index, parsingContext);
    _this.parseLine(parsingContext);
  });
  return parsingContext.feature;
};
_this.parseLine = function (parsingContext) {
  if (_this.currentLineIsNotEmpty(parsingContext)) {
    if (_this.isMultiLineArgumentLine(parsingContext)) {
      if (_this.isMultiLineArgumentClosingLine(parsingContext))
        _this.clearLastRead(parsingContext);
      else
        _this.addLineAsMultiLineArgument(parsingContext);
    } else if (_this.isMultiLineArgumentOpeningLine(parsingContext)) {
      _this.setParsingMultiLineArgument(parsingContext);
    } else if (_this.isCommentLine(parsingContext)) {
      _this.addCommentToLastObject(parsingContext);
    } else if (_this.isFeatureLine(parsingContext)) {
      _this.addFeature(parsingContext);
    } else if (_this.isScenarioOrBackgroundLine(parsingContext)) {
      _this.addScenario(parsingContext);
    } else if (_this.isExamplesLine(parsingContext)) {
      _this.setParsingExample(parsingContext);
    } else if (_this.isStepGroupLine(parsingContext)) {
      _this.addStepGroup(parsingContext);
    } else if (_this.isFeatureDescriptionLine(parsingContext)) {
      _this.addFeatureDescription(parsingContext);
    } else if (_this.isStepLine(parsingContext)) {
      _this.addStep(parsingContext);
    } else if (_this.isTableLine(parsingContext)) {
      if (_this.isExampleTableLine(parsingContext)) {
        if (_this.isExampleTableColumnLine(parsingContext)) {
          _this.addExampleTableColumns(parsingContext);
        } else {
          _this.addExampleTableRow(parsingContext);
        }
      } else {
        if (_this.isTableColumnLine(parsingContext)) {
          _this.addTableColumns(parsingContext);
        } else {
          _this.addTableRow(parsingContext);
        }
      }
    } else {
      _this.addExtraLine(parsingContext);
    }
  }
};

_this.setCurrentLine = function setCurrentLine(line, index, parsingContext) {
  parsingContext.untrimmedLine = line;
  if (parsingContext.untrimmedLine.indexOf('\r') > 0)
    parsingContext.untrimmedLine = parsingContext.untrimmedLine.replace(/(\r\n|\n|\r)/gm, "");
  parsingContext.line = line.trim();
  parsingContext.lineNumber = index + 1;
  parsingContext.lastIndentation = parsingContext.indentation;
  parsingContext.indentation = parsingContext.untrimmedLine.indexOf(parsingContext.line);
  if(_this.isTableLine(parsingContext))
    parsingContext.tableLineArgs = line.substr(1, line.length - 2).split("|")
};
_this.currentLineIsNotEmpty = function currentLineIsNotEmpty(parsingContext) {
  return parsingContext.line.length > 0;
};
_this.isMultiLineArgumentLine = function isMultiLineArgumentLine(parsingContext) {
  return parsingContext.lastRead === 'multi-line-argument';
};
_this.isMultiLineArgumentClosingLine = function isMultiLineArgumentClosingLine(parsingContext) {
  return parsingContext.lastRead === 'multi-line-argument' && parsingContext.line.toLowerCase().trim().indexOf('"""') === 0;
};
_this.isMultiLineArgumentOpeningLine = function isMultiLineArgumentOpeningLine(parsingContext) {
  return parsingContext.lastRead !== 'multi-line-argument' && parsingContext.line.toLowerCase().trim().indexOf('"""') === 0;
};
_this.isCommentLine = function isCommentLine(parsingContext) {
  return parsingContext.line.toLowerCase().trim().indexOf("##") === 0 || parsingContext.line.toLowerCase().trim().indexOf("#") === 0;
};
_this.isFeatureLine = function isFeatureLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("feature:") === 0;
};
_this.isScenarioOrBackgroundLine = function isScenarioOrBackgroundLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("scenario:") === 0
    || parsingContext.line.toLowerCase().indexOf("scenario outline:") === 0
    || parsingContext.line.toLowerCase().indexOf("feature background:") === 0
    || parsingContext.line.toLowerCase().indexOf("feature background outline:") === 0;
};
_this.isExamplesLine = function isExamplesLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("examples:") === 0;
};
_this.isStepGroupLine = function isStepGroupLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("step group:") === 0 || parsingContext.line.toLowerCase().indexOf("step group outline:") === 0;
};
_this.isFeatureDescriptionLine = function isFeatureDescriptionLine(parsingContext) {
  return (parsingContext.lastRead == 'feature' || parsingContext.lastRead == 'feature description') && parsingContext.line.indexOf('<div') !== 0;
};
_this.isStepLine = function isStepLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("given ") === 0 ||
    parsingContext.line.toLowerCase().indexOf("when ") === 0 ||
    parsingContext.line.toLowerCase().indexOf("then ") === 0 ||
    parsingContext.line.toLowerCase().indexOf("and ") === 0 ||
    parsingContext.line.toLowerCase().indexOf("but ") === 0;
};
_this.isSubStepLine = function isSubStepLine(parsingContext) {
  var indentationChange = parsingContext.indentation - parsingContext.lastIndentation;
  return (parsingContext.lastRead === 'step' || parsingContext.lastRead === 'sub step' && indentationChange >= 4)
    || (parsingContext.lastRead === 'sub step' && indentationChange < 4 && indentationChange > -1);
};
_this.isTableLine = function isTableLine(parsingContext) {
  return parsingContext.line.toLowerCase().indexOf("|") === 0;
};
_this.isExampleTableLine = function isExampleTableLine(parsingContext) {
  return parsingContext.lastRead == 'example';
};
_this.isExampleTableColumnLine = function isExampleTableColumnLine(parsingContext) {
  return parsingContext.stepOwner.exampleArgColumns.length == 0
};
_this.isTableColumnLine = function isTableColumnLine(parsingContext) {
  return parsingContext.step.tableArgColumns.length == 0;
};


_this.addLineAsMultiLineArgument = function addLineAsMultiLineArgument(parsingContext) {
  parsingContext.lastObject.multiLineArg.push(parsingContext.untrimmedLine.substring(parsingContext.multiLineArgumentIndent));
};
_this.setParsingMultiLineArgument = function setParsingMultiLineArgument(parsingContext) {
  parsingContext.lastRead = 'multi-line-argument';
  parsingContext.multiLineArgumentIndent = parsingContext.untrimmedLine.indexOf('"""');
};
_this.clearLastRead = function clearLastRead(parsingContext) {
  parsingContext.lastRead = '';
};
_this.addCommentToLastObject = function addCommentToLastObject(parsingContext) {
  if (parsingContext.lastObject)
    parsingContext.lastObject.comments.push(parsingContext.line);
};
_this.addFeature = function addFeature(parsingContext) {
  parsingContext.feature = new Feature(parsingContext.line, parsingContext.lineNumber, parsingContext.featurePath, parsingContext.featureSet);
  parsingContext.lastRead = 'feature';
  parsingContext.lastObject = parsingContext.feature;
};
_this.addScenario = function addScenario(parsingContext) {
  parsingContext.scenario = new Scenario(parsingContext.line, parsingContext.lineNumber, parsingContext.feature);
  parsingContext.lastObject = parsingContext.scenario;
  parsingContext.lastRead = parsingContext.scenario.type;
  parsingContext.stepOwner = parsingContext.scenario;
};
_this.setParsingExample = function setParsingExample(parsingContext) {
  parsingContext.lastRead = 'example';
};
_this.addStepGroup = function addStepGroup(parsingContext) {
  parsingContext.stepGroup = new StepGroup(parsingContext.line, parsingContext.lineNumber, parsingContext.feature);
  parsingContext.lastObject = parsingContext.stepGroup;
  parsingContext.stepOwner = parsingContext.stepGroup;
  parsingContext.lastRead = 'step group';
};
_this.addFeatureDescription = function addFeatureDescription(parsingContext) {
  parsingContext.feature.description.push(new FeatureDescription(parsingContext.line, parsingContext.lineNumber, parsingContext.feature));
  parsingContext.lastRead = 'feature description';
};
_this.addStep = function addStep(parsingContext) {
  if(_this.isSubStepLine(parsingContext)) {
    parsingContext.subStep = new Step(parsingContext.line, parsingContext.lineNumber, parsingContext.feature, parsingContext.step);
    parsingContext.lastRead = 'sub step';
  }
  else {
    parsingContext.step = new Step(parsingContext.line, parsingContext.lineNumber, parsingContext.feature, parsingContext.stepOwner);
    parsingContext.lastRead = 'step';
  }
  parsingContext.lastObject = parsingContext.step;
};
_this.addExampleTableColumns = function addExampleTableColumns(parsingContext) {
  parsingContext.stepOwner.exampleArgColumns = parsingContext.tableLineArgs;
  parsingContext.stepOwner.exampleArgColumnsDisplay = parsingContext.line;
};
_this.addExampleTableRow = function addExampleTableColumns(parsingContext) {
  var argsObj = {};
  var argsArray = [];
  parsingContext.stepOwner.exampleArgColumns.forEach(function (argName, i) {
    argsObj[argName.trim()] = parsingContext.tableLineArgs[i].trim();
    argsObj[argName.trim() + '_Display'] = parsingContext.tableLineArgs[i];
    argsArray[argsArray.length] = parsingContext.tableLineArgs[i].trim();
  });
  parsingContext.stepOwner.examples.push(argsObj);
  parsingContext.stepOwner.examplesArrays.push(argsArray);
  parsingContext.stepOwner.examplesDisplay.push(parsingContext.line);
};
_this.addTableColumns = function addTableColumns(parsingContext) {
  parsingContext.lastObject.tableArgColumns = parsingContext.tableLineArgs;
};
_this.addTableRow = function addTableRow(parsingContext) {
  var argsObj = {};
  var argsArray = [];
  parsingContext.lastObject.tableArgColumns.forEach(function (argName, i) {
    argsObj[argName.trim()] = parsingContext.tableLineArgs[i].trim();
    argsObj[argName.trim() + '_Display'] = parsingContext.tableLineArgs[i];
    argsArray.push(parsingContext.tableLineArgs[i].trim());
  });
  parsingContext.lastObject.tableArg.push(argsObj);
  parsingContext.lastObject.tableArgArray.push(argsArray);
};
_this.addExtraLine = function addExtraLine(parsingContext) {
  parsingContext.feature.extraLines.push({
    lineNumber: parsingContext.lineNumber,
    line: ko.observable(parsingContext.line)
  });
};

module.exports = _this;