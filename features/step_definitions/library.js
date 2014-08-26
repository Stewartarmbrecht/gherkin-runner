/*jslint node: true */
"use strict";
module.exports = function () {
  var gherkinRunner = require('gherkin-runner/gherkinRunner'),
    utilities = require('features/support/utilities'),
    diff = require('gherkin-runner/vendor/deep-diff/releases/deep-diff-0.2.0.min').diff;
  this.$ = null;
  this.Given(/^the user is on the home page$/, function (callback) {
    $.address.value('');
    var uiTestWindow = $('#uitestwindow');
    uiTestWindow.empty();
    utilities.$ = null;
    uiTestWindow.attr('src', 'about:blank');
    utilities.waitTillTrue(function () {
      return uiTestWindow[0].contentWindow.$ == undefined;
    }).then(function () {
      uiTestWindow.attr('src', 'todoApp/index.html');
      utilities.waitTillTrue(function () {
        return uiTestWindow[0].contentWindow.$;
      }).then(function () {
        utilities.$ = uiTestWindow[0].contentWindow.$;
        gherkinRunner.showUIWindow();
        callback();
      });
    });
  });
  this.Then(/^I should see an empty list$/, function (callback) {
    utilities.waitTillExist('#todo-list')
      .then(function () {
        var listLength = $('#todo-list li').length;
        if (listLength > 0)
          callback(new Error("The list was not empty."));
        else
          callback();
      })
      .fail(callback);
  });
  this.Then(/^there should be an input for the first to do$/, function (callback) {
    utilities.waitTillVisible('input#new-todo')
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/the entry field should have a placeholder that states "(.*)"/, function (placeholder, callback) {
    utilities.waitTillAttributeValue('input#new-todo', 'placeholder', placeholder)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/^the list should be titled "([^"]*)"$/, function (title, callback) {
    utilities.waitTillHasText('header#header > h1', title)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Given(/^I have a step with no arguments like this one$/, function (callback) {
    this.args = arguments;
    this.callback = callback;
    callback();
  });
  this.Given(/^I have a step with "([^"]*)" like this one$/, function (inlineArg, callback) {
    this.args = arguments;
    this.callback = callback;
    this["inline argument"] = inlineArg;
    callback();
  });
  this.Given(/^I have a step with a multi line argument:$/, function (multiLineArg, callback) {
    this.args = arguments;
    this.callback = callback;
    this["multi-line argument"] = multiLineArg;
    callback();
  });
  this.Given(/^I have a step with a table argument:$/, function (tableArg, callback) {
    this.args = arguments;
    this.callback = callback;
    this["table argument"] = tableArg;
    callback();
  });
  this.When(/^the step runs$/, function (callback) {
    callback();
  });
  this.Then(/^the step method should have "([^\"]*)" argument$/, function (argsLength, callback) {
    if (this.args.length !== Number(argsLength))
      callback(new Error('The args length did not equal "' + argsLength + '" it equaled "' + this.args.length + '"'));
    else
      callback();
  });
  this.Then(/^argument "([^\"]*)" should be the callback$/, function (argNumber, callback) {
    var argIndex = Number(argNumber) - 1;
    if (this.args[argIndex] !== this.callback)
      callback(new Error('Argument "' + argNumber + '" did not equal the callback function.'));
    else
      callback();
  });
  this.Then(/^argument "([^\"]*)" should have the value "([^"]*)"$/, function (argNumber, argValue, callback) {
    var argIndex = Number(argNumber) - 1;
    if (this.args[Number(argIndex)] !== argValue)
      callback(new Error('The "' + argNumber + '" argument did not equal "' + argValue + '" it equaled "' + this.args[argIndex] + '"'));
    else
      callback();
  });
  this.Then(/^argument "([^\"]*)" should be an array with these values:$/, function (argNumber, expectedArrayText, callback) {
    var argIndex = Number(argNumber) - 1;
    var expectedArray = eval(expectedArrayText.join(''));
    var actualArray = this.args[argIndex];
    var compareResult = diff(actualArray, expectedArray);
    if (compareResult && compareResult.length > 0) {
      var errorMsg = 'The "' + argNumber + '" argument did not match the specified array. ' +
        '\nExpected Array: \n' + JSON.stringify(expectedArray) +
        '\nActual Array: \n' + JSON.stringify(actualArray);
      callback(new Error(errorMsg));
    }
    else
      callback();
  });
};