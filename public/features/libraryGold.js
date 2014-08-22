define(['features/testHelper', 'gherkinRunner', 'scripts/moment'], function (testHelper, gherkinRunner, moment) {
    var _this = {};
    //API GOLD STANDARD STEPS - USE THESE ONLY!!
    //AUTHENTICATION
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
    _this["the client is logged off"] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        testHelper.logOff(promise);
    };

    //BREEZE
    _this.getValue = function (args) {
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
        return value;
    };
    _this.assignEntityToState = function (objectProperty, entity, state) {
        if (!state.objects)
            state.objects = {};
        state.objects[objectProperty] = entity;
    };
    _this[/create manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        promise.resolve();
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
    _this[/query ".*" manager for single entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = inlineArgs[2];
        manager.executeQuery(url)
            .then(function (data) {
                if (data.results.length > 0) {
                    _this.assignEntityToState(inlineArgs[1], data.results[0], state);
                    console.log('Found entity ' + inlineArgs[1]);
                    promise.resolve();
                } else {
                    promise.reject(new Error('A single entity was not returned for the "' + inlineArgs[0] + '" query of "' + url + '".'));
                }
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/query ".*" manager for no entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = inlineArgs[2];
        manager.executeQuery(url)
            .then(function (data) {
                if (data.results.length !== 0) {
                    console.log('Did not find entity ' + inlineArgs[1] + ' successfully.');
                    promise.resolve();
                } else {
                    promise.reject(new Error('A non empty resultset was returned for the "' + inlineArgs[0] + '" query of "' + url + '".'));
                }
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/query ".*" manager for single or no entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = inlineArgs[2];
        manager.executeQuery(url)
            .then(function (data) {
                if (data.results.length > 0) {
                    _this.assignEntityToState(inlineArgs[1], data.results[0], state);
                    console.log('Found entity ' + inlineArgs[1]);
                } else {
                    console.log('Did not find entity ' + inlineArgs[1] + ' successfully.');
                }
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/query ".*" manager for multiple entities ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = inlineArgs[2];
        manager.executeQuery(url)
            .then(function (data) {
                if (data.results.length > 0) {
                    _this.assignEntityToState(inlineArgs[1], data.results, state);
                    promise.resolve();
                } else {
                    promise.reject(new Error('A single entity was not returned for the query of "' + url + '" from the "' + inlineArgs[0] + '" manager.'));
                }
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/query ".*" manager for error ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        var url = inlineArgs[2];
        manager.executeQuery(url)
            .then(function (data) {
                promise.reject(new Error('The query "' + url + '" from "' + inlineArgs[0] + '" did not throw an error.'));
            })
            .fail(function (error) {
                _this.assignEntityToState(inlineArgs[1], error, state)
                promise.resolve();
            });
    };
    _this[/query new ".*" manager for single entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        _this[/query ".*" manager for single entity ".*" with ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
    };
    _this[/query new ".*" manager for no entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        _this[/query ".*" manager for no entity ".*" with ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
    };
    _this[/query new ".*" manager for single or no entity ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        _this[/query ".*" manager for single or no entity ".*" with ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
    };
    _this[/query new ".*" manager for multiple entities ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        _this[/query ".*" manager for multiple entities ".*" with ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
    };
    _this[/query new ".*" manager for error ".*" with ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[0]] = testHelper.getManager(inlineArgs[0]);
        _this[/query ".*" manager for error ".*" with ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
    };
    _this[/create or update entity ".*" of type ".*" with manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        var manager = state.managers[inlineArgs[2]];
        if (state.objects && state.objects[inlineArgs[0]]) {
            entity = state.objects[inlineArgs[0]];
            console.log('Updating entity ' + inlineArgs[0]);
            $.each(tableArg, function (index, args) {
                var value = _this.getValue(args);
                entity[args.Property](value);
            });
        }
        if (!entity) {
            entity = {};
            //create the entity
            console.log('Creating entity ' + inlineArgs[0]);
            $.each(tableArg, function (index, args) {
                var value = _this.getValue(args);
                entity[args.Property] = value;
            });
            entity = manager.createEntity(inlineArgs[1], entity);
            _this.assignEntityToState(inlineArgs[0], entity, state)
        }
        promise.resolve();
    };
    _this[/create or update entity ".*" of type ".*" with new manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[2]] = testHelper.getManager(inlineArgs[2]);
        testHelper.fetchMetadata(state.managers[inlineArgs[2]])
            .then(function (data) {
                _this[/create or update entity ".*" of type ".*" with manager ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/create entity ".*" of type ".*" with manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        var manager = state.managers[inlineArgs[2]];
        entity = {};
        //create the entity
        console.log('Creating entity ' + inlineArgs[0]);
        $.each(tableArg, function (index, args) {
            var value = _this.getValue(args);
            entity[args.Property] = value;
        });
        entity = manager.createEntity(inlineArgs[1], entity);
        _this.assignEntityToState(inlineArgs[0], entity, state);
        promise.resolve();
    };
    _this[/create entity ".*" of type ".*" with new manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[2]] = testHelper.getManager(inlineArgs[2]);
        testHelper.fetchMetadata(state.managers[inlineArgs[2]])
            .then(function (data) {
                _this[/create entity ".*" of type ".*" with manager ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/create ".*" entities of type ".*" to ".*" with manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[3]];
        //create the entity
        console.log('Creating entity ' + inlineArgs[2]);
        var entities = [];
        var count = 0;
        while (count < parseFloat(inlineArgs[0])) {
            var entity = {};
            $.each(tableArg, function (index, args) {
                var value = _this.getValue(args);
                entity[args.Property] = value;
            });
            entity = manager.createEntity(inlineArgs[1], entity);
            entities[count] = entity;
            count++;
        }
        _this.assignEntityToState(inlineArgs[2], entities, state);
        promise.resolve();
    };
    _this[/create ".*" entities of type ".*" to ".*" with new manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.managers)
            state.managers = {};
        state.managers[inlineArgs[3]] = testHelper.getManager(inlineArgs[3]);
        testHelper.fetchMetadata(state.managers[inlineArgs[3]])
            .then(function (data) {
                _this[/create ".*" entities of type ".*" to ".*" with manager ".*"/](context, promise, state, inlineArgs, tableArg, exampleArg);
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/delete entity ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var entity = null;
        if (state.objects && state.objects[inlineArgs[0]]) {
            entity = state.objects[inlineArgs[0]];
            console.log('Deleting entity ' + inlineArgs[0]);
            entity.entityAspect.setDeleted();
            promise.resolve();
        } else {
            console.log('Entity ' + inlineArgs[0] + ' could not be found to delete');
            promise.reject(new Error('Entity ' + inlineArgs[0] + ' could not be found to delete'));
        }
    };
    _this[/save changes for manager ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        console.log('Saving changes for ' + inlineArgs[0]);
        manager.saveChanges()
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                testHelper.handleError(context, promise, error);
            });
    };
    _this[/fail to save changes for manager ".*" and assign error to ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var manager = state.managers[inlineArgs[0]];
        console.log('Saving changes for ' + inlineArgs[0] + ' and expecting a fail.');
        manager.saveChanges()
            .then(function () {
                promise.reject(new Error('The save succeeded.'));
            })
            .fail(function (error) {
                state.objects[inlineArgs[1]] = error;
                promise.resolve()
            });
    };

    //GENERIC
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
    _this[/".*" should not equal ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (inlineArgs[0] == inlineArgs[1]) {
            throw new Error('The values did matched!  \nValue 1: "' + inlineArgs[0] + '" \nValue 2: "' + inlineArgs[1] + '"');
        }
        promise.resolve();
    };
    _this[/".*" should be greater than ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!(inlineArgs[0] > inlineArgs[1])) {
            throw new Error('Value 1 was not greater than value 2!  \nValue 1: "' + inlineArgs[0] + '" \nValue 2: "' + inlineArgs[1] + '"');
        }
        promise.resolve();
    };
    _this['break'] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        debugger;
        promise.resolve();
    };

    //HTTP
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

    //JAVASCRIPT
    _this[/execute ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        eval(inlineArgs[0]);
        promise.resolve();
    };
    _this[/create object ".*"/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        if (!state.objects)
            state.objects = {};
        var object = {};
        state.objects[inlineArgs[0]] = object;
        $.each(tableArg, function (index, args) {
            var value = args.Value;
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
    _this[/verify object ".*" in ".*" has observable properties/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var errorMessage = null;
        var entity = state.objects[inlineArgs[1]][parseFloat(inlineArgs[0])];

        if (!entity)
            errorMessage = 'The entity "' + inlineArgs[0] + '" in "' + inlineArgs[1] + '" did not exist.';
        else {
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value === 'true');
                if (!entity[args.Property] || typeof entity[args.Property] !== 'function')
                    errorMessage = 'The property "' + args.Property + '" did not exist or was not an observable.';
                else
                    if (entity[args.Property]() !== value)
                        errorMessage = 'The property "' + args.Property + '" expected value "' + args.Value.toString() + '" but had value "' + object[args.Property]().toString() + '".\n';
            });
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        } else {
            promise.resolve();
        };
    };
    _this[/update object ".*" in ".*" has observable properties/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var errorMessage = null;
        var entity = state.objects[inlineArgs[1]][parseFloat(inlineArgs[0])];
        if (!entity)
            errorMessage = 'The entity "' + inlineArgs[0] + '" in "' + inlineArgs[1] + '" did not exist.';
        else {
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value === 'true');
                if (!entity[args.Property] || typeof entity[args.Property] !== 'function')
                    errorMessage = 'The property "' + args.Property + '" did not exist or was not an observable.';
                else
                    entity[args.Property](value);
            });
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        } else {
            promise.resolve();
        };
    };
    _this[/verify object ".*" has observable properties/] = function (context, promise, state, inlineArgs, tableArg, exampleArg) {
        var errorMessage = null;
        var entity = state.objects[inlineArgs[0]];

        if (!entity)
            errorMessage = 'The entity "' + inlineArgs[0] + '" did not exist.';
        else {
            $.each(tableArg, function (index, args) {
                var value = args.Value;
                if (args.DataType == 'Date')
                    value = new Date(value);
                if (args.DataType == 'Number')
                    value = parseFloat(value);
                if (args.DataType == 'Boolean')
                    value = (value === 'true');
                if (!entity[args.Property] || typeof entity[args.Property] !== 'function')
                    errorMessage = 'The property "' + args.Property + '" did not exist or was not an observable.';
                else
                    if (entity[args.Property]() !== value)
                        errorMessage = 'The property "' + args.Property + '" expected value "' + args.Value.toString() + '" but had value "' + object[args.Property]().toString() + '".\n';
            });
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        } else {
            promise.resolve();
        };
    };
    return _this;
});
