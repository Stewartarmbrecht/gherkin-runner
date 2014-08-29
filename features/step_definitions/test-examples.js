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
  this.Then(/^inside the method this\.\$context should be$/, function(objectString, callback){
    var errorMessage = utilities.compareObjectToMultiLineString(this.context, objectString);
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
    var errorMessage = utilities.compareObjectToMultiLineString(actualValue, expectedValue);
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



  this.Given(/^a file "([^"]*)" with the following content:$/, function(filePath, expectedFileContents, callback) {
    require(['text!' + filePath], function(fileContents){
      var errorMsg = utilities.compareMultiLineStrings(expectedFileContents, fileContents);
      callback(errorMsg);
    }, function(error){
      callback(error);
    })
  });
  this.Then(/^I should pass$/, function(callback) {
    if(!pass)
      callback(new Error('The step did not pass.'));
    else
      callback();
  });
  this.Given(/^I should have my first argument with a value of A$/, function(callback) {
    if(this.argumentValue === 'A')
      callback();
    else
      callback(new Error('My argument value was not A it was ' + this.argumentValue));
  });
  this.Given(/^I should have my first argument with a value of B$/, function(callback) {
    if(this.argumentValue === 'B')
      callback();
    else
      callback(new Error('My argument value was not B it was ' + this.argumentValue));
  });
  this.Given(/^I should have my first argument with a flattened value of "([^"]*)"$/, function(multiLineArgFlattened, callback) {
    var actualValue = this.multiLineArg.join('\n');
    if(actualValue === multiLineArgFlattened)
      callback();
    else
      callback(new Error('My argument value was not "'+multiLineArgFlattened+'" it was "' + actualValue + '"'));
  });
  this.Given(/^I am a step with a table parameter of$/, function(tableArg, callback) {
    this.tableArgArray = arguments[0];
    this.tableArg = this.$context.tableArg;
    callback();
  });
  this.Given(/^I should have my first argument to be an array of rows that each are an array of column values$/, function(callback) {
    if(this.tableArgArray && this.tableArgArray.isArray() && this.tableArgArray[0] && this.tableArgArray[0].isArray())
      callback();
    else
      callback(new Error('The first arguments was not an array of arrays.'))
  });
  this.Given(/^tableArg\[0]\[0] should equal "([^"]*)"$/, function(expectedValue, callback) {
    var actualValue = this.tableArgArray[0][0];
    if(actualValue === expectedValue)
      callback();
    else
      callback(new Error('The value did not equal "' + expectedValue + '" it was "' + actualValue + '"'))
  });
  this.Given(/^tableArg\[1]\[1] should equal "([^"]*)"$/, function(expectedValue, callback) {
    var actualValue = this.tableArgArray[1][1];
    if(actualValue === expectedValue)
      callback();
    else
      callback(new Error('The value did not equal "' + expectedValue + '" it was "' + actualValue + '"'))
  });
  this.Given(/^this.$context.tableArg should be an array of objects whose properties are the names of the columns$/, function(callback) {
    if(this.tableArg && this.tableArg.isArray() && this.tableArg[0] && !this.tableArg[0].isArray())
      callback();
    else
      callback(new Error('The first arguments was not an array of objects.'))
  });
  this.Given(/^this.$context.tableArg\[1]\['Column 1'] should equal "([^"]*)"$/, function(expectedValue, callback) {
    var actualValue = this.tableArg[0]['Column 1'];
    if(actualValue === expectedValue)
      callback();
    else
      callback(new Error('The value did not equal "' + expectedValue + '" it was "' + actualValue + '"'))
  });
  this.Given(/^this.$context.tableArg\[0]\['Column 2'] should equal "([^"]*)"$/, function(expectedValue, callback) {
    callback();
  });
  this.Given(/^tableArg[0][0] should equal "Value 1.1.B"$/, function(callback) {
    callback();
  });
  this.Given(/^tableArg[1][1] should equal "Value 2.2.B"$/, function(callback) {
    callback();
  });
  this.Given(/^this.$context.tableArg[1]['Column 1'] should equal "Value 1.2.B"$/, function(callback) {
    callback();
  });
  this.Given(/^this.$context.tableArg[0]['Column 2'] should equal "Value 2.1.B"$/, function(callback) {
    callback();
  });
  this.Given(/^tableArg[0][0] should equal "Value 1.1"$/, function(callback) {
    callback();
  });
  this.Given(/^tableArg[1][1] should equal "Value 2.2"$/, function(callback) {
    callback();
  });
  this.Given(/^this.$context.tableArg[1]['Column 1'] should equal "Value 1.2"$/, function(callback) {
    callback();
  });
  this.Given(/^this.$context.tableArg[0]['Column 2'] should equal "Value 2.1"$/, function(callback) {
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
  this.Given(/^I am a non-standard step$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step that does have a step definition$/, function(callback) {
    callback();
  });
  this.Given(/^I am a step with an inline expression of "([^"]*)" that verifies my inline parameter value is Hello World (.*)$/, function(expressionValue, expectedValue, callback) {
    debugger;
    callback();
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