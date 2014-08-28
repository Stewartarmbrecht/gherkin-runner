/*jslint node: true */
"use strict";
module.exports = function () {
  var gherkinRunner = require('gherkin-runner/gherkinRunner'),
    utilities = require('features/support/utilities'),
    diff = require('gherkin-runner/vendor/deep-diff/releases/deep-diff-0.2.0.min').diff;
  this.$ = null;
  this.Given(/^a file "([^"]*)" with the following content:$/, function(filePath, expectedFileContents, callback) {
    require(['text!' + filePath], function(fileContents){
      var errorMsg = utilities.compareMultiLineStrings(expectedFileContents, fileContents);
      callback(errorMsg);
    }, function(error){
      callback(error);
    })
  });
  this.Given(/^I am a standard step$/, function(callback) {
    callback();
  });
  this.Given(/^I am run$/, function(callback) {
    callback();
  });
  this.Given(/^I should pass$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step that will fail$/, function(callback) {
    callback();
  });
  this.Given(/^I should fail$/, function(callback) {
    callback(new Error('I am failing on purpose.'));
  });
  this.Given(/^I should be skipped$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step with an inline parameter of "([^"]*)"$/, function(inlineArg, callback) {
    callback();
  });
  this.Given(/^I am a step with a multi-line parameter of$/, function(multiLineArg, callback) {
    callback();
  });
  this.Given(/^I am a step with a table parameter of$/, function(tableArg, callback) {
    callback();
  });
  this.Given(/^I am a step with an inline comment$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step followed by a full line comment$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step with an inline expression of "([^"]*)" that verifies my inline parameter value is Hello World$/, function(inlineArg, callback) {
    callback();
  });
  this.Given(/^I am a step with a true conditional that succeeds$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step with a true conditional that fails$/, function(callback) {
    callback(new Error('I failed on purpose.'));
  });
  this.Given(/^I am a step with a false conditional that fails$/, function(callback) {
    callback(new Error('I failed on purpose.'));
  });
  this.Given(/^X$/, function(callback) {
    callback();
  });
  this.Given(/^Y$/, function(callback) {
    callback();
  });
  this.Given(/^Z$/, function(callback) {
    callback();
  });
};