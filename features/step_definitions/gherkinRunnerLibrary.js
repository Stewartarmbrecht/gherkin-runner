/*jslint node: true */
"use strict";
module.exports = function () {
  var gherkinRunner = require('gherkin-runner/gherkinRunner'),
    utilities = require('gherkin-runner/gherkinUtilities');

  var isFunction = function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  };

  this.When(/^I am run$/, function(callback) {
    callback();
  });
  this.Then(/^argument ([\d]*) to the matching method should be the callback function$/, function(argOrdinal, callback) {
    var index = argOrdinal - 1;
    if(isFunction(this.stepArguments[index]))
      callback();
    else
      callback(new Error('Argument ' + argOrdinal + ' was not a function.'));
  });
  this.Then(/^inside the method this\.\$context should be$/, function(expectedObjectString, callback){
    expectedObjectString.forEach(function(line, index) { expectedObjectString[index] = line.replace('\\{\\{', '{{'); });
    var errorMessage = utilities.compareObjectToMultiLineString(this.context, expectedObjectString, true);
    if(errorMessage)
      callback(new Error(errorMessage));
    else
      callback();
  });
  this.Then(/^argument ([\d]*) to the matching method should be "([^"]*)"$/, function(argOrdinal, expectedValue, callback) {
    var index = argOrdinal - 1;
    if(this.stepArguments[index] === expectedValue)
      callback();
    else
      callback(new Error('Argument ' + argOrdinal + ' was not "'+expectedValue+'" it was "' +this.stepArguments[index]+ '"'));
  });
  this.Then(/^argument ([\d]*) to the matching method should be$/, function(argOrdinal, expectedValue, callback) {
    var index = argOrdinal - 1,
        actualValue = this.stepArguments[index];
    expectedValue.forEach(function(line, index) { expectedValue[index] = line.replace('\\{\\{', '{{'); });
    var errorMessage = utilities.compareObjectToMultiLineString(actualValue, expectedValue, true);
    if(errorMessage)
      callback(new Error(errorMessage));
    else
      callback();
  });
  this.Then(/^I should fail$/, function(callback) {
    callback(new Error('I am failing on purpose!'));
  });
  this.Then(/^I should be skipped$/, function(callback) {
    callback();
  });
  this.Then(/^I should pass$/, function(callback) {
    callback();
  });

  this.Given(/^I am a standard step$/, function(callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step that will fail$/, function(callback) {
    callback(new Error('I am failing on purpose!'));
  });
  this.Given(/^I am a step with an inline parameter of "([^"]*)"$/, function(inlineArg, callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step with a multi-line parameter of$/, function(multiLineArg, callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step with a multi-line parameter that has text before the first triple quote like$/, function(multiLineArg, callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step with a table parameter of$/, function(tableArg, callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step with an inline expression of "([^"]*)"$/, function(inlineArg, callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
  this.Given(/^I am a step with an inline comment$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step followed by a full line comment$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step with a true conditional that fails$/, function(callback) {
    callback(new Error('I failed on purpose.'));
  });
  this.Given(/^I am a step with a false conditional that fails$/, function(callback) {
    callback(new Error('I failed on purpose.'));
  });
  this.Given(/^I am a step with a true conditional that passes$/, function(callback) {
    this.stepArguments = arguments;
    this.context = this.$context;
    callback();
  });
};