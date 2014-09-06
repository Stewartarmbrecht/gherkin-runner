/*jslint node: true */
"use strict";
function ParsingContext(featurePath, featureSet) {
  this.featurePath = featurePath;
  this.featureSet = featureSet;
  this.lastRead = null;
  this.feature = null;
  this.scenario = null;
  this.step = null;
  this.subStep = null;
  this.stepOwner = null;
  this.lastObject = null;
  this.lastIndentation = -1;
  this.line = null;
  this.untrimmedLine = null;
  this.lineNumber = -1;
  this.indentation = -1;
  this.tableLineArgs = [];
};


module.exports = ParsingContext;