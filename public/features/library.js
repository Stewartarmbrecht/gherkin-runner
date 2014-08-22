define(['features/testHelper', 'gherkinRunner', 'scripts/moment', 'features/libraryGold'], function (testHelper, gherkinRunner, moment, libraryGold) {
    var _this = {};
    _this[/".*" is true/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!inlineArgs[0] || inlineArgs[0] == "false") {
            throw new Error('The value was not true, it was: "' + inlineArgs[0] + '"');
        }
        promise.resolve();
    };
    _this[/".*" should equal ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (inlineArgs[0] != inlineArgs[1]) {
            throw new Error('The values did not match!  \nValue 1: "' + inlineArgs[0] + '" \nValue 2: "' + inlineArgs[1] + '"');
        }
        promise.resolve();
    };
    _this[/assign single entity result from ".*" manager query of ".*" to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = _this.replaceExpression(inlineArgs[1], context);
        manager.executeQuery(url)
            .then(function (data) {
                if (!state.objects)
                    state.objects = {};
                if (data.results.length > 0) {
                    state.objects[inlineArgs[2]] = data.results[0];
                }
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this['break'] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        debugger;
        promise.resolve();
    };
    _this[/get json at ".*" and assign to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        state.objects = state.objects || {};
        $.getJSON(inlineArgs[0])
            .then(function (data) {
                state.objects[inlineArgs[1]] = data;
                promise.resolve();
            })
            .fail(function (jqXhr, statusText, error) {
                promise.reject(error);
            });
    };
    _this[/get html at ".*" and assign to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        state.objects = state.objects || {};
        $.get(inlineArgs[0])
            .then(function (data) {
                state.objects[inlineArgs[1]] = data;
                promise.resolve();
            })
            .fail(function (jqXhr, statusText, error) {
                promise.reject(error);
            });
    };
    _this[/create manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        promise.resolve();
    };
    _this[/create object ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.objects)
            state.objects = {};
        var object = {};
        state.objects[inlineArgs[0]] = object;
        $.each(tableArg, function (index, args) {
            value = args.Value;
            if (args.DataType == 'Date')
                value = new Date(value);
            if (args.DataType == 'Number')
                value = parseFloat(value);
            if (args.DataType == 'Boolean')
                value = (value === 'true');
            object[args.Property] = value;
        });
        promise.resolve();
    };
    _this[/create or update entity ".*" of type ".*" with manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        var manager = state.managers[inlineArgs[2]];
        if (state.objects && state.objects[inlineArgs[0]]) {
            entity = state.objects[inlineArgs[0]];
            console.log('Updating entity ' + inlineArgs[0]);
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (value == 'null') {
                    value = null;
                }
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value.toLowerCase() === 'true');
                entity[args.Property](value);
            });
        }
        if (!entity) {
            entity = {};
            console.log('Creating entity ' + inlineArgs[0]);
            //create the entity
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (value == 'null') {
                    value = null;
                }
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value.toLowerCase() === 'true');
                entity[args.Property] = value;
            });
            entity = manager.createEntity(inlineArgs[1], entity);
            if (!state.objects)
                state.objects = {};
            state.objects[inlineArgs[0]] = entity;
        }
        promise.resolve();
    };
    _this[/delete entity for manager permission check ".*" for entity ".*" of type ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var vital = state.objects[inlineArgs[1]];
    
        var toDelete = manager.createEntity(inlineArgs[2], {
            id: vital.id()
        }, breeze.EntityState.Deleted);
       
        manager.saveChanges()
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                if (exampleArg.DeleteAccess) {
                    if (exampleArg.DeleteAccess == "Can") {
                        var error2 = new Error("Deleting the "  + inlineArgs[0]  + " should have succeeded.")
                        testHelper.handleError(context, promise, error + ' ' + error2);
                    }
                    else {
                        promise.resolve();
                    }
                }
                else {
                    testHelper.handleError(context, promise, error);
                }
            });
    };
    _this[/delete to ".*" and save success arguments to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        $.ajax({ url: gherkinRunner.config.apiUrl + '/' + inlineArgs[0], type: 'DELETE' }).then(function () {
            state.objects[inlineArgs[1]] = arguments;
            promise.resolve();
        }, function (error) {
            promise.reject(error);
        });
    };
    _this[/delete to ".*" and save failure arguments to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        $.ajax({ url: gherkinRunner.config.apiUrl + '/' + inlineArgs[0], type: 'DELETE' }).then(function () {
            promise.reject(error);
        }, function (error) {
            state.objects[inlineArgs[1]] = arguments;
            promise.resolve();
        });
    };
    _this[/fetch manager ".*" metadata/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        testHelper.fetchMetadata(state.managers[inlineArgs[0]])
            .then(function (data) {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/post ".*" object to ".*" and save results to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var object = state.objects[inlineArgs[0]];
        $.post(gherkinRunner.config.apiUrl + '/' + inlineArgs[1], object).then(function (data) {
            state.objects[inlineArgs[2]] = data;
            promise.resolve();
        }, function (error) {
            promise.reject(error);
        });
    };
    _this[/post ".*" object to ".*" and save success arguments to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var object = state.objects[inlineArgs[0]];
        $.post(gherkinRunner.config.apiUrl + '/' + inlineArgs[1], object).then(function () {
            state.objects[inlineArgs[2]] = arguments;
            promise.resolve();
        }, function (error) {
            promise.reject(error);
        });
    };
    _this[/post ".*" object to ".*" and save failure arguments to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var object = state.objects[inlineArgs[0]];
        $.post(gherkinRunner.config.apiUrl + '/' + inlineArgs[1], object).then(function () {
            promise.reject(new Error('The post succeeded'));
        }, function () {
            state.objects[inlineArgs[2]] = arguments;
            promise.resolve();
        });
    };
    _this[/read the ".*" result from ".*" manager for entity ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[1]];
        var op = breeze.FilterQueryOp;
        context.state.error = null;
        var entityQuery = breeze.EntityQuery

            .from(inlineArgs[0])
            .where("id", op.Equals, state.objects[inlineArgs[2]].id())
            .take(1);

        manager.executeQuery(entityQuery)
            .then(function (data) {
                if (!state.objects)
                    state.objects = {};
                if (data.results.length > 0) {
                    state.objects[inlineArgs[2]] = data.results[0];
                    promise.resolve();
                }
                else {
                    if (exampleArg.ReadAccess) {
                        if (exampleArg.ReadAccess == "Can") {
                            var error2 = new Error("Reading the " + inlineArgs[0] + " should have succeeded.")
                            testHelper.handleError(context, promise, error + ' ' + error2);
                        }
                        else {
                            promise.resolve();
                        }
                    }
                }

            })
           .fail(function (error) {
               if (exampleArg.ReadAccess) {
                   if (exampleArg.ReadAccess == "Can") {
                       var error2 = new Error("Reading the " + inlineArgs[0] + " should have succeeded.")
                       testHelper.handleError(context, promise, error + ' ' + error2);
                   }
                   else {
                       promise.resolve();
                   }
               }

           });
    };
    _this[/save changes for manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        manager.saveChanges()
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/save changes for manager permission check ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        manager.saveChanges()
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                if (exampleArg.AddAccess) {
                    if (exampleArg.AddAccess == "Can") {
                        var error2 = new Error("Adding the " + state.managers[inlineArgs[0]] + " should have succeeded.")
                        testHelper.handleError(context, promise, error + ' ' + error2);
                    }
                    else {
                        promise.resolve();
                    }
                }

                if (exampleArg.ModifyAccess) {
                    if (exampleArg.ModifyAccess == "Can") {
                        var error2 = new Error("Modifying the " + state.managers[inlineArgs[0]] + " should have succeeded.")
                        testHelper.handleError(context, promise, error + ' ' + error2);
                    }
                    else {
                        promise.resolve();
                    }
                }

            });
    };
    _this[/save changes for manager required fields check ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        context.state.error = null;
        manager.saveChanges()
            .then(function () {
                var error2 = new Error("Required field with a null value should have generated an error when saving and it did not for field " + exampleArg.Property + ". ");

                testHelper.handleError(context, promise, error2);
            })
            .fail(function (error) {
                var error2 = new Error(exampleArg.Property + " is required");
                context.state.error = error2;
                promise.resolve();

            });
    };
    _this[/the client is connected as ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var login = {};
        if (inlineArgs[0] === "Administrator")
            login = {
                "email": "renaissance.admin@leonardomd.com",
                "orgLoginName": "test",
                "orgPassword": "password1!",
                "password": "password1!",
            };
        else {
            login = {
                "email": inlineArgs[0] + "@leonardomd.com",
                "orgLoginName": "test",
                "orgPassword": "password1!",
                "password": "password1!",
            };
        }
        testHelper.logIn(login, promise, state);
    };
    _this['the client is connected as <UserName>'] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var login = {},
            userName = exampleArg.UserName;
        if (userName === "Administrator")
            login = {
                "email": "renaissance.admin@leonardomd.com",
                "orgLoginName": "test",
                "orgPassword": "password1!",
                "password": "password1!",
            };
        else {
            login = {
                "email": userName + "@leonardomd.com",
                "orgLoginName": "test",
                "orgPassword": "password1!",
                "Ppassword": "password1!",
            };
        }
        testHelper.logIn(login, promise);
    };
    _this["the client is logged off"] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        testHelper.logOff(promise);
    };
    _this[/the client should receive a field validation error with a message of ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var actual = state.error.message;
        var expected = inlineArgs[0].replace('<PropertyName>', exampleArg.PropertyName);
        if (expected != actual) { throw new Error(); }
        promise.resolve();
    };
    _this[/the following staff members are linked to the provider named ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var dfd = null;
        $.each(tableArg, function (index, args) {
            if (dfd)
                dfd = dfd.then(function () {
                    return testHelper.createOrUpdateProviderStaffMember(context, promise, inlineArgs[0], args.UserName);
                })
            else
                dfd = testHelper.createOrUpdateProviderStaffMember(context, promise, inlineArgs[0], args.UserName);
        });
        testHelper.completeStep(context, dfd, promise);
    };
    _this["the practice has the following staff members"] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var dfd = null;
        var count = tableArg.length;
        var processArgs = function (args) {
            var name = args.UserName;
            return testHelper.createOrUpdateUser(context, promise, name)
                .then(function () {
                    var userId = state[name + "_User"].id();
                    return testHelper.createOrUpdatePerson(context, promise, name, userId)
                        .then(function () {
                            var personId = state[name + "_Person"].id();
                            state.providerId = personId;
                            var provider = true;
                            return testHelper.createOrUpdateStaffMember(context, promise, name, personId, args.Provider == 1)
                                .then(function () {
                                    return testHelper.createOrUpdateRequestor(context, promise, name, userId);
                                }, function (error) {
                                    testHelper.handleError(context, promise, error);
                                });
                        }, function (error) {
                            testHelper.handleError(context, promise, error);
                        });
                }, function (error) {
                    testHelper.handleError(context, promise, error);
                });
        };
        $.each(tableArg, function (index, args) {
            if (dfd)
                dfd = dfd.then(function () {
                    return processArgs(args);
                }, function (error) {
                    testHelper.handleError(context, promise, error);
                });
            else
                dfd = processArgs(args);
        });
        testHelper.completeStep(context, dfd, promise);
    };
    _this["the practice has the following new staff members"] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var dfd = null;
        var count = tableArg.length;
        var processArgs = function (args) {
            var name = args.UserName;
            return testHelper.createOrUpdateUser(context, promise, name)
                .then(function () {
                    var userId = state[name + "_User"].id();
                    return testHelper.createOrUpdatePerson(context, promise, name, userId)
                        .then(function () {
                            var personId = state[name + "_Person"].id();
                            state.providerId = personId;
                            var provider = true;
                            return testHelper.createOrUpdateStaffMember(context, promise, name, personId, args.Provider == 1)
                                .then(function () {
                                    return testHelper.createOrUpdateRequestor(context, promise, name, userId);
                                }, function (error) {
                                    testHelper.handleError(context, promise, error);
                                });
                        }, function (error) {
                            testHelper.handleError(context, promise, error);
                        });
                }, function (error) {
                    testHelper.handleError(context, promise, error);
                });
        };
        $.each(tableArg, function (index, args) {
            if (dfd)
                dfd = dfd.then(function () {
                    return processArgs(args);
                }, function (error) {
                    testHelper.handleError(context, promise, error);
                });
            else
                dfd = processArgs(args);
        });
        testHelper.completeStep(context, dfd, promise);
    };
    _this["the staff members have the following permissions"] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var dfd = null;
        $.each(tableArg, function (index, args) {
            if (dfd)
                dfd = dfd.then(function () {
                    return testHelper.createOrUpdateTopicPermissionRequestor(context, promise, args);
                })
            else
                dfd = testHelper.createOrUpdateTopicPermissionRequestor(context, promise, args);
        });
        testHelper.completeStep(context, dfd, promise);
    };
    _this[/the staff member named ".*" has the following demographics:/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        promise.reject();
    };
    _this[/create object ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.objects)
            state.objects = {};
        var object = {};
        state.objects[inlineArgs[0]] = object;
        $.each(tableArg, function (index, args) {
            value = args.Value;
            if (args.DataType == 'Date')
                value = new Date(value);
            if (args.DataType == 'Number')
                value = parseFloat(value);
            if (args.DataType == 'Boolean')
                value = (value === 'true');
            object[args.Property] = value;
        });
        promise.resolve();
    };
    _this[/post ".*" object to ".*" and save results to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var object = state.objects[inlineArgs[0]];
        $.post(gherkinRunner.config.apiUrl + '/' + inlineArgs[1], object).then(function (data) {
            state.objects[inlineArgs[2]] = data;
            promise.resolve();
        }, function (error) {
            throw new Error(error.statusText + ': ' + error.responseText);
        });
    };
    _this[/create manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        promise.resolve();
    };
    _this[/assign single entity result from ".*" manager query of ".*" to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = _this.replaceExpression(inlineArgs[1], context);
        manager.executeQuery(url)
            .then(function (data) {
                if (!state.objects)
                    state.objects = {};
                if (data.results.length > 0) {
                    state.objects[inlineArgs[2]] = data.results[0];
                }
                promise.resolve();
            })
            .fail(function (error) {

                if (exampleArg.ReadAccess) {
                    if (exampleArg.AddAccess == "Can") {
                        var error2 = new Error("Reading the " + state.managers[inlineArgs[0]] + " should have succeeded.")
                        testHelper.handleError(context, promise, error + ' ' + error2);
                    }
                    else {
                        promise.resolve();
                    }
                }
                else {

                    testHelper.handleError(context, promise, error);
                }
            });
    };
    _this.replaceExpression = function (value, context) {
        if (value.indexOf('{{') >= 0) {
            var lookups = value.match(/{{([^{{][^}}]+)}}/g)
            $.each(lookups, function (i, lookup) {
                var lookupExp = lookup.substring(2, lookup.length - 2);
                try {
                    var lookupValue = eval(lookupExp);
                } catch (error) {
                    throw new Error('Could not evaluate the expression: ' + lookupExp + ' Got error: ' + error.message);
                }
                value = value.replace(lookup, lookupValue);
            });
        }
        return value;
    };
    _this.replaceParameters = function (value, parameters) {
        $.each(parameters.split(','), function (index, parameter) {
            value = value.replace(new RegExp('\\{' + index.toString() + '\\}', 'g'), parameter.toString());
        });
        return value;
    };
    _this[/create or update entity ".*" of type ".*" with manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        var manager = state.managers[inlineArgs[2]];
        if (state.objects && state.objects[inlineArgs[0]]) {
            entity = state.objects[inlineArgs[0]];
            console.log('Updating entity ' + inlineArgs[0]);
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (value == 'null') {
                    value = null;
                }
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value.toLowerCase() === 'true');
                console.log('Updating Property: ' + args.Property + ' from value: ' + entity[args.Property]() + ' to value: ' + value.toString());
                entity[args.Property](value);
                
            });
        }
        if (!entity) {
            entity = {};
            console.log('Creating entity ' + inlineArgs[0]);
            //create the entity
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (value == 'null') {
                    value = null;
                }
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value.toLowerCase() === 'true');
                entity[args.Property] = value;
            });
            entity = manager.createEntity(inlineArgs[1], entity);
            if (!state.objects)
                state.objects = {};
            state.objects[inlineArgs[0]] = entity;
        }
        promise.resolve();
    };
    _this[/update entity ".*" of type ".*" with manager ".*" for required fields check/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        var manager = state.managers[inlineArgs[2]];
        if (state.objects && state.objects[inlineArgs[0]]) {
            entity = state.objects[inlineArgs[0]];
            console.log('Updating entity ' + inlineArgs[0]);

          
                var value = exampleArg.Value;
                if (value == 'null') {
                    value = null;
                }
                if (exampleArg.DataType == 'Date')
                    value = new Date(value);
                if (exampleArg.DataType == 'Number')
                    value = parseFloat(value);
                if (exampleArg.DataType == 'Boolean')
                    value = (value.toLowerCase() === 'true');
                entity[exampleArg.Property](value);
        }
        
        promise.resolve();
    };
    _this.replaceExpression = function (value, context) {
        if (value.indexOf('{{') >= 0) {
            var lookups = value.match(/{{([^{{][^}}]+)}}/g)
            $.each(lookups, function (i, lookup) {
                var lookupExp = lookup.substring(2, lookup.length - 2);
                try {
                    var lookupValue = eval(lookupExp);
                } catch (error) {
                    throw new Error('Could not evaluate the expression: ' + lookupExp + ' Got error: ' + error.message);
                }
                value = value.replace(lookup, lookupValue);
            });
                    }
        return value;
    };
    _this[/read the session result from ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.objects[inlineArgs[0]])
        {
            if (exampleArg.ReadAccess) {
                if (exampleArg.ReadAccess == "Can") {
                    var error2 = new Error("Reading the " + inlineArgs[0] + " should have succeeded.")
                    testHelper.handleError(context, promise, error + ' ' + error2);
                }
                else {
                    promise.resolve();
                }
            }
        }
        else {
            promise.resolve();
        }
    }
    _this[/read the ".*" result entity result from ".*" manager/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[1]];
        var op = breeze.FilterQueryOp;
        context.state.error = null;
        var entityQuery = breeze.EntityQuery

            .from(inlineArgs[0])
            .where("id", op.Equals, manager.entity.id())
            .take(1);

        manager.executeQuery(entityQuery)
            .then(function (data) {
                if (!state.objects)
                    state.objects = {};
                if (data.results.length > 0) {
                    state.objects[inlineArgs[0]] = data.results[0];
                    promise.resolve();
                }
                else {

                    testHelper.handleError(context, promise, new Error('The query returned no results'));
                }

            })
           .fail(function (error) {
               if (exampleArg.ReadAccess) {
                   if (exampleArg.ReadAccess == "Can") {
                       var error2 = new Error("Reading the " + inlineArgs[0] + " should have succeeded.")
                       testHelper.handleError(context, promise, error + ' ' + error2);
                   }
                   else {
                       promise.resolve();
                   }
               }

           });
        //return value;
    };
    _this['break'] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        debugger;
        promise.resolve();
    };
    $.extend(_this, libraryGold);
    return _this;
});
