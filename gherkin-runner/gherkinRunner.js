var FeatureSet = require('/gherkin-runner/model/featureSet.js'),
    Feature = require('/gherkin-runner/model/feature.js'),
    FeatureDescription = require('/gherkin-runner/model/featureDescription.js'),
    Scenario = require('/gherkin-runner/model/scenario.js'),
    Step = require('/gherkin-runner/model/step.js'),
    StepGroup = require('/gherkin-runner/model/stepGroup.js'),
    utilities = require('/gherkin-runner/model/utilities.js');
  var _this = {};

  _this.configUrl = null;
  _this.config = {};
  _this.view = ko.observable('Running');
  _this.featureSet = ko.observable();
  _this.featureSetPath = ko.observable();
  _this.libraryPaths = ko.observableArray();
  _this.libraries = ko.observableArray();
  _this.libraryMethods = [];
  _this.recommendedMethods = ko.observableArray();
  _this.status = ko.observable();
  _this.statusMessage = ko.observable();
  _this.runningFeatureSet = ko.observable();
  _this.runningFeature = ko.observable();
  _this.runningScenario = ko.observable();
  _this.runningStep = ko.observable();
  _this.runningSubStep = ko.observable();
  _this.id = utilities.encodeId('gherkin-runner');
  _this.toggleUIButtonPosition = ko.observable('right');
  _this.toggleUIButtonMove = function toggleUIButtonMove() {
    if (_this.toggleUIButtonPosition() == 'left') {
      _this.toggleUIButtonPosition('right');
      $('#gherkin-toggle-ui-button').removeClass('left');
    } else {
      _this.toggleUIButtonPosition('left');
      $('#gherkin-toggle-ui-button').addClass('left');
    }
  };
  _this.canceled = false;
  _this.cancel = function cancel() {
    _this.canceled = true;
  };
  _this.paused = ko.observable(false);
  _this.pauseOrUnPause = function pauseOrUnPause() {
    if (_this.paused())
      _this.paused(false);
    else
      _this.paused(true);
  };
  _this.pauseIfNeeded = function pauseIfNeeded() {
    var dfd = new $.Deferred();
    var paused = _this.paused;
    if (paused()) {
      var intv = setInterval(function () {
        if (!paused()) {
          clearInterval(intv);
          dfd.resolve();
        }
      }, 100, paused, intv, dfd);
    } else {
      dfd.resolve();
    }
    return dfd.promise();
  }
  _this.resetRunResults = function resetRunResults() {
    _this.featureSet().resetResults();
  };
  _this.resetDefinitions = function resetDefinitions() {
    _this.libraryMethods = [];
  };
  _this.resetState = function resetState() {
    _this.featureSet().resetState();
  };

  _this.addFeatureSetFromUrl = function addFeatureSetFromUrl() {
    var featureSetPathParam = _this.getURLParameter("featureSetPath");
    if (featureSetPathParam != 'null') {
      _this.featureSetPath(featureSetPathParam);
    }
  };
  _this.start = null;
  _this.log = function log(message) {
    if (!_this.start)
      _this.start = new Date().getTime();
    if (console && console.log)
      console.log(new Date().getTime() - _this.start + ': ' + message);
  };

  _this.loaded = ko.observable(false);
  _this.load = function load() {
    _this.loaded(false);
    _this.start = new Date().getTime();
    _this.status('Loading...');
    _this.log('Resetting counts...');
    _this.resetDefinitions();
    _this.log('Removing feature sets...');
    _this.showDashboard();
    var dfd = $.Deferred();
    $(document).ready(function () {
      _this.loadConfiguration()
        .then(function () {
          _this.log('Loading root feature set...');
          _this.setRootFeatureSetPath();
          return _this.loadFeatureSetFile(_this.featureSetPath(), null, true)
            .then(function(featureSet){
              _this.featureSet(featureSet);
              ko.applyBindings(_this, $('body')[0]);
              _this.walkFeatureSet(featureSet);
            });
        })
        .then(function () {
          _this.log('Adding feature sets to list...');
          _this.status('Idle');
          _this.log('Finished loading feature sets!');
          _this.loaded(true);
          var finish = new Date().getTime();
          console.log('Load Duration: ' + (finish - _this.start).toString());
          dfd.resolve();
        });
    });
    return dfd.promise();
  };

  _this.setRootFeatureSetPath = function setRootFeatureSetPath() {
    var startFeatureSetPath = _this.getURLParameter('walkFeatureSet');
    if (startFeatureSetPath == "null")
      startFeatureSetPath = '/features/featureSet.js';
    _this.featureSetPath(startFeatureSetPath);
  };
  _this.loadConfiguration = function loadConfiguration() {
    var dfd = $.Deferred();
    if (_this.configUrl) {
      require([_this.configUrl], function (config) {
        _this.config = config;
        dfd.resolve();
      });
    }
    else
      dfd.resolve();
    return dfd.promise();
  };
  _this.loadFeatureSets = function loadFeatureSets(parentFeatureSet) {
    var dfd = $.when();
    parentFeatureSet.featureSetPaths.forEach(function (featureSetPath) {
      dfd = dfd.then(function () {
        return _this.loadFeatureSetFile(featureSetPath, parentFeatureSet);
      });
    });
    return dfd.promise();
  };
  _this.loadFeatureSetFile = function loadFeatureSetFile(featureSetPath, parentFeatureSet) {
    var dfd = new $.Deferred();
    require([featureSetPath], function (featureSet) {
      featureSet = new FeatureSet(featureSet, featureSetPath, parentFeatureSet);
      _this.loadFeatureSet(featureSet)
        .then(function () {
          dfd.resolve(featureSet);
        });
    });
    return dfd.promise();
  };
  _this.loadFeatureSet = function loadFeatureSet(featureSet) {
    featureSet.loaded(0);
    var dfd = $.when();
    if (featureSet.libraryPaths && featureSet.libraryPaths.length > 0) {
      featureSet.libraryPaths.forEach(function (libraryPath) {
        dfd = dfd.then(function () {
          return _this.loadLibraryFile(_this.libraries, libraryPath);
        });
      });
    }
    if (featureSet.featurePaths && featureSet.featurePaths.length > 0)
      dfd = dfd.then(function () {
        return _this.loadFeatures(featureSet);
      });
    if (featureSet.featureSetPaths && featureSet.featureSetPaths.length > 0)
      dfd = dfd.then(function () {
        return _this.loadFeatureSets(featureSet, false);
      });
    dfd = dfd.then(function() {
      featureSet.loaded(1);
    });
    return dfd.promise();
  };
  _this.loadLibraryFile = function loadLibraryFile(libraries, libraryPath) {
    var dfd = new $.Deferred();
    require([libraryPath], function (library) {
      var libraryLoader = {
        Given: function Given(methodName, func) {
          libraryLoader[methodName] = func;
        },
        When: function When(methodName, func) {
          libraryLoader[methodName] = func;
        },
        Then: function Then(methodName, func) {
          libraryLoader[methodName] = func;
        },
        And: function And(methodName, func) {
          libraryLoader[methodName] = func;
        }
      };
      libraryLoader.name = libraryPath;
      library.call(libraryLoader);
      libraries.push(libraryLoader);
      dfd.resolve();
    });
    return dfd.promise();
  };
  _this.loadFeatures = function loadFeatures(featureSet) {
    var dfd = $.when();
    $.each(featureSet.featurePaths, function (index, featurePath) {
      dfd = dfd.then(function () {
        return _this.loadFeatureFile(featurePath, featureSet);
      });
    });
    return dfd.promise();
  };
  _this.loadFeatureFile = function loadFeatureFile(featurePath, featureSet) {
    var dfd = new $.Deferred();
    require(["gherkin-runner/scripts/text!" + featurePath], function (featureText) {
      _this.loadImports(featureText)
        .then(function (importedFeatureText) {
          featureSet.features.push(_this.loadFeature(importedFeatureText, featurePath, featureSet));
          dfd.resolve();
        });
    });
    return dfd.promise();
  };
  _this.loadImports = function loadImports(featureText) {
    var lines = featureText.split('\n');
    var importIndexes = [];
    var importPaths = [];
    lines.forEach(function (line, index) {
      if (line.trim().indexOf('Import:') == 0) {
        importIndexes.push(index);
        importPaths.push("scripts/text!" + line.substring(line.indexOf('Import:') + 8) + ".feature");
      }
    });
    var dfd = new $.Deferred();
    require(importPaths, function () {
      $.each(arguments, function (index, importText) {
        lines[importIndexes[index]] = importText;
      });
      dfd.resolve(lines.join('\n'));
    });
    return dfd.promise();
  };
  _this.loadFeature = function loadFeature(featureText, featurePath, featureSet) {
    var feature = _this.parseFeature(featureText, featurePath, featureSet);
    _this.loadStepGroups(feature.stepGroups, feature);
    _this.loadScenarios(feature.backgrounds, feature);
    _this.loadScenarios(feature.scenarios, feature);
    return feature;
  };
  _this.loadScenarios = function loadScenarios(scenarios, feature) {
    $.each(scenarios(), function (index, scenario) {
      if (scenario.outline) {
        _this.loadExamples(scenario, feature);
      } else {
        _this.loadSteps(scenario.steps, feature, scenario);
      }
    });
  };
  _this.loadExamples = function loadExamples(outline, feature) {
    $.each(outline.examples, function (index, example) {
      var scenario = outline.createExample(index);
      scenario.exampleArg = example;
      outline.scenarios.push(scenario);
    });
    _this.loadSteps(outline.steps, feature, outline);
    _this.loadScenarios(outline.scenarios, feature);
  };
  _this.loadStepGroups = function loadStepGroups(stepGroups, feature) {
    $.each(stepGroups(), function (index, stepGroup) {
      _this.loadSteps(stepGroup.steps, feature, stepGroup);
    });
  };
  _this.loadSteps = function loadSteps(steps, feature, scenarioOrStepGroup) {
    $.each(steps(), function (index, step) {
      if (scenarioOrStepGroup.type.indexOf('step group') === -1 && step.outline == false) {
        _this.loadSubSteps(feature.stepGroups, step);
      }
      if (step.outline == true) {
        step.methodName = 'Outline';
        step.method = function method() {
        };
      } else {
        if (step.steps().length > 0) {
          step.methodName = 'Step Group';
          step.method = function method() {
          };
          $.each(step.steps(), function (index, subStep) {
            _this.loadStepMethod(subStep, feature, true);
            subStep.name = utilities.replaceExampleParameters(subStep.name, scenarioOrStepGroup.exampleArg);
          });
        } else {
          _this.loadStepMethod(step, feature, false);
          step.name = utilities.replaceExampleParameters(step.name, step.stepOwner.exampleArg);
        }
      }
    });
  };
  _this.loadSubSteps = function loadSubSteps(stepGroups, step, scenario) {
    var stepName = _this.getMethodName(step)
    var foundStepGroup = null;
    $.each(stepGroups(), function (index, stepGroup) {
      var matcher = stepGroup.name.toLowerCase();
      if (matcher.indexOf('/') === 0) {
        matcher = new RegExp(matcher.substring(1, matcher.length - 1).toLowerCase());
        if (stepName.toLowerCase().match(matcher)) {
          foundStepGroup = stepGroup;
        }
      } else {
        if (stepName.toLowerCase() === matcher.toLowerCase()) {
          foundStepGroup = stepGroup;
        }
      }
    });
    if (foundStepGroup) {
      foundStepGroup.used = foundStepGroup.used + 1;
      if (foundStepGroup.type == 'step group outline') {
        $.each(step.tableArg, function (index, tableArgRow) {
          $.each(foundStepGroup.steps(), function (index, subStep) {
            _this.copyStepGroupStep(subStep, step, tableArgRow);
          });
        });
      } else {
        $.each(foundStepGroup.steps(), function (index, subStep) {
          _this.copyStepGroupStep(subStep, step);
        });
      }
    }
  };
  _this.copyStepGroupStep = function copyStepGroupStep(subStep, step, outlineParameters) {
    var stepCopy = subStep.clone();

    stepCopy.name = utilities.replaceParameters(stepCopy.name, step.inlineArgs);
    if (stepCopy.runCondition)
      stepCopy.runCondition = utilities.replaceParameters(stepCopy.runCondition, step.inlineArgs);
    if (outlineParameters)
      stepCopy.name = utilities.replaceStepGroupOutlineParameters(stepCopy.name, outlineParameters);

    $.merge(stepCopy.inlineArgs, step.inlineArgs);
    if (stepCopy.tableArgColumns.length > 0 && stepCopy.tableArgColumns[0].trim() == 'PARENT_TABLE_ARG') {
      var copied = step.tableArg.slice(0);
      $.each(copied, function (index, tableRow) {
        copied[index] = $.extend(true, {}, tableRow);
      });
      stepCopy.tableArg = copied;

      var copiedArray = step.tableArgArray.slice(0);
      $.each(copiedArray, function (index, tableRow) {
        copiedArray[index] = tableRow.slice(0);
      });
      stepCopy.tableArgArray = copiedArray;

      stepCopy.tableArgColumns = $.extend(true, {}, step.tableArgColumns);
    }
    if (stepCopy.tableArgColumns.length > 0 && stepCopy.tableArgArray[0][0].trim() == 'MERGE_PARENT_TABLE') {
      var parent = step.tableArg.slice(0);
      var mergeIn = stepCopy.tableArg.slice(1);
      var merged = $.merge(parent, mergeIn);
      $.each(merged, function (index, tableRow) {
        merged[index] = $.extend(true, {}, tableRow);
      });
      stepCopy.tableArg = merged;

      var parentArray = step.tableArgArray.slice(0);
      var mergeInArray = stepCopy.tableArgArray.slice(1);
      var mergedArray = $.merge(parentArray, mergeInArray);
      $.each(mergedArray, function (index, tableRow) {
        mergedArray[index] = tableRow.slice(0);
      });
      stepCopy.tableArgArray = mergedArray;

      stepCopy.tableArgColumns = step.tableArgColumns.slice(0);
    }
    $.each(stepCopy.tableArg, function (index, tableRow) {
      for (var property in tableRow) {
        tableRow[property] = utilities.replaceParameters(tableRow[property], stepCopy.inlineArgs);
        if (outlineParameters)
          tableRow[property] = utilities.replaceStepGroupOutlineParameters(tableRow[property], outlineParameters);
      }
    });
    $.each(stepCopy.tableArgArray, function (index, tableRow) {
      $.each(tableRow, function (index, tableField) {
        tableRow[index] = utilities.replaceParameters(tableRow[index], stepCopy.inlineArgs);
        if (outlineParameters)
          tableRow[index] = utilities.replaceStepGroupOutlineParameters(tableRow[index], outlineParameters);
      });
    });
    for (var property in stepCopy.exampleArg) {
      stepCopy.exampleArg[property] = utilities.replaceParameters(stepCopy.exampleArg[property], stepCopy.inlineArgs);
      if (outlineParameters)
        stepCopy.exampleArg[property] = utilities.replaceStepGroupOutlineParameters(stepCopy.exampleArg[property], outlineParameters);
    }

    stepCopy.stepOwner = step;
    step.steps.push(stepCopy);
  };
  _this.loadStepMethod = function loadStepMethod(step, feature, isSubStep) {
    _this.loadStepMethodName(step);
    $.each(_this.libraries(), function (index, library) {
      if (!step.method)
        $.each(Object.keys(library), function (index, property) {
          if (typeof library[property] === 'function') {
            var matcher = property;
            if (matcher.indexOf('/') === 0) {
              matcher = new RegExp(matcher.substring(1, matcher.length - 1));
              if (step.methodName.match(matcher)) {
                step.inlineArgs = step.methodName.match(matcher).slice(1);
                step.method = library[property];
                step.libraryName = library.name;
                step.libraryMethodName = property;
                step.libraryMethodFullName = library.name + '[' + property + ']';
                if (_this.libraryMethods.indexOf(step.libraryMethodFullName.toLowerCase()) === -1) {
                  _this.libraryMethods[_this.libraryMethods.length] = step.libraryMethodFullName.toLowerCase();
                }
              }
            } else {
              if (step.methodName === matcher) {
                step.method = library[property];
                step.libraryName = library.name;
                step.libraryMethodName = property;
                step.libraryMethodFullName = library.name + '[' + property + ']';
                if (_this.libraryMethods.indexOf(step.libraryMethodFullName.toLowerCase()) === -1) {
                  _this.libraryMethods[_this.libraryMethods.length] = step.libraryMethodFullName.toLowerCase();
                }
              }
            }
          }
        });
    });
    if (step.libraryMethodFullName == null) {
      step.setMissingMethod();
      var recommendedMethod = 'this.Given(/^' + step.methodName + '$/, function(callback) {\n  callback();\n});\n';
      if (_this.recommendedMethods.indexOf(recommendedMethod) == -1)
        _this.recommendedMethods.push(recommendedMethod);
    }
  };
  _this.loadStepMethodName = function loadStepMethodName(step) {
    var methodNameSplit = step.name.split('##');
    if (methodNameSplit[1]) {
      step.comment = step.comment || ko.observable();
      step.comment(methodNameSplit[1]);
    }
    step.methodName = _this.getMethodName(step);
  };
  _this.getMethodName = function getMethodName(step) {
    var methodNameSplit = step.name.split('##');
    var methodName = methodNameSplit[0].trim();
    if (step.name.toLowerCase().indexOf("given ") == 0)
      methodName = methodName.substr(6, step.name.length - 6);
    else if (step.name.toLowerCase().indexOf("then ") == 0)
      methodName = methodName.substr(5, step.name.length - 5);
    else if (step.name.toLowerCase().indexOf("and ") == 0)
      methodName = methodName.substr(4, step.name.length - 4);
    else if (step.name.toLowerCase().indexOf("when ") == 0)
      methodName = methodName.substr(5, step.name.length - 5);
    return methodName;
  };
  _this.parseFeature = function parseFeature(featureText, featurePath, featureSet) {
    var lines = featureText.split('\n');
    var lastRead = null;
    var feature = {};
    var stepOwner = {};
    var lastObject = null;
    var lastIndentation = -1;
    $.each(lines, function (index, line) {
      var untrimmedLine = line;
      if (untrimmedLine.indexOf('\r') > 0)
        untrimmedLine = untrimmedLine.replace(/(\r\n|\n|\r)/gm, "");
      var lineNumber = index + 1;
      line = line.trim();
      if (line.length > 0) {
        var indentation = untrimmedLine.indexOf(line);
        if(lastIndentation == -1)
          lastIndentation = indentation;
        if (lastRead === 'multi-line-argument') {
          if (line.toLowerCase().trim().indexOf('"""') === 0)
            lastRead = '';
          else {
            var step = stepOwner.steps()[stepOwner.steps().length - 1];
            step.multiLineArg.push(untrimmedLine.substring(multiLineArgumentIndent));
          }
        } else if (line.toLowerCase().trim().indexOf('"""') === 0 && lastRead !== 'multi-line-argument') {
          lastRead = 'multi-line-argument';
          multiLineArgumentIndent = untrimmedLine.indexOf('"""');
        } else if (line.toLowerCase().trim().indexOf("##") === 0 || line.toLowerCase().trim().indexOf("#") === 0) {
          if (lastObject)
            lastObject.comments.push(line);
        } else if (line.toLowerCase().indexOf("feature:") === 0) {
          feature = new Feature(line, lineNumber, featurePath, featureSet);
          lastRead = 'feature';
          lastObject = feature;
        } else if (line.toLowerCase().indexOf("scenario:") === 0
          || line.toLowerCase().indexOf("scenario outline:") === 0
          || line.toLowerCase().indexOf("feature background:") === 0
          || line.toLowerCase().indexOf("feature background outline:") === 0) {
          var scenario = new Scenario(line, lineNumber, feature);
          lastObject = scenario;
          lastRead = scenario.type;
          stepOwner = scenario;
        } else if (line.toLowerCase().indexOf("examples:") === 0) {
          lastRead = 'example';
        } else if (line.toLowerCase().indexOf("step group:") === 0 || line.toLowerCase().indexOf("step group outline:") === 0) {
          var stepGroup = new StepGroup(line, lineNumber, feature);
          lastObject = stepGroup;
          stepOwner = stepGroup;
          lastRead = 'step group';
        } else if ((lastRead == 'feature' || lastRead == 'featureDescription') && line.indexOf('<div') !== 0) {
          feature.description.push(new FeatureDescription(line, lineNumber, feature));
          lastRead = 'featureDescription';
        } else if (line.toLowerCase().indexOf("given ") === 0 ||
          line.toLowerCase().indexOf("when ") === 0 ||
          line.toLowerCase().indexOf("then ") === 0 ||
          line.toLowerCase().indexOf("and ") === 0 ||
          line.toLowerCase().indexOf("but ") === 0) {
          if(lastRead === 'step' && lastIndentation - indentation > 4) {
            var step = new Step(line, lineNumber, feature, lastObject);
          } else
            var step = new Step(line, lineNumber, feature, stepOwner);
          lastObject = step;
          lastRead = 'step';
        } else if (line.toLowerCase().indexOf("|") === 0) {
          var args = line.substr(1, line.length - 2).split("|");
          if (lastRead == 'example') {
            if (stepOwner.exampleArgColumns.length == 0) {
              $.each(args, function (index, arg) {
                stepOwner.exampleArgColumns[stepOwner.exampleArgColumns.length] = arg;
              });
              stepOwner.exampleArgColumnsDisplay = line;
            } else {
              var argsObj = {};
              var argsArray = [];
              $.each(stepOwner.exampleArgColumns, function (i, argName) {
                argsObj[argName.trim()] = args[i].trim();
                argsObj[argName.trim() + '_Display'] = args[i];
                argsArray[argsArray.length] = args[i].trim();
              });
              var arrayIndex = stepOwner.examples.length;
              stepOwner.examples[arrayIndex] = argsObj;
              stepOwner.examplesArrays[arrayIndex] = argsArray;
              stepOwner.examplesDisplay[arrayIndex] = line;
            }
          } else {
            if (stepOwner.steps()[stepOwner.steps().length - 1].tableArgColumns.length == 0) {
              stepOwner.steps()[stepOwner.steps().length - 1].tableArgColumns = args;
            } else {
              var argsObj = {};
              var argsArray = [];
              $.each(stepOwner.steps()[stepOwner.steps().length - 1].tableArgColumns, function (i, argName) {
                argsObj[argName.trim()] = args[i].trim();
                argsObj[argName.trim() + '_Display'] = args[i];
                argsArray.push(args[i].trim());
              });
              var arrayIndex = stepOwner.steps()[stepOwner.steps().length - 1].tableArg.length;
              stepOwner.steps()[stepOwner.steps().length - 1].tableArg[arrayIndex] = argsObj;
              stepOwner.steps()[stepOwner.steps().length - 1].tableArgArray[arrayIndex] = argsArray;
            }
          }
        } else {
          feature.extraLines.push({
            lineNumber: lineNumber,
            line: ko.observable(line)
          });
        }
      }
    });
    return feature;
  };

  _this.run = function run() {
    _this.status('Running!');
    _this.log('Resetting run counts...');
    _this.resetRunCounts();
    _this.log('Resetting run results...');
    _this.resetRunResults();
    _this.log('Running feature sets...');
    return _this.runFeatureSet(_this.featureSet())
      .then(function () {
        if (_this.uiWindowVisible())
          _this.toggleUI();
        _this.status('Idle');
        _this.log('Run completed!');
        _this.runningFeature(null);
        _this.runningFeatureSet(null);
        _this.runningScenario(null);
        _this.runningStep(null);
        _this.runningSubStep(null);
        _this.canceled = false;
      })
      .fail(function (error) {
        var message = '';
        if (error && error.message)
          message = error.message;
        _this.status('Error');
        _this.log('Run failed with error: ' + message.message);
        _this.canceled = false;
      });
  };
  _this.runSingleScenarioAndResetState = function runSingleScenarioAndResetState(scenario, event) {
    _this.runSingleScenario(scenario, event, true);
  };
  _this.runSingleScenario = function runSingleScenario(scenario, event, resetState) {
    _this.status('Running!');
    var isBackground = scenario.type.indexOf('background') > -1;
    _this.log('Reseting run counts...');
    _this.resetRunCounts();
    _this.log('Reseting run results...');
    _this.resetRunResults();
    if (resetState)
      _this.resetState();
    _this.log('Running scenario...')
    _this.runScenario(scenario.feature, scenario, isBackground)
      .then(function () {
        if (_this.uiWindowVisible())
          _this.toggleUI();
        _this.status('Idle');
        _this.log('Run completed!');
        _this.runningFeature(null);
        _this.runningFeatureSet(null);
        _this.runningScenario(null);
        _this.runningStep(null);
        _this.runningSubStep(null);
        _this.canceled = false;
      })
      .fail(function () {
        var message = '';
        if (error && error.message)
          message = error.message;
        _this.status('Error');
        _this.log('Run failed with error: ' + message.message);
        _this.canceled = false;
      });
  };

  _this.runFeatureSets = function runFeatureSets(featureSets) {
    var dfd = $.when();
    $.each(featureSets(), function (index, featureSet) {
      dfd = dfd.then(function () {
        return _this.runFeatureSet(featureSet);
      });
    });
    return dfd.promise();
  };
  _this.runFeatureSet = function runFeatureSet(featureSet) {
    var dfd = $.when();
    _this.runningFeatureSet(featureSet);
    if (featureSet.features().length > 0)
      dfd = dfd.then(function () {
        return _this.runFeatures(featureSet.features);
      });
    if (featureSet.featureSets().length > 0)
      dfd = dfd.then(function () {
        return _this.runFeatureSets(featureSet.featureSets);
      });
    return dfd.promise();
  };
  _this.runFeatures = function runFeatures(features) {
    var dfd = $.when();
    $.each(features(), function (index, feature) {
      dfd = dfd.then(function () {
        return _this.runFeature(feature);
      });
    });
    return dfd.promise();
  };
  _this.runFeature = function runFeature(feature) {
    var dfd = $.when();
    if (_this.runningFeature())
      _this.runningFeature().state = null;
    _this.runningFeature(feature);
    dfd = dfd.then(function () {
      return _this.runScenarios(feature, feature.backgrounds, true);
    });
    dfd = dfd.then(function () {
      return _this.runScenarios(feature, feature.scenarios);
    });
    return dfd.promise();
  };
  _this.runScenarios = function runScenarios(feature, scenarios, isBackground) {
    var dfd = $.when();
    $.each(scenarios(), function (index, scenario) {
      dfd = dfd.then(function () {
        return _this.runScenario(feature, scenario, isBackground);
      });
    });
    return dfd.promise();
  };
  _this.runScenario = function runScenario(feature, scenario, isBackground) {
    var dfd = $.when();
    if (_this.runningScenario())
      _this.runningScenario().state = null;
    _this.runningScenario(scenario);
    if (scenario.outline) {
      dfd = dfd.then(function () {
        return _this.runScenarios(feature, scenario.scenarios, isBackground);
      });
    } else {
      if (isBackground)
        scenario.state = feature.state;
      else
        scenario.state = $.extend(true, {}, feature.state);
      //scenario.state = $.extend(true, {}, feature.state, scenario.state);
      dfd = dfd.then(function () {
        return _this.runSteps(scenario);
      });
    }
    return dfd.promise();
  };
  _this.runSteps = function runSteps(stepOwner) {
    var dfd = new $.when();
    $.each(stepOwner.steps(), function (index, step) {
      if (step.steps().length > 0) {
        _this.setShouldRun(step, step.inlineArgs, stepOwner, stepOwner.state);
        dfd = dfd.then(function () {
          return _this.runSubSteps(step, stepOwner);
        });
      } else {
        dfd = dfd.then(function () {
          return _this.runStep(step, stepOwner);
        });
      }
    });
    return dfd.promise();
  };
  _this.runSubSteps = function runSubSteps(step, stepOwner) {
    var dfd = $.when();
    $.each(step.steps(), function (index, subStep) {
      if (!step.shouldRun)
        subStep.runCondition = 'false';
      dfd = dfd.then(function () {
        return _this.runStep(subStep, stepOwner, true);
      });
    });
    return dfd.promise();
  };
  _this.runStep = function runStep(step, stepOwner, subStep) {
    return _this.pauseIfNeeded()
      .then(function () {
        var dfd = $.Deferred();
        stepOwner.step = step;
        if (subStep)
          _this.runningSubStep(subStep);
        else
          _this.runningStep(step);
        if (stepOwner.aborted || _this.canceled) {
          step.setRunResult(0);
          dfd.resolve();
        } else {
          if (!step.method) {
            step.setRunResult(0);
            stepOwner.aborted = true;
            dfd.resolve()
          } else {
            try {
              stepOwner.config = _this.config;
              var stepDeferred = new $.Deferred();
              stepDeferred.then(function () {
                step.setRunResult(1);
                dfd.resolve();
              });
              stepDeferred.fail(function (error) {
                if (_this.breakOnException())
                  debugger;
                stepOwner.aborted = true;
                if (!error && stepOwner.error())
                  error = stepOwner.error();
                step.error(error);
                if (!stepOwner.error() && error)
                  stepOwner.error(error);
                step.setRunResult(-1);
                dfd.resolve();
              });
              _this.runStepMethod(step, stepOwner, stepDeferred);
            }
            catch (error) {
              if (_this.breakOnException())
                debugger;
              stepOwner.aborted = true;
              stepOwner.error(error);
              step.error(error);
              step.setRunResult(-1);
              dfd.resolve();
            }
          }
        }
        return dfd.promise();
      });
  };
  _this.runStepMethod = function runStepMethod(step, stepOwner, stepDeferred) {
    _this.setShouldRun(step, step.inlineArgs, stepOwner, stepOwner.state);
    if (step.breakpoint())
      debugger;
    if (step.shouldRun) {
      var callback = function callback(error) {
        if (error)
          stepDeferred.reject(error);
        else
          stepDeferred.resolve();
      };
      stepOwner.state.$context = {
        step: {
          id: step.id,
          name: step.name,
          type: step.type,
          libraryName: step.libraryName,
          libraryMethodName: step.libraryMethodName,
          originalName: step.originalName,
          runCondition: step.runCondition,
          scenario: {
            id: stepOwner.id,
            name: stepOwner.name,
            type: stepOwner.type,
            config: stepOwner.config,
            feature: {
              id: stepOwner.feature.id,
              name: stepOwner.feature.name,
              type: stepOwner.feature.type
            }
          }
        },
        callback: callback,
        inlineArgs: step.inlineArgs,
        multiLineArg: step.multiLineArg,
        tableArgArray: step.tableArgArray,
        tableArg: step.tableArg,
        exampleArg: stepOwner.exampleArg
      };
      utilities.replaceExpressions(stepOwner.state, step.inlineArgs, step.multiLineArg, step.tableArgArray);
      var argsArray = [];
      if (step.inlineArgs && step.inlineArgs.length > 0)
        argsArray = argsArray.concat(step.inlineArgs);
      if (step.multiLineArg && step.multiLineArg.length > 0)
        argsArray.push(step.multiLineArg);
      if (step.tableArgArray && step.tableArgArray.length > 0)
        argsArray.push(step.tableArgArray);
      argsArray.push(callback);
      step.method.apply(stepOwner.state, argsArray);
    } else {
      stepDeferred.resolve();
    }
  };

  _this.setShouldRun = function setShouldRun(runner, inlineArgs, context, state) {
    if (runner.runCondition != null) {
      runner.runCondition = utilities.replaceParameters(runner.runCondition, inlineArgs);
      runner.runCondition = utilities.replaceExpression('{{' + runner.runCondition + '}}');
      runner.shouldRun = eval(runner.runCondition);
    } else {
      runner.shouldRun = true;
    }
  };

  _this.getURLParameter = function getURLParameter(name) {
    return decodeURI(
      (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
  };

  _this.showDashboard = function showDashboard() {
    _this.view('Running');
  };
  _this.uiWindowVisible = ko.observable(false);
  _this.showUIWindow = function showUIWindow() {
    var uiTestWindow = $('#uitestwindow')[0];
    uiTestWindow.style.display = 'block';
    _this.uiWindowVisible(true);
  };
  _this.toggleUI = function toggleUI() {
    var uiTestWindow = $('#uitestwindow')[0];
    if ($(uiTestWindow).is(':visible')) {
      uiTestWindow.style.display = 'none';
      _this.uiWindowVisible(false);
    }
    else {
      uiTestWindow.style.display = 'block';
      _this.uiWindowVisible(true);
    }
  };
  _this.setBreakpoint = function setBreakpoint(entity) {
    if (entity.breakpoint())
      entity.setBreakpoint();
    else
      entity.removeBreakpoint();
  };
  _this.breakOnException = ko.observable(false);
  _this.toggleOnException = function toggleOnException() {
    if (_this.breakOnException())
      _this.breakOnException(false);
    else
      _this.breakOnException(true);
  };

  _this.initializeFeature = function initializeFeature(featurePath, level) {
    return {
      path: featurePath,
      name: featurePath.substring(featurePath.lastIndexOf('/') + 1),
      level: level,
      selected: ko.observable(false)
    };
  };
  _this.walkFeatureSet = function walkFeatureSet(featureSet) {
    if (featureSet.expanded()) {
      _this.walkCollapseFeatureSet(featureSet);
    } else {
      _this.walkExpandFeatureSet(featureSet);
    }
  };
  _this.walkCollapseFeatureSet = function walkCollapseFeatureSet(featureSet) {
    featureSet.expanded(false);
  };
  _this.walkExpandFeatureSet = function walkExpandFeatureSet(featureSet) {
    if(featureSet.loaded() === -1) {
      _this.log('Loading feature set "' + featureSet.path + '"');
      _this.loadFeatureSet(featureSet, true);
    }
    featureSet.expanded(true);
  };

  _this.linkToPage = function linkToPage() {
    var location = window.location.pathname;
    var featuresIncluded = false;
    if (_this.featurePaths().length > 0) {
      location = location + "?featurePaths=" + _this.featurePaths().join(',');
      featuresIncluded = true;
    }
    if (_this.featureSetPaths().length > 0) {
      location = location + (featuresIncluded ? "&" : "?") + "featureSetPaths=" + _this.featureSetPaths().join(',');
      featuresIncluded = true;
    }
    if (_this.libraryPaths().length > 0)
      location = location + (featuresIncluded ? "&" : "?") + "libraryPaths=" + _this.libraryPaths().join(',');
    window.location = location;
  };

  _this.toggleRunnerCollapse = function toggleRunnerCollapse() {
    if (_this.allCollapsed())
      $('.collapsible').collapse('show');
    else
      $('.collapsible').collapse('hide');

    _this.allCollapsed(!_this.allCollapsed());
  };

  _this.allCollapsed = ko.observable(true);

  module.exports = _this;

//# sourceURL=gherkin-runner/gherkinRunner.js