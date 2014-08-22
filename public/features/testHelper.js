/// <reference path="../Scripts/breeze.debug.js" />
/// <reference path="../Scripts/breeze.intellisense.js" />
define(['gherkinRunner'], function (gherkinRunner) {
    var _this = {};
    breeze.NamingConvention.camelCase.setAsDefault();
    _this.metadataStore = null;
    _this.currentLogin = null;
    _this.getManager = function (managerName) {
        if (!_this.metadataStore)
            _this.metadataStore = new breeze.MetadataStore();

        return new breeze.EntityManager({
            serviceName: gherkinRunner.config.apiUrl + "/" + managerName,
            metadataStore: _this.metadataStore
        });
    };
    _this.fetchMetadata = function (manager) {
        var dfd = new $.Deferred();
        if (!_this.metadataStore.hasMetadataFor(manager.serviceName)) {
            manager.fetchMetadata()
                .then(function () {
                    dfd.resolve();
                })
                .fail(function (error) {
                    dfd.reject(error);
                });
        } else {
            dfd.resolve();
        }
        return dfd.promise();
    };
    _this.getRootApi = function () {
        var dfd = new $.Deferred();
        $.get(gherkinRunner.config.apiUrl)
            .then(function (data) {
                dfd.resolve(data);
            })
            .fail(function (xhr) {
                throw xhr.error();
            })
        return dfd.promise();
    };
    _this.getCurrentLogin = function () {
        var dfd = new $.Deferred();
        $.get(gherkinRunner.config.apiUrl + '/Logins')
            .then(function (data) {
                dfd.resolve(data);
            })
            .fail(function (xhr) {
                dfd.reject(xhr);
            })
        return dfd.promise();
    };
    _this.topicsDataManager = new breeze.EntityManager(gherkinRunner.config.apiUrl + "/TopicsData");
    _this.logIn = function (login, promise, state) {
        $.post(gherkinRunner.config.apiUrl + '/Logins', login)
            .then(function (data) {
                _this.currentLogin = data;
                if (state) {
                    state.objects = state.objects || {};
                    state.objects.login = data;
                }

                promise.resolve();
            })
            .fail(function (error) {
                promise.reject(error);
            });
    };
    _this.logInAndContinue = function (login) {
        var dfd = new $.Deferred();
        $.post(gherkinRunner.config.apiUrl + '/Logins', login)
            .then(function (data) {
                _this.currentLogin = data;
                dfd.resolve();
            })
            .fail(function (xhr) {
                throw xhr.error();
            })
        return dfd.promise();
    };
    _this.logOff = function (promise) {
        $.ajax({ url: gherkinRunner.config.apiUrl + '/Logins', type: 'DELETE' })
            .then(function () {
                promise.resolve();
            })
            .fail(function (error) {
                promise.reject(error);
            });
    };
    _this.createOrUpdateUser = function (context, promise, uniqueLastName) {
        var dfd = $.Deferred();
        var manager = _this.getManager('SecurityAdmin');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Users")
            .where("email", op.Equals, uniqueLastName + '@leonardoMD.com')
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_User"] = manager.createEntity('User', {
                        email: uniqueLastName + '@leonardoMD.com',
                        firstName: uniqueLastName,
                        lastName: uniqueLastName,
                        password: 'password1!'
                    });
                    manager.saveChanges()
                        .then(function (saveResult) {
                            $.each(saveResult.entities, function (i, entity) {
                                if (entity.organizationUsers && entity.organizationUsers().length > 0)
                                    $.each(entity.organizationUsers(), function (index, orgUser) {
                                        orgUser.entityAspect.acceptChanges();
                                    });
                                entity.entityAspect.acceptChanges();
                            });
                            dfd.resolve();
                        })
                        .fail(function (error) {
                            _this.handleError(context, promise, error);
                        });
                } else {
                    var user = data.results[0];
                    context.state[uniqueLastName + "_User"] = user;
                    user.email(uniqueLastName + '@leonardoMD.com');
                    user.firstName(uniqueLastName);
                    user.lastName(uniqueLastName);
                    user.password('password1!');
                    manager.saveChanges()
                        .then(function (saveResult) {
                            $.each(saveResult.entities, function (i, entity) {
                                if (entity.organizationUsers && entity.organizationUsers.lenght && entity.organizationUsers.length > 0)
                                    $.each(entity.organizationUsers, function (index, orgUser) {
                                        orgUser.entityAspect.acceptChanges();
                                    });
                                entity.entityAspect.acceptChanges();
                            });
                            dfd.resolve();
                        })
                        .fail(function (error) {
                            _this.handleError(context, promise, error);
                        });
                }
            })
            .fail(function (error) {
                _this.handleError(context, promise, error);
            });
        return dfd.promise();
    };
    _this.createOrUpdatePerson = function (context, promise, uniqueLastName, userId) {
        var dfd = $.Deferred();
        var manager = _this.getManager('PeopleOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("People")
            .where("lastName", op.Equals, uniqueLastName)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_Person"] = manager.createEntity('Person', {
                        userId: userId,
                        firstName: uniqueLastName,
                        lastName: uniqueLastName
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    var person = data.results[0];
                    context.state[uniqueLastName + "_Person"] = person;
                    person.userId(userId);
                    person.firstName(uniqueLastName);
                    person.lastName(uniqueLastName);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateStaffMember = function (context, promise, uniqueLastName, personId, provider) {
        var dfd = $.Deferred();
        var manager = _this.getManager('PeopleOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("StaffMembers")
            .where("personId", op.Equals, personId)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_StaffMember"] = manager.createEntity('StaffMember', {
                        personId: personId,
                        inactive: false,
                        provider: provider
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    var staffMember = data.results[0];
                    context.state[uniqueLastName + "_StaffMember"] = staffMember;
                    staffMember.personId(personId);
                    staffMember.inactive(false);
                    staffMember.provider(provider);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateRequestor = function (context, promise, uniqueLastName, userId) {
        var dfd = $.Deferred();
        var manager = _this.getManager('SecurityOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Requestors")
            .where("userId", op.Equals, userId)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_Requestor"] = manager.createEntity('Requestor', {
                        userId: userId
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    var requestor = data.results[0];
                    context.state[uniqueLastName + "_Requestor"] = requestor;
                    dfd.resolve();
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateTopicPermissionRequestor = function (context, promise, args) {
        var dfd = $.Deferred();
        _this.getTopicPermissionTypeId(context, promise, args.Permission, args.Level)
            .then(function (topicId, topicPermissionTypeId) {
                var topicPermissionTypeId = topicPermissionTypeId;
                var manager = _this.getManager('SecurityOrg');
                var requestorId = context.state[args.UserName + "_Requestor"].id();
                var op = breeze.FilterQueryOp;
                var p1 = new breeze.Predicate("requestorId", op.Equals, requestorId);
                var p2 = new breeze.Predicate("topicId", op.Equals, topicId);
                var pred = breeze.Predicate.and([p1, p2]);
                var providerQuery = breeze.EntityQuery
                    .from("TopicPermissionRequestors")
                    .where(pred)
                    .take(1);
                manager.executeQuery(providerQuery)
                    .then(function (data) {
                        if (data.results.length === 0) {
                            var permission = manager.createEntity('TopicPermissionRequestor', {
                                requestorId: requestorId,
                                topicId: topicId,
                                topicPermissionTypeId: topicPermissionTypeId
                            });
                            manager.saveChanges()
                                .then(function () {
                                    dfd.resolve();
                                })
                                .fail(function (error) { _this.handleError(context, promise, error); });
                        } else {
                            var permission = data.results[0];
                            permission.topicPermissionTypeId = topicPermissionTypeId
                            manager.saveChanges()
                                .then(function () {
                                    dfd.resolve();
                                })
                                .fail(function (error) { _this.handleError(context, promise, error); });
                        }
                    })
                    .fail(function (error) { _this.handleError(context, promise, error); });
            });
        return dfd.promise();
    };
    _this.gotTopics = false;
    _this.getTopics = function (context, promise) {
        var dfd = $.Deferred();
        if (_this.gotTopics)
            dfd.resolve();
        else {
            var query = breeze.EntityQuery.from("Topics");
            _this.topicsDataManager.executeQuery(query)
                .then(function (data) {
                    _this.gotTopics = true;
                    dfd.resolve();
                })
                .fail(function (error) { _this.handleError(context, promise, error); });
        }
        return dfd.promise();
    };
    _this.getTopicId = function (context, promise, friendlyName) {
        var dfd = $.Deferred();
        var op = breeze.FilterQueryOp;
        _this.getTopics(context, promise).then(function () {
            var providerQuery = breeze.EntityQuery
                .from("Topics")
                .where("friendlyName", op.Equals, friendlyName)
                .take(1);
            var data = _this.topicsDataManager.executeQueryLocally(providerQuery);
            dfd.resolve(data[0].id());
        });
        return dfd.promise();
    }
    _this.getTopicPermissionTypeId = function (context, promise, friendlyName, securityLevel) {
        var dfd = $.Deferred();
        _this.getTopicId(context, promise, friendlyName).then(function (topicId) {
            var manager = _this.getManager('SecurityData');
            var op = breeze.FilterQueryOp;
            var p1 = new breeze.Predicate("topicId", op.Equals, topicId);
            var p2 = new breeze.Predicate("securityLevel", op.Equals, securityLevel);
            var providerQuery = breeze.EntityQuery
                .from("TopicPermissionTypes")
                .where(p1.and(p2))
                .take(1);
            manager.executeQuery(providerQuery)
                .then(function (data) {
                    dfd.resolve(topicId, data.results[0].id());
                })
                .fail(function (error) { _this.handleError(context, promise, error); });
        });
        return dfd.promise();
    }
    _this.createOrUpdateProviderStaffMember = function (context, promise, providerName, staffName) {
        var dfd = $.Deferred();
        var manager = null;
        var manager = _this.getManager('SecurityOrg');
        var op = breeze.FilterQueryOp;
        var providerId = context.state[providerName + "_StaffMember"].personId();
        var staffId = context.state[staffName + "_StaffMember"].personId();
        var p1 = new breeze.Predicate("providerPersonId", op.Equals, providerId);
        var p2 = new breeze.Predicate("staffPersonId", op.Equals, staffId);
        var pred = breeze.Predicate.and([p1, p2]);
        var providerQuery = breeze.EntityQuery
            .from("ProviderStaffMembers")
            .where(pred)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    var permission = manager.createEntity('ProviderStaffMember', {
                        providerPersonId: providerId,
                        staffPersonId: staffId
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    dfd.resolve();
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdatePatient = function (context, promise, uniqueLastName, personId, providerId) {
        var dfd = $.Deferred();
        var manager = _this.getManager('PatientsOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Patients")
            .where("id", op.Equals, personId)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_Patient"] = manager.createEntity('Patient', {
                        id: personId,
                        inactive: false,
                        patientNumber: personId + 9000,
                        providerId: providerId
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    var patient = data.results[0];
                    context.state[uniqueLastName + "_Patient"] = patient;
                    patient.id(personId);
                    patient.inactive(false);
                    patient.patientNumber(personId + 9000);
                    patient.providerId(providerId);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateOrder = function (context, promise, patientPersonId, orderName) {
        var dfd = $.Deferred();
        var manager = _this.getManager('OrdersOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Orders")
            .where("name", op.Equals, orderName)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[orderName + "_Order"] = manager.createEntity('Order', {
                        name: orderName,
                        patientPersonId: patientPersonId
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    context.state[orderName + "_Order"] = data.results[0];
                    dfd.resolve();
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateAppointment = function (context, promise, patientPersonId, apptSubject) {
        var dfd = $.Deferred();
        var manager = _this.getManager('AppointmentsOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Appointments")
            .where("subject", op.Equals, apptSubject)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[apptSubject + "_Appointment"] = manager.createEntity('Appointment', {
                        subject: apptSubject
                    });
                    manager.saveChanges()
                        .then(function () {
                            _this.createOrUpdateAppointmentMember(
                                context, promise, context.state[apptSubject + "_Appointment"].id(), patientPersonId)
                            .then(function () {
                                dfd.resolve();
                            }).fail(function (error) { _this.handleError(context, promise, error); });
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    context.state[apptSubject + "_Appointment"] = data.results[0];
                    _this.createOrUpdateAppointmentMember(context, promise, context.state[apptSubject + "_Appointment"].id(), patientPersonId)
                        .then(function () {
                            dfd.resolve();
                        }).fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateAppointmentMember = function (context, promise, appointmentId, memberRecordId, properties) {

        if (!properties) {
            properties = new Object();
            properties.memberTypeId = 1;
        }

        var dfd = $.Deferred();
        var manager = _this.getManager('AppointmentsOrg');
        var op = breeze.FilterQueryOp;
        var p1 = new breeze.Predicate("topicRecordId", op.Equals, appointmentId);
        var p2 = new breeze.Predicate("memberTypeId", op.Equals, properties.memberTypeId);
        var p3 = new breeze.Predicate("memberRecordId", op.Equals, memberRecordId);
        var pred = breeze.Predicate.and([p1, p2, p3]);
        var query = breeze.EntityQuery
            .from("AppointmentMembers")
            .where(pred)
            .take(1);
        var query = manager.executeQuery(query)
            .then(function (data) {
                if (data.results.length === 0) {
                    $.extend(properties, {
                        topicId: 41,
                        topicRecordId: appointmentId,
                        memberRecordId: memberRecordId
                    });
                    manager.createEntity('AppointmentMember', properties);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    dfd.resolve();
                    // Do nothing for now.  Need to add code here to update the apt member.
                }
            }).fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.handleError = function (context, promise, error) {
        promise.reject(error);
    };
    _this.completeStep = function (context, stepInternalDeferred, stepInjectedPromise) {
        stepInternalDeferred.then(function () {
            stepInjectedPromise.resolve();
        }).fail(function (error) {
            testHelper.handleError(context, stepInjectedPromise, error);
        });
    };
    _this.updateObservableProperties = function (target, propertyValues) {
        for (var key in propertyValues) {
            if (propertyValues.hasOwnProperty(key)) {
                var propertyName = key.substring(0, 1).toLowerCase() + key.substr(1, key.length - 1);
                if (target[propertyName] && typeof target[propertyName] == 'function')
                    target[propertyName](propertyValues[key]);
            }
        }
    };
    _this.createOrUpdatePersonPhoneNumber = function (context, promise, personPhoneNumber) {
        var dfd = $.Deferred();
        var manager = _this.getManager('PeopleOrg');
        var op = breeze.FilterQueryOp;
        var p1 = new breeze.Predicate("personId", op.Equals, personPhoneNumber.personId);
        var p2 = new breeze.Predicate("phoneTypeId", op.Equals, personPhoneNumber.phoneTypeId);
        var pred = breeze.Predicate.and([p1, p2]);
        var providerQuery = breeze.EntityQuery
            .from("PersonPhoneNumbers")
            .where(pred)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    manager.createEntity('PersonPhoneNumber', personPhoneNumber);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                } else {
                    var foundPersonPhoneNumber = data.results[0];
                    _this.updateObservableProperties(foundPersonPhoneNumber, personPhoneNumber);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };
    _this.createOrUpdateContact = function (context, promise, uniqueLastName, personId) {
        var dfd = $.Deferred();
        var manager = _this.getManager('PeopleOrg');
        var op = breeze.FilterQueryOp;
        var providerQuery = breeze.EntityQuery
            .from("Contacts")
            .where("personId", op.Equals, personId)
            .take(1);
        manager.executeQuery(providerQuery)
            .then(function (data) {
                if (data.results.length === 0) {
                    context.state[uniqueLastName + "_Contact"] = manager.createEntity('Contact', {
                        personId: personId,
                        inactive: false,
                        contactTypeId: -1
                    });
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) {
                            _this.handleError(context, promise, error);
                        });
                } else {
                    var contact = data.results[0];
                    context.state[uniqueLastName + "_Contact"] = contact;
                    contact.personId(personId);
                    contact.inactive(false);
                    contact.contactTypeId(-1);
                    manager.saveChanges()
                        .then(function () {
                            dfd.resolve();
                        })
                        .fail(function (error) { _this.handleError(context, promise, error); });
                }
            })
            .fail(function (error) { _this.handleError(context, promise, error); });
        return dfd.promise();
    };

    return _this;
});
