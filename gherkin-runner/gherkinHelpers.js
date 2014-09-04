/*jslint node: true */
"use strict";
var helpers = require('/gherkin-runner/gherkinHelper.js');
var _this = {};
_this.$ = null;
_this.uit = null;
_this.waitTillToasted = function (toast) {
  var dfd = new $.Deferred();
  var count = 0;
  var interval = setInterval(function () {
    if (_this.$('#emrError').is(':visible')) {
      var message = _this.$('#emrError #errorMessage').text();
      var details = _this.$('#emrError #errorDetails').text();
      var error = new Error(message);
      error.description = details;
      dfd.reject(error);
    }
    var toastMessage = _this.$('.toast-message').filter(function () {
      return _this.$(this).text() == toast;
    });
    var toastMessageIsVisible = toastMessage.is(':visible');
    if (toastMessage && toastMessageIsVisible) {
      dfd.resolve();
      clearInterval(interval);
    }
    if (count > 50) {
      clearInterval(interval);
      dfd.reject(new Error('Had to wait for 5 seconds for the toaster with a message of ' + toast + '.'));
    }
    count = count + 1;
  }, 100, interval, count, toast, dfd)
  return dfd.promise();
};
_this.waitTillToastingDone = function (toast) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$('#emrError').is(':visible')) {
      var message = _this.$('#emrError #errorMessage').text();
      var details = _this.$('#emrError #errorDetails').text();
      var error = new Error(message);
      error.description = details;
      dfd.reject(error);
    }
    var toastMessage = _this.$('.toast-message').filter(function () {
      return _this.$(this).text() == toast;
    });
    if (toastMessage.length === 0) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the toast with a message of ' + toast + ' to disappear.'));
    }
    count = count + 1;
  }, 100, intv, count, toast, dfd)
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
_this.waitTillNotVisible = function (visibleSelector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (!_this.$(visibleSelector).is(':visible')) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to be visible.'));
    }
    count = count + 1;
  }, 100, intv, count, visibleSelector, dfd)
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
_this.waitTillNotExist = function (selector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$(selector).length == 0) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + selector + ' to not exist.'));
    }
    count = count + 1;
  }, 100, intv, count, selector, dfd)
  return dfd.promise();
};
_this.waitTillHasClass = function (selector, className) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$(selector).hasClass(className)) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + selector + ' to have class ' + className + '.  Instead it had a class of ' + _this.$(selector)[0].class));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, className, dfd)
  return dfd.promise();
};
_this.waitTillNotHaveClass = function (selector, className) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (!_this.$(selector).hasClass(className)) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + selector + ' to not have class ' + className + '.'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, className, dfd)
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
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to have an attribute of "' + attribute + '" with a value of "' + value.toString() + '".  It had a value of "' + foundValue + '".'));
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
_this.waitTillNotHaveText = function (selector, text, trim) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var found = _this.$(selector);
    var foundText = found.text();
    if (trim && foundText)
      foundText = foundText.trim();
    if (foundText !== text) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      if (found.length < 1)
        dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
      else
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to not have text "' + text + '".'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, text, dfd)
  return dfd.promise();
};
_this.waitTillHaveValue = function (selector, val, trim) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var found = _this.$(selector);
    var foundValue = found.val();
    if (trim && foundValue)
      foundValue = foundValue.trim();
    if (foundValue === val) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      if (found.length < 1)
        dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
      else
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to have a value of "' + val + '".  It had a value of "' + foundValue + '" instead.'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, val, dfd, trim)
  return dfd.promise();
};
_this.waitTillNotHaveValue = function (selector, val, trim) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var found = _this.$(selector);
    var foundValue = found.val();
    if (trim && foundValue)
      foundValue = foundValue.trim();
    if (foundValue !== val) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      if (found.length < 1)
        dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
      else
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to not have a value of "' + val + '".'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, val, dfd, trim)
  return dfd.promise();
};
_this.waitTillChecked = function (selector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var found = _this.$(selector);
    var foundValue = found.is(':checked');
    if (foundValue) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      if (found.length < 1)
        dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
      else
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to be checked.'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, dfd)
  return dfd.promise();
};
_this.waitTillNotChecked = function (selector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var found = _this.$(selector);
    var foundValue = found.is(':checked');
    if (!foundValue) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      if (found.length < 1)
        dfd.reject(new Error('Could not find element with selector "' + selector + '"'));
      else
        dfd.reject(new Error('Had to wait for 5 seconds for the element with selector "' + selector + '" to not be checked.'));
    }
    count = count + 1;
  }, 100, _this, intv, count, selector, dfd)
  return dfd.promise();
};
_this.waitTillGone = function (visibleSelector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$(visibleSelector).length === 0) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to not exist.'));
    }
    count = count + 1;
  }, 100, intv, count, visibleSelector, dfd)
  return dfd.promise();
};
_this.clickAndWaitTillToasted = function (selector, toast) {
  var dfd = new $.Deferred();
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  _this.$(selector).click();
  var stalled = false;
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$('#emrError').is(':visible')) {
      var message = _this.$('#emrError #errorMessage').text();
      var details = _this.$('#emrError #errorDetails').text();
      var error = new Error(message);
      error.description = details;
      dfd.reject(error);
    }
    var toastMessage = _this.$('.toast-message').filter(function () {
      return _this.$(this).text() == toast;
    });
    var toastMessageIsVisible = toastMessage.is(':visible');
    if (toastMessage && toastMessageIsVisible) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the toaster with a message of ' + toast + ' after clicking the element selected by ' + selector + '.'));
    }
    count = count + 1;
  }, 100, intv, count, toast, dfd, selector)
  return dfd.promise();
};
_this.clickAndWaitTillVisible = function (selector, visibleSelector) {
  var dfd = new $.Deferred();
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  _this.$(selector).click();
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$(visibleSelector).is(':visible')) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to be visible.'));
    }
    count = count + 1;
  }, 100, intv, count, visibleSelector, dfd)
  return dfd.promise();
};
_this.clickAndResolveWhenReady = function (selector, promise) {
  _this.$(selector).click();
  _this.uit.ready(function (document) {
    promise.resolve();
  });
};
_this.click = function (selector) {
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  _this.$(selector).click();
};
_this.tag = function (selector, tag) {
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  _this.$(selector).addClass(tag);
};
_this.getInnerText = function (selector) {
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  return _this.$(selector)[0].innerText;
};
_this.navigatePageAndResolveWhenVisible = function (path, visibleSelector, promise) {
  _this.$.address.value(path);
  var count = 0;
  var intv = setInterval(function () {
    if (_this.$(visibleSelector).is(':visible')) {
      promise.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      promise.reject(new Error('Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to be visible.'));
    }
    count = count + 1;
  }, 100, intv, count, visibleSelector, promise)
};
_this.getWhenVisible = function (selector) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    var element = _this.$(selector);
    if (element.is(':visible')) {
      dfd.resolve(element);
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Had to wait for 5 seconds for the element "' + selector + '" to be visible.'));
    }
    count = count + 1;
  }, 100, intv, count, selector, dfd)
  return dfd.promise();
};
_this.get = function (selector) {
  var dfd = new $.Deferred();
  var element = _this.$(selector);
  if (element) {
    dfd.resolve(element);
  } else {
    dfd.reject(new Error('Could not find the element "' + selector + '"'));
  }
  return dfd.promise();
};
_this.waitTillTrue = function (trueFunc) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (trueFunc()) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      var error = new Error('Had to wait for 5 seconds for the toaster with a message of ' + toast + ' after clicking a element.')
      dfd.reject(error);
      clearInterval(intv);
    }
    count = count + 1;
  }, 100, intv, count, trueFunc);
  return dfd.promise();
};
_this.clickAndResolveWhenTrue = function (selector, promise, trueFunc) {
  if (!_this.$(selector)[0])
    throw new Error('The ' + selector + ' element could not be found.');
  _this.$(selector).click();
  var count = 0;
  var intv = setInterval(function () {
    if (trueFunc()) {
      promise.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      promise.reject(new Error('Function for clickAndResolveWhenTrue never returned true.'));
    }
    count = count + 1;
  }, 100, intv, count, promise)
};
_this.whenTrue = function (trueFunc) {
  var dfd = new $.Deferred();
  var count = 0;
  var intv = setInterval(function () {
    if (trueFunc()) {
      dfd.resolve();
      clearInterval(intv);
    }
    if (count > 50) {
      clearInterval(intv);
      dfd.reject(new Error('Function for whenTrue never returned true.'));
    }
    count = count + 1;
  }, 100, intv, count, trueFunc, dfd)
  return dfd.promise();
};
_this.verifyOptions = function (selectSelector, optionValues) {
  var dfd = new $.Deferred();
  var results = "";
  var currentOptionValues = [];
  var currentOptionDisplays = [];
  _this.$(selectSelector + " option").each(function () {
    currentOptionValues.push($(this).val());
    currentOptionDisplays.push($(this).text().trim());
  });
  _this.$.each(optionValues, function (index, tableRow) {
    if (!currentOptionValues[index]) {
      results = results + '\nOption at index [' + index + '] was not found.';
    } else {
      if (currentOptionValues[index] && currentOptionValues[index] != tableRow.Value) {
        results = results + '\nOption at index [' + index + '] did not have a value of "' + tableRow.Value + '", it had a value of "' + currentOptionValues[index] + '".';
      }
      if (currentOptionDisplays[index] && currentOptionDisplays[index] != tableRow.Text) {
        results = results + '\nOption at index [' + index + '] did not have a display of "' + tableRow.Text + '", it had a display of "' + currentOptionDisplays[index] + '".';
      }
    }
  });
  if (results.length > 0)
    dfd.reject(new Error(results));
  else
    dfd.resolve();

  return dfd.promise();
}

module.exports = _this;