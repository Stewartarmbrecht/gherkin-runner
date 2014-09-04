/*jslint node: true */
"use strict";
module.exports = function () {
  var gherkinRunner = require('/gherkin-runner/gherkinRunner.js');
  var errorChecker = null;
  var helpers = this.helpers = {};
  helpers.$ = null;
  helpers.cycleCheck = function (checkFunc, failMessage, quitOnError, interval, checkCount) {
    interval = interval || 100;
    checkCount = checkCount || 50;
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      if (quitOnError && errorChecker && typeof errorChecker === 'function') {
        var error = errorChecker();
        clearInterval(intv);
        dfd.reject(error);
      }
      if (checkFunc()) {
        clearInterval(intv);
        dfd.resolve();
      }
      if (count > checkCount) {
        clearInterval(intv);
        dfd.reject(failMessage);
      }
      count = count + 1;
    }, interval, _this, intv, count, checkFunc, dfd, checkCount, quitOnError, failMessage);
    return dfd.promise();
  };
  helpers.waitTillVisible = function (visibleSelector, quitOnError, inverted, interval, checkCount) {
    var message = 'Had to wait for 5 seconds for the element with selector "' + visibleSelector + '" to ' + (inverted ? ' not ' : '') + 'be visible.';
    var checkFunc = null;
    if (inverted)
      checkFunc = function () {
        return !helpers.$(visibleSelector).is(':visible');
      };
    else
      checkFunc = function () {
        return helpers.$(visibleSelector).is(':visible');
      };
    return helpers.cycleCheck(checkFunc, message, quitOnError, interval, checkCount);
  };
  helpers.waitTillExists = function (selector, quitOnError, inverted, interval, checkCount) {
    var message = 'Had to wait for 5 seconds for the element with selector "' + visibleSelector + '" to ' + (inverted ? ' not ' : '') + 'exist.';
    var checkFunc = null;
    if (inverted)
      checkFunc = function () {
        return !helpers.$(selector).length === 0;
      };
    else
      checkFunc = function () {
        return helpers.$(selector).length > 0;
      };
    return helpers.cycleCheck(checkFunc, message, quitOnError, interval, checkCount);
  };
  helpers.click = function (selector) {
    if (!helpers.$(selector)[0])
      throw new Error('The ' + selector + ' element could not be found.');
    helpers.$(selector).click();
  };
  helpers.getInnerText = function (selector) {
    if (!helpers.$(selector)[0])
      throw new Error('The ' + selector + ' element could not be found.');
    return helpers.$(selector)[0].innerText;
  };
  helpers.navigatePageAndResolveWhenVisible = function (path, visibleSelector, promise) {
    $.address.value(path);
    var count = 0;
    var intv = setInterval(function () {
      if (helpers.$(visibleSelector).is(':visible')) {
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
  helpers.getWhenVisible = function (selector) {
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      var element = helpers.$(selector);
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
  helpers.get = function (selector) {
    var dfd = new $.Deferred();
    var element = helpers.$(selector);
    if (element) {
      dfd.resolve(element);
    } else {
      dfd.reject(new Error('Could not find the element "' + selector + '"'));
    }
    return dfd.promise();
  };
  helpers.waitTillTrue = function (trueFunc) {
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
  helpers.clickAndResolveWhenTrue = function (selector, promise, trueFunc) {
    if (!helpers.$(selector)[0])
      throw new Error('The ' + selector + ' element could not be found.');
    helpers.$(selector).click();
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
  helpers.whenTrue = function (trueFunc) {
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
  this.Then('start a new browser session to relative "[^"]+"', function (pathname, callback) {
    var uiTestWindow = $('#uitestwindow');
    uiTestWindow.empty();
    helpers.$ = null;
    uiTestWindow.attr('src', 'about:blank');
    helpers.waitTillTrue(function () {
      return uiTestWindow[0].contentWindow.$ == undefined;
    }).then(function () {
      var url = location.href.replace(location.pathname, '') + pathname;
      uiTestWindow.attr('src', url);
      helpers.waitTillTrue(function () {
        return uiTestWindow[0].contentWindow.$;
      }).then(function () {
        helpers.$ = uiTestWindow[0].contentWindow.$;
        gherkinRunner.showUIWindow();
        callback();
      });
    });
  });
  this.Then(/click ".*"/, function (cssSelector, callback) {
    helpers.click(cssSelector);
    callback();
  });
  this.Then(/wait for ".*" to be visible/, function (cssSelector, callback) {
    helpers.waitTillVisible(cssSelector)
      .then(callback)
      .fail(callback);
  });
  this.Then(/wait for ".*" to not be visible/, function (cssSelector, callback) {
    helpers.waitTillVisible(cssSelector)
      .then(callback)
      .fail(callback);
  });
  this.Then(/update ".*" value to ".*"/, function (cssSelector, value, callback) {
    helpers.get(cssSelector)
      .then(function (input) {
        helpers.$(input).val(value).change();
        helpers.$(input).keydown();
        callback();
      })
      .fail(callback);
  });
  this.Then(/verify ".*" text is ".*"/, function (cssSelector, value, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        var text = helpers.$(element).text();
        if (text === value)
          callback();
        else
          callback(new Error('The "' + cssSelector + '" elements text is not "' + value + '" it is "' + text));
      })
      .fail(callback);
  });
  this.Then(/verify ".*" text is not ".*"/, function (cssSelector, value, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        var text = helpers.$(element).text();
        if (text !== value)
          callback();
        else
          callback(new Error('The "' + cssSelector + '" elements text was not "' + value + '" it was "' + text));
      })
      .fail(callback);
  });
  this.Then(/verify ".*" is visible/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (helpers.$(element).is(':visible'))
          callback();
        else
          callback(new Error('The "' + cssSelector + '" element is not visible.'));
      })
      .fail(callback);
  });
  this.Then(/verify ".*" is not visible/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (!helpers.$(element).is(':visible'))
          callback();
        else
          callback(new Error('The "' + cssSelector + '" element is visible.'));
      })
      .fail(callback);
  });
  this.Then(/verify ".*" does exist/, function (cssSelector, callback) {
    if (helpers.$(cssSelector).length > 0)
      callback();
    else
      callback(new Error('The "' + cssSelector + '" element does not exist.'));
  });
  this.Then(/verify ".*" does not exist/, function (cssSelector, callback) {
    if (helpers.$(cssSelector).length === 0)
      callback();
    else
      callback(new Error('The "' + cssSelector + '" element does exist.'));
  });
  this.Then(/verify ".*" does exist after waiting/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/verify ".*" does not exist after waiting/, function (cssSelector, callback) {
    helpers.waitTillGone(cssSelector)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/verify ".*" has class ".*"/, function (cssSelector, className, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (helpers.$(element).hasClass(className))
          callback();
        else
          callback(new Error('The element "' + cssSelector + '" did not have the class: "' + className + '"'));
      })
      .fail(callback);
  });
  this.Then(/verify ".*" does not have class ".*"/, function (cssSelector, className, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (!helpers.$(element).hasClass(className))
          callback();
        else
          callback(new Error('The element "' + cssSelector + '" did have the class: "' + className + '"'));
      })
      .fail(callback);
  });
};
