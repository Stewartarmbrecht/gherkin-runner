/*jslint node: true */
"use strict";
module.exports = function () {
  var helpers = this.helpers = {};
  var cycleCheckError = 'Check function did not return true after the time specified by the interval and check count.';
  helpers.$ = null;
  helpers.cycleCheck = function (checkFunc, interval, checkCount) {
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
        dfd.reject(new Error(cycleCheckError));
      }
      count = count + 1;
    }, interval, intv, count, checkFunc, dfd, checkCount);
    return dfd.promise();
  };
  helpers.waitTillVisible = function (visibleSelector, inverted, interval, checkCount) {
    var dfd = new $.Deferred();
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
    helpers.cycleCheck(checkFunc, interval, checkCount)
      .then(function() { dfd.resolve(); })
      .fail(function(error) {
        if(error.message === cycleCheckError)
          dfd.fail(new Error(failMessage));
        else
          dfd.fail(error);
      });
    return dfd.promise();
  };
  helpers.waitTillExists = function (selector, inverted, interval, checkCount) {
    var dfd = new $.Deferred();
    var failMessage = 'Had to wait for 5 seconds for the element with selector "' + selector + '" to ' + (inverted ? ' not ' : '') + 'exist.';
    var checkFunc = null;
    if (inverted)
      checkFunc = function () {
        return !helpers.$(selector).length === 0;
      };
    else
      checkFunc = function () {
        return helpers.$(selector).length > 0;
      };
    helpers.cycleCheck(checkFunc, interval, checkCount)
      .then(function() { dfd.resolve(); })
      .fail(function(error) {
        if(error.message === cycleCheckError)
          dfd.fail(new Error(failMessage));
        else
          dfd.fail(error);
      });
    return dfd.promise();
  };
  helpers.click = function (selector) {
    var dfd = new $.Deferred();
    if (!helpers.$(selector)[0])
      dfd.reject(new Error('The ' + selector + ' element could not be found.'));
    try {
      helpers.$(selector).click();
      dfd.resolve();
    } catch(error) {
      dfd.reject(error);
    }
    return dfd.promise();
  };
  helpers.getInnerText = function (selector) {
    var dfd = new $.Deferred();
    if (!helpers.$(selector)[0])
      dfd.reject(new Error('The ' + selector + ' element could not be found.'));
    try {
      helpers.$(selector)[0].innerText;
      dfd.resolve();
    } catch(error) {
      dfd.reject(error);
    }
    return dfd.promise();
  };
  helpers.navigatePageAndResolveWhenVisible = function (path, visibleSelector, interval, checkCount) {
    var dfd = new $.Deferred();
    var failMessage = 'Had to wait for 5 seconds for the element with selector ' + visibleSelector + ' to be visible.';
    var checkFunc = function() {
      return helpers.$(visibleSelector).is(':visible');
    };
    helpers.cycleCheck(checkFunc, interval, checkCount)
      .then(function() { dfd.resolve(); })
      .fail(function(error) {
        if(error.message === cycleCheckError)
          dfd.fail(new Error(failMessage));
        else
          dfd.fail(error);
      });
    return dfd.promise();
  };
  helpers.getWhenVisible = function (selector, interval, checkCount) {
    var dfd = new $.Deferred();
    var failMessage = 'Had to wait for 5 seconds for the element "' + selector + '" to be visible.';
    var element = null;
    var checkFunc = function() {
      element = helpers.$(selector);
      return !!element.is(':visible');
    };
    helpers.cycleCheck(checkFunc, interval, checkCount)
      .then(function() { dfd.resolve(element); })
      .fail(function(error) {
        if(error.message === cycleCheckError)
          dfd.reject(new Error(failMessage));
        else
          dfd.reject(error);
      });
    return dfd.promise();
  };
  helpers.get = function (selector) {
    var dfd = new $.Deferred();
    try {
      var element = helpers.$(selector);
    } catch(error) {
      dfd.reject(error);
    }
    if (element) {
      dfd.resolve(element);
    } else {
      dfd.reject(new Error('Could not find the element "' + selector + '"'));
    }
    return dfd.promise();
  };
  this.Then(/^start a new browser session to relative path "([^"]+)"$/, function (pathname, callback) {
    var uiTestWindow = $('#uitestwindow');
    uiTestWindow.empty();
    helpers.$ = null;
    uiTestWindow.attr('src', 'about:blank');
    helpers.cycleCheck(function () {
      return uiTestWindow[0].contentWindow.$ == undefined;
    }).then(function () {
      var url = location.href.substring(0, location.href.indexOf(location.pathname)) + pathname;
      uiTestWindow.attr('src', url);
      helpers.cycleCheck(function () {
        console.log('Waiting till jquery exists in the child window.');
        return uiTestWindow[0].contentWindow.$;
      }).then(function () {
        console.log('Setting the helper jQuery.')
        helpers.$ = uiTestWindow[0].contentWindow.$;
        callback();
      }).fail(callback);
    }).fail(callback);
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
    var text = null;
    var textTest = function textTest(element) {
      text = helpers.$(element).text();
      return text === value;
    };
    helpers.getWhenVisible(cssSelector)
      .then(function(element) {
        helpers.cycleCheck(function() { return textTest(element); })
          .then(function() { debugger; callback(); })
          .fail(function(error) {
            if(error.message === cycleCheckError) {
              callback(new Error('The element was found but did not have the text "' + value + '" after waiting for 5 seconds.  It had the value "' + text + '"'))
            } else {
              callback(error);
            }
          });
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
