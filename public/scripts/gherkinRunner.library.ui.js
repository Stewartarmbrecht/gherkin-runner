define(['gherkinRunner', 'features/testHelper', 'scripts/moment'], function (gherkinRunner, testHelper, moment) {
    var _this = {};
    _this.$ = null;
    _this.errorChecker = null;
    _this.helpers = {
        cycleCheck: function (checkFunc, failMessage, quitOnError, interval, checkCount) {
            interval = interval || 100;
            checkCount = checkCount || 50;
            var dfd = new $.Deferred();
            var count = 0;
            var intv = setInterval(function () {
                if (quitOnError && _this.errorChecker && typeof _this.errorChecker === 'function') {
                    var error = _this.errorChecker();
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
        },
        waitTillVisible: function (visibleSelector, quitOnError, inverted, interval, checkCount) {
            var message = 'Had to wait for 5 seconds for the element with selector "' + visibleSelector + '" to ' + (inverted ? ' not ' : '') + 'be visible.';
            var checkFunc = null;
            if(inverted)
                checkFunc = function () {
                    return !_this.$(visibleSelector).is(':visible');
                };
            else 
                checkFunc = function () {
                    return _this.$(visibleSelector).is(':visible');
                };
            return _this.helpers.cycleCheck(checkFunc, message, quitOnError, interval, checkCount);
        },
        waitTillExists: function (selector, quitOnError, inverted, interval, checkCount) {
            var message = 'Had to wait for 5 seconds for the element with selector "' + visibleSelector + '" to ' + (inverted ? ' not ' : '') + 'exist.';
            var checkFunc = null;
            if (inverted)
                checkFunc = function () {
                    return !_this.$(selector).length === 0;
                };
            else
                checkFunc = function () {
                    return _this.$(selector).length > 0;
                };
            return _this.helpers.cycleCheck(checkFunc, message, quitOnError, interval, checkCount);
        },
        click: function (selector) {
            if (!_this.$(selector)[0])
                throw new Error('The ' + selector + ' element could not be found.');
            _this.$(selector).click();
        },
        getInnerText: function (selector) {
            if (!_this.$(selector)[0])
                throw new Error('The ' + selector + ' element could not be found.');
            return _this.$(selector)[0].innerText;
        },
        navigatePageAndResolveWhenVisible: function (path, visibleSelector, promise) {
            $.address.value(path);
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
        },
        getWhenVisible: function (selector) {
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
        },
        get: function (selector) {
            var dfd = new $.Deferred();
            var element = _this.$(selector);
            if (element) {
                dfd.resolve(element);
            } else {
                dfd.reject(new Error('Could not find the element "' + selector + '"'));
            }
            return dfd.promise();
        },
        waitTillTrue: function (trueFunc) {
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
        },
        clickAndResolveWhenTrue: function (selector, promise, trueFunc) {
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
        },
        whenTrue: function (trueFunc) {
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
        }
    }
    _this[/click ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.click(inlineArgs[0]);
        promise.resolve();
    };
    _this[/wait for a ".*" toast/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.waitTillToasted(inlineArgs[0])
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/wait for a ".*" toast to disappear/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.waitTillToastingDone(inlineArgs[0])
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/wait for ".*" to be visible/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.waitTillVisible(inlineArgs[0])
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/wait for ".*" to not be visible/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.waitTillNotVisible(inlineArgs[0])
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/update ".*" value to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (input) {
                ui.$(input).val(inlineArgs[1]).change();
                ui.$(input).keydown();
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" text is ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                var text = ui.$(element).text();
                if (text === inlineArgs[1])
                    promise.resolve();
                else
                    throw new Error('The "' + inlineArgs[0] + '" elements text is not "' + inlineArgs[1] + '" it is "' + text);
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" text is not ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (ui.$(element).text() !== inlineArgs[1])
                    promise.resolve();
                else
                    throw new Error('The "' + inlineArgs[0] + '" elements text was ' + inlineArgs[1]);
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" is visible/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (ui.$(element).is(':visible'))
                    promise.resolve();
                else
                    throw new Error('The "' + inlineArgs[0] + '" element is not visible.');
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" is not visible/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (!ui.$(element).is(':visible'))
                    promise.resolve();
                else
                    throw new Error('The "' + inlineArgs[0] + '" element is visible.')
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" does exist/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (ui.$(inlineArgs[0]).length > 0)
            promise.resolve();
        else
            throw new Error('The "' + inlineArgs[0] + '" element does not exist.');
    };
    _this[/verify ".*" does not exist/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (ui.$(inlineArgs[0]).length === 0)
            promise.resolve();
        else
            throw new Error('The "' + inlineArgs[0] + '" element does exist.');
    };
    _this[/verify ".*" does exist after waiting/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" does not exist after waiting/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.waitTillGone(inlineArgs[0])
            .then(function (element) {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" has class ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (ui.$(element).hasClass(inlineArgs[1]))
                    promise.resolve();
                else
                    throw new Error('The element "' + inlineArgs[0] + '" did not have the class: "' + inlineArgs[1] + '"');
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" does have class ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (ui.$(element).hasClass(inlineArgs[1]))
                    promise.resolve();
                else
                    throw new Error('The element "' + inlineArgs[0] + '" did not have the class: "' + inlineArgs[1] + '"');
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/verify ".*" does not have class ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        ui.get(inlineArgs[0])
            .then(function (element) {
                if (!ui.$(element).hasClass(inlineArgs[1]))
                    promise.resolve();
                else
                    throw new Error('The element "' + inlineArgs[0] + '" did have the class: "' + inlineArgs[1] + '"');
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };

    return _this;
});
