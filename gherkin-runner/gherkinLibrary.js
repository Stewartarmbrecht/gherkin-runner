/*jslint node: true */
"use strict";
module.exports = function () {
  var helpers = this.helpers = {};
  helpers.$ = null;
  helpers.cycleCheck = function (checkFunc, failMessage, interval, checkCount) {
    interval = interval || 100;
    checkCount = checkCount || 50;
    var dfd = new $.Deferred();
    var count = 0;
    var intv = setInterval(function () {
      try {
        if (checkFunc()) {
          clearInterval(intv);
          dfd.resolve();
        }
      } catch(error) {
        clearInterval(intv);
        dfd.reject(error);
      }
      if (count > checkCount) {
        clearInterval(intv);
        dfd.reject(new Error(failMessage));
      }
      count = count + 1;
    }, interval, intv, count, checkFunc, dfd, checkCount, failMessage);
    return dfd.promise();
  };
  helpers.waitTillVisible = function (visibleSelector, inverted, interval, checkCount) {
    var failMessage = 'Had to wait for 5 seconds for the element with selector "' + visibleSelector + '" to ' + (inverted ? ' not ' : '') + 'be visible.';
    var checkFunc = null;
    if (inverted)
      checkFunc = function () {
        return !helpers.$(visibleSelector).is(':visible');
      };
    else
      checkFunc = function () {
        return helpers.$(visibleSelector).is(':visible');
      };
    return helpers.cycleCheck(checkFunc, failMessage, interval, checkCount);
  };
  helpers.waitTillExists = function (selector, inverted, interval, checkCount) {
    var message = 'Had to wait for 5 seconds for the element with selector "' + selector + '" to ' + (inverted ? ' not ' : '') + 'exist.';
    var checkFunc = null;
    if (inverted)
      checkFunc = function () {
        return !helpers.$(selector).length === 0;
      };
    else
      checkFunc = function () {
        return helpers.$(selector).length > 0;
      };
    return helpers.cycleCheck(checkFunc, message, interval, checkCount);
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
      try {
        var element = helpers.$(selector);
        if (element.is(':visible')) {
          dfd.resolve(element);
          clearInterval(intv);
        }
      } catch (error) {
        dfd.reject(error);
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
      try {
        if (trueFunc()) {
          dfd.resolve();
          clearInterval(intv);
        }
      } catch(error) {
        dfd.reject(error);
      }
      if (count > 50) {
        var error = new Error('Had to wait for 5 seconds for the function to return true.')
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
  this.Then(/^start a new browser session to relative path "([^"]+)"$/, function (pathname, callback) {
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
        console.log('Waiting till jquery exists in the child window.');
        return uiTestWindow[0].contentWindow.$;
      }).then(function () {
        console.log('Setting the helper jQuery.')
        helpers.$ = uiTestWindow[0].contentWindow.$;
        callback();
      });
    });
  });
  this.Then(/^click "([^"]*)"$/, function (cssSelector, callback) {
    helpers.click(cssSelector);
    callback();
  });
  this.Then(/^ok$/, function (callback) {
    callback();
  });
  this.Then(/^wait for "([^"]*)" to be visible$/, function (cssSelector, callback) {
    helpers.waitTillVisible(cssSelector)
      .then(callback)
      .fail(callback);
  });
  this.Then(/^wait for "([^"]*)" to not be visible$/, function (cssSelector, callback) {
    helpers.waitTillVisible(cssSelector)
      .then(callback)
      .fail(callback);
  });
  this.Then(/^wait for "([^"]*)" text to be "([^"]*)"$/, function (cssSelector, value, callback) {
    var textTest = function (element) {
      var text = helpers.$(element).text();
      return text === value;
    };
    helpers.getWhenVisible(cssSelector)
      .then(function(element) {
        helpers.waitTillTrue(function() { return textTest(element); })
          .then(callback)
          .fail(callback);
      })
      .fail(callback);
  });
  this.Then(/^wait for "([^"]*)" text to not be "([^"]*)"$/, function (cssSelector, value, callback) {
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
  this.Then(/^update "([^"]*)" value to "([^"]*)"$/, function (cssSelector, value, callback) {
    helpers.get(cssSelector)
      .then(function (input) {
        helpers.$(input).val(value).change();
        helpers.$(input).keydown();
        callback();
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" text is "([^"]*)"$/, function (cssSelector, value, callback) {
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
  this.Then(/^verify "([^"]*)" text is not "([^"]*)"$/, function (cssSelector, value, callback) {
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
  this.Then(/^verify "([^"]*)" is visible$/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (helpers.$(element).is(':visible'))
          callback();
        else
          callback(new Error('The "' + cssSelector + '" element is not visible.'));
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" is not visible$/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (!helpers.$(element).is(':visible'))
          callback();
        else
          callback(new Error('The "' + cssSelector + '" element is visible.'));
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" does exist$/, function (cssSelector, callback) {
    if (helpers.$(cssSelector).length > 0)
      callback();
    else
      callback(new Error('The "' + cssSelector + '" element does not exist.'));
  });
  this.Then(/^verify "([^"]*)" does not exist$/, function (cssSelector, callback) {
    if (helpers.$(cssSelector).length === 0)
      callback();
    else
      callback(new Error('The "' + cssSelector + '" element does exist.'));
  });
  this.Then(/^verify "([^"]*)" does exist after waiting$/, function (cssSelector, callback) {
    helpers.get(cssSelector)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" does not exist after waiting$/, function (cssSelector, callback) {
    helpers.waitTillGone(cssSelector)
      .then(function () {
        callback();
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" has class "([^"]*)"$/, function (cssSelector, className, callback) {
    helpers.get(cssSelector)
      .then(function (element) {
        if (helpers.$(element).hasClass(className))
          callback();
        else
          callback(new Error('The element "' + cssSelector + '" did not have the class: "' + className + '"'));
      })
      .fail(callback);
  });
  this.Then(/^verify "([^"]*)" does not have class "([^"]*)"$/, function (cssSelector, className, callback) {
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
