"use strict";
define([], function () {
  var diff = require('gherkin-runner/vendor/deep-diff/releases/deep-diff-0.2.0.min').diff;
  var _this = {};
  _this.$ = null;
  _this.waitTillTrue = function (trueFunc) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      if (trueFunc()) {
        dfd.resolve();
        clearInterval(intv);
      }
      if (count > 50) {
        var error = new Error('Had to wait for 5 seconds for the the expression to return true.');
        dfd.reject(error);
        clearInterval(intv);
      }
      count = count + 1;
    }, 100, intv, count, trueFunc);
    return dfd.promise();
  };
  _this.waitTillExist = function (selector) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      if (_this.$(selector).length > 0) {
        dfd.resolve();
        clearInterval(intv);
      }
      if (count > 50) {
        clearInterval(intv);
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + selector + ' to exist.'));
      }
      count = count + 1;
    }, 100, _this, intv, count, selector, dfd)
    return dfd.promise();
  };
  _this.waitTillVisible = function (visibleSelector) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      if (_this.$(visibleSelector).is(':visible')) {
        dfd.resolve(_this.$(visibleSelector));
        clearInterval(intv);
      }
      if (count > 50) {
        clearInterval(intv);
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to be visible.'));
      }
      count = count + 1;
    }, 100, _this, intv, count, visibleSelector, dfd)
    return dfd.promise();
  };
  _this.waitTillAttributeValue = function (selector, attribute, value) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      var foundValue = _this.$(selector).attr(attribute);
      if (foundValue == value) {
        dfd.resolve();
        clearInterval(intv);
      }
      if (count > 50) {
        clearInterval(intv);
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to have an attribute of "' + attribute + '" with a value of "'+value.toString()+'".  It had a value of "' + foundValue + '".'));
      }
      count = count + 1;
    }, 100, _this, intv, count, selector, attribute, value, dfd)
    return dfd.promise();
  };
  _this.waitTillHasText = function (selector, text, trim) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      var found = _this.$(selector);
      var foundText = found.text();
      if (trim && foundText)
        foundText = foundText.trim();
      if (foundText === text) {
        dfd.resolve();
        clearInterval(intv);
      }
      if (count > 50) {
        clearInterval(intv);
        if (found.length < 1)
          dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
        else
          dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to have text "' + text + '".  It had "' + foundText + '" instead.'));
      }
      count = count + 1;
    }, 100, _this, intv, count, selector, text, dfd)
    return dfd.promise();
  };
  _this.compareStringArrays = function (expectedArray, actualArray) {
    var errorMsg = null;
    if(expectedArray.length != actualArray.length)
    {
      errorMsg = errorMsg + 'The library code did not match the specified code on line count. ' +
        '\nExpected Count: \n' + expectedArray.length +
        '\nActual Count: \n' + actualArray.length + '\n';
    } else if (diff(expectedArray, actualArray)) {
      for(var i = 0; i < expectedArray.length; i++) {
        if (actualArray[i] != expectedArray[i])
          errorMsg = errorMsg + 'Line ' + i + ' did not match.\n' +
            '\nExpected Line: \n' + expectedArray[i] +
            '\nActual Line: \n' + actualArray[i] + '\n';
      }
      errorMsg = errorMsg + 'The library code did not match the specified code on lines. ' +
        '\nExpected Array: \n' + expectedArray.join('\n') +
        '\nActual Array: \n' + actualArray.join('\n');
    }
    return errorMsg;
  };
  return _this;
});
