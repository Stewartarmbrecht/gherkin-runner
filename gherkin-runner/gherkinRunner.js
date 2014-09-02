define(function () {
  var _this = {};

  _this.encodeId = function encodeId(value) {
    var hash = 0, i, chr, len;
    if (value.length == 0) return hash;
    for (i = 0, len = value.length; i < len; i++) {
      chr   = value.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return 'gr' + hash;
  };

  _this.configUrl = null;
  _this.config = {};
  _this.view = ko.observable('Walking');
  _this.featureSets = ko.observableArray();
  _this.loadedFeatureSets = ko.observableArray();
  _this.featureSetPaths = ko.observableArray();
  _this.libraryPaths = ko.observableArray();
  _this.libraries = ko.observableArray();
  _this.selectedFeatureSets = ko.observableArray();
  _this.featurePaths = ko.observableArray();
  _this.selectedFeatures = ko.observableArray();
  _this.featureCount = 0;
  _this.status = ko.observable();
  _this.statusMessage = ko.observable();
  _this.counts = {
    featureSets: { total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    features: { total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    backgrounds: { defined: ko.observable(0), total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    scenarios: { defined: ko.observable(0), total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    stepGroups: { defined: ko.observable(0), total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    steps: { defined: ko.observable(0), missingMethods: ko.observable(0), background: ko.observable(0), scenario: ko.observable(0), total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) },
    subSteps: { defined: ko.observable(0), missingMethods: ko.observable(0), background: ko.observable(0), scenario: ko.observable(0), total: ko.observable(0), run: ko.observable(0), pass: ko.observable(0), fail: ko.observable(0), skip: ko.observable(0) }
  };
  _this.countsPosition = ko.observable('left');
  _this.countsMove = function countsMove() {
    if (_this.countsPosition() == 'left') {
      _this.countsPosition('right');
      $('#gherkin-counts').addClass('right');
    } else {
      _this.countsPosition('left');
      $('#gherkin-counts').removeClass('right');
    }
  };
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
    var count = 0;
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
  _this.id = _this.encodeId('gherkin_runner');

  _this.resetCounts = function resetCounts() {
    _this.resetRunCounts();
    _this.counts.featureSets.total(0);
    _this.counts.featureSets.run(0);
    _this.counts.featureSets.pass(0);
    _this.counts.featureSets.fail(0);
    _this.counts.features.total(0);
    _this.counts.backgrounds.defined(0);
    _this.counts.backgrounds.total(0);
    _this.counts.scenarios.defined(0);
    _this.counts.scenarios.total(0);
    _this.counts.stepGroups.defined(0);
    _this.counts.stepGroups.total(0);
    _this.counts.steps.defined(0);
    _this.counts.steps.missingMethods(0);
    _this.counts.steps.background(0);
    _this.counts.steps.scenario(0);
    _this.counts.steps.total(0);
    _this.counts.subSteps.defined(0);
    _this.counts.subSteps.missingMethods(0);
    _this.counts.subSteps.background(0);
    _this.counts.subSteps.scenario(0);
    _this.counts.subSteps.total(0);
  };
  _this.resetRunCounts = function resetRunCounts() {
    _this.counts.features.run(0);
    _this.counts.features.pass(0);
    _this.counts.features.fail(0);
    _this.counts.features.skip(0);
    _this.counts.backgrounds.run(0);
    _this.counts.backgrounds.pass(0);
    _this.counts.backgrounds.fail(0);
    _this.counts.backgrounds.skip(0);
    _this.counts.scenarios.run(0);
    _this.counts.scenarios.pass(0);
    _this.counts.scenarios.fail(0);
    _this.counts.scenarios.skip(0);
    _this.counts.stepGroups.run(0);
    _this.counts.stepGroups.pass(0);
    _this.counts.stepGroups.fail(0);
    _this.counts.stepGroups.skip(0);
    _this.counts.steps.run(0);
    _this.counts.steps.pass(0);
    _this.counts.steps.fail(0);
    _this.counts.steps.skip(0);
    _this.counts.subSteps.run(0);
    _this.counts.subSteps.pass(0);
    _this.counts.subSteps.fail(0);
    _this.counts.subSteps.skip(0);
  };
  _this.resetRunResults = function resetRunResults() {
    $.each(_this.needComputedProperties.reverse(), function (index, item) {
      if (item.aborted || item.aborted !== undefined) {
        item.aborted = false;
      }

      if (item.runResult() != null) {
        item.lastRunResult(item.runResult());
        if (item.error) {
          item.lastError(item.error());
          item.error(null);
        }
      }
      item.runResult(null);
    });
  };
  _this.resetDefinitions = function resetDefinitions() {
    _this.libraryMethods = [];
  };
  _this.resetState = function resetState() {
    $.each(_this.needComputedProperties.reverse(), function (index, item) {
      if (item.state) {
        item.state = {};
      }
    });
  };

  _this.addFeatureSet = function addFeatureSet(featureSetPath) {
    _this.featureSetPaths.push(featureSetPath);
  };
  _this.toggleFeatureSetSelection = function toggleFeatureSetSelection(walkingFeatureSet) {
    if (walkingFeatureSet.selected()) {
      _this.featureSetPaths.remove(walkingFeatureSet.path);
      _this.selectedFeatureSets.remove(walkingFeatureSet);
      walkingFeatureSet.selected(false);
    } else {
      _this.featureSetPaths.push(walkingFeatureSet.path);
      _this.selectedFeatureSets.push(walkingFeatureSet);
      walkingFeatureSet.selected(true);
    }
    _this.featureSetPaths.sort(_this.sortPaths);
    _this.selectedFeatureSets.sort(_this.sortPathObjects);
  };
  _this.toggleFeatureSelection = function toggleFeatureSelection(walkingFeature, walkingFeatureSet) {
    walkingFeature.libraryPaths = walkingFeatureSet.libraryPaths;
    if (walkingFeature.selected()) {
      _this.featurePaths.remove(walkingFeature.path);
      _this.selectedFeatures.remove(walkingFeature);
      walkingFeature.selected(false);
    } else {
      _this.featurePaths.push(walkingFeature.path);
      _this.selectedFeatures.push(walkingFeature);
      walkingFeature.selected(true);
    }
    _this.featurePaths.sort(_this.sortPaths);
    _this.selectedFeatures.sort(_this.sortPathObjects);
  };

  _this.sortPaths = function sortPaths(a, b) {
    var aLevels = a.split('/').length;
    var bLevels = b.split('/').length;
    if (a == b)
      return 0
    else if (aLevels == bLevels) {
      if (a > b)
        return 1;
      else
        return -1;
    } else {
      if (aLevels > bLevels) {
        return 1;
      } else {
        return -1;
      }
    }
  };
  _this.sortPathObjects = function sortPathObjects(a, b) {
    var aLevels = a.path.split('/').length;
    var bLevels = b.path.split('/').length;
    if (a.path == b.path)
      return 0
    else if (aLevels == bLevels) {
      if (a.path > b.path)
        return 1;
      else
        return -1;
    } else {
      if (aLevels > bLevels) {
        return 1;
      } else {
        return -1;
      }
    }
  };

  _this.addFeature = function addFeature(featurePath) {
    _this.featurePaths(featurePath);
  };
  _this.addFeaturesFromUrl = function addFeaturesFromUrl(featurePath) {
    var featureSetPathParam = _this.getURLParameter("featureSetPaths");
    if (featureSetPathParam != 'null') {
      var split = featureSetPathParam.split(',');
      $.each(split, function (index, path) {
        _this.featureSetPaths.push(path);
      });
    }
    var featurePathParam = _this.getURLParameter("featurePaths");
    if (featurePathParam != 'null') {
      var split = featurePathParam.split(',');
      $.each(split, function (index, path) {
        _this.featurePaths.push(path);
      });
    }
    var libraryPathParam = _this.getURLParameter("libraryPaths");
    if (libraryPathParam != 'null') {
      var split = libraryPathParam.split(',');
      $.each(split, function (index, path) {
        _this.libraryPaths.push(path);
      });
    }
  };
  _this.stringToBoolean = function stringToBoolean(string) {
    switch (string.toLowerCase()) {
      case "true":
      case "yes":
      case "1":
        return true;
      case "false":
      case "no":
      case "0":
      case null:
        return false;
      default:
        return Boolean(string);
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
    var start = new Date().getTime();
    _this.status('Loading...');
    _this.log('Resetting counts...');
    _this.resetCounts();
    _this.resetDefinitions();
    _this.log('Removing feature sets...');
    _this.featureSets.removeAll();
    _this.loadedFeatureSets.removeAll();
    _this.featureCount = 0;
    _this.showDashboard();
    var dfd = $.Deferred();
    $(document).ready(function () {
      _this.loadConfiguration()
        .then(function () {
          return _this.loadLibraries();
        })
        .then(function () {
          if (_this.featurePaths().length > 0) {
            var featureSet = {
              name: "Selected Features",
              id: "generated_selected_features_feature_set",
              featureSetPaths: [],
              featurePaths: _this.featurePaths(),
              libraryPaths: _this.libraryPaths()
            }
            _this.log('Loading features...');
            return _this.loadFeatureSet(featureSet, _this.featureSets);
          }
          else {
            _this.log('Loading feature sets...');
            return _this.loadFeatureSets(_this.featureSetPaths(), _this.featureSets);
          }
        })
        .then(function () {
          _this.log('Adding computed properties...');
          _this.addComputedProperties();
          //_this.totalCounts();
          _this.log('Adding feature sets to list...');
          var loadedFeatureSetsArray = _this.loadedFeatureSets();
          $.each(_this.featureSets(), function (index, featureSet) {
            loadedFeatureSetsArray.push(featureSet);
          });
          _this.loadedFeatureSets.valueHasMutated();
          dfd.resolve();
          _this.status('Idle');
          _this.log('Finsihed loading feature sets!');
          _this.loaded(true);
          var finish = new Date().getTime();
          console.log('Load Duration: ' + (finish - start).toString());
        });
    });
    return dfd.promise();
  };

  _this.loadConfiguration = function loadConfiguration() {
    var dfd = $.Deferred();
    if (_this.configUrl) {
      require.undef(_this.configUrl);
      require([_this.configUrl], function (config) {
        _this.config = config;
        dfd.resolve();
      });
    }
    else
      dfd.resolve();
    return dfd.promise();
  };
  _this.loadFeatureSets = function loadFeatureSets(featureSetPaths, featureSets) {
    var dfd = $.when();
    $.each(featureSetPaths, function (index, featureSetName) {
      dfd = dfd.then(function () {
        return _this.loadFeatureSetFile(featureSetName, featureSets);
      });
    });
    return dfd.promise();
  };
  _this.loadFeatureSetFile = function loadFeatureSetFile(featureSetName, featureSets) {
    var dfd = new $.Deferred();
    require.undef(featureSetName);
    require([featureSetName], function (featureSet) {
      featureSet = featureSet || {};
      featureSet.id = _this.encodeId(featureSetName);
      featureSet.featureSetPaths = featureSet.featureSetPaths || [];
      featureSet.featurePaths = featureSet.featurePaths || [];
      featureSet.libraryPaths = featureSet.libraryPaths || [];
      _this.loadFeatureSet(featureSet, featureSets)
        .then(function () {
          dfd.resolve();
        });
    });
    return dfd.promise();
  };
  _this.loadFeatureSet = function loadFeatureSet(featureSet, featureSets) {
    var dfd = $.when();
    featureSet.features = ko.observableArray();
    featureSet.featureSets = ko.observableArray();
    featureSet.runResult = ko.observable();
    featureSet.lastRunResult = ko.observable();
    featureSets.push(featureSet);
    _this.counts.featureSets.total(_this.counts.featureSets.total() + 1);
    featureSet.name = featureSet.name || "Unnamed Feature Set";
    if (featureSet.libraryPaths && featureSet.libraryPaths.length > 0)
    {
      featureSet.libraryPaths.forEach(function (libraryName) {
        dfd = dfd.then(function () {
          return _this.loadLibraryFile(_this.libraries, libraryName);
        });
      });
    }
    if (featureSet.featurePaths && featureSet.featurePaths.length > 0)
      dfd = dfd.then(function () {
        return _this.loadFeatures(featureSet.featurePaths, featureSet.features);
      });
    if (featureSet.featureSetPaths && featureSet.featureSetPaths.length > 0)
      dfd = dfd.then(function () {
        return _this.loadFeatureSets(featureSet.featureSetPaths, featureSet.featureSets);
      });
    return dfd.promise();
  };
  _this.loadLibraries = function loadLibraries() {
    var addLibraryPaths = function addLibraryPaths(libraryPaths) {
      libraryPaths.forEach(function (libraryPath) {
        if (!_this.libraryPaths().indexOf(libraryPath) > -1)
          _this.libraryPaths.push(libraryPath);
      })
    };
    if (_this.selectedFeatureSets)
      _this.selectedFeatureSets().forEach(function (featureSet) {
        if(featureSet.libraryPaths)
          addLibraryPaths(featureSet.libraryPaths);
      });
    if (_this.selectedFeatures)
      _this.selectedFeatures().forEach(function (feature) {
        if(feature.libraryPaths)
          addLibraryPaths(feature.libraryPaths);
      });
    var dfd = $.when();
    _this.libraryPaths().forEach(function (libraryName) {
      dfd = dfd.then(function () {
        return _this.loadLibraryFile(_this.libraries, libraryName);
      });
    });
    return dfd.promise();
  };
  _this.loadLibraryFile = function loadLibraryFile(libraries, libraryName) {
    var dfd = new $.Deferred();
    require.undef(libraryName);
    require([libraryName], function (library) {
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
      libraryLoader.name = libraryName;
      library.call(libraryLoader);
      libraries.push(libraryLoader);
      dfd.resolve();
    });
    return dfd.promise();
  };
  _this.loadFeatures = function loadFeatures(featurePaths, features) {
    featurePaths = featurePaths || [];
    var dfd = $.when();
    $.each(featurePaths, function (index, featureName) {
      dfd = dfd.then(function () {
        return _this.loadFeatureFile(features, featureName);
      });
    });
    return dfd.promise();
  };
  _this.loadFeatureFile = function loadFeatureFile(features, featureName) {
    var dfd = new $.Deferred();
    require.undef("gherkin-runner/scripts/text!" + featureName);
    require(["gherkin-runner/scripts/text!" + featureName], function (featureText) {
      _this.loadImports(featureText)
        .then(function (importedFeatureText) {
          features.push(_this.loadFeature(importedFeatureText, featureName));
          _this.counts.features.total(_this.counts.features.total() + 1);
          dfd.resolve();
        });
    });
    return dfd.promise();
  };
  _this.loadImports = function loadImports(featureText) {
    var lines = featureText.split('\n');
    var importIndexes = [];
    var importPaths = [];
    $.each(lines, function (index, line) {
      if (line.trim().indexOf('Import:') == 0) {
        importIndexes.push(index);
        importPaths.push("scripts/text!" + line.substring(line.indexOf('Import:') + 8) + ".feature");
      }
    });
    var dfd = new $.Deferred();
    $.each(importPaths, function (index, path) {
      require.undef(path);
    });
    require(importPaths, function () {
      $.each(arguments, function (index, importText) {
        lines[importIndexes[index]] = importText;
      });
      dfd.resolve(lines.join('\n'));
    });
    return dfd.promise();
  };
  _this.loadFeature = function loadFeature(featureText, featureName) {
    var feature = _this.parseFeature(featureText, featureName);
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
        if (scenario.type.indexOf('background') > -1)
          _this.counts.backgrounds.total(_this.counts.backgrounds.total() + 1);
        else
          _this.counts.scenarios.total(_this.counts.scenarios.total() + 1);
        _this.loadSteps(scenario.steps, feature, scenario);
      }
    });
  };
  _this.loadExamples = function loadExamples(outline, feature) {
    $.each(outline.examples, function (index, example) {
      var scenario = _this.cloneOutlineToScenario(outline, index);
      scenario.exampleArg = example;
      outline.scenarios.push(scenario);
    });
    _this.loadSteps(outline.steps, feature, outline);
    _this.loadScenarios(outline.scenarios, feature);
  };
  _this.loadStepGroups = function loadStepGroups(stepGroups, feature) {
    $.each(stepGroups(), function (index, stepGroup) {
      _this.counts.stepGroups.defined(_this.counts.stepGroups.defined() + 1);
      _this.loadSteps(stepGroup.steps, feature, stepGroup);
    });
  };
  _this.loadSteps = function loadSteps(steps, feature, scenarioOrStepGroup) {
    $.each(steps(), function (index, step) {
      if (_this.breakpoints().indexOf(step.id) >= 0)
      //_this.loadInlineArgs(step);
      if (scenarioOrStepGroup.type.indexOf('step group') === -1 && step.outline == false) {
        _this.loadSubSteps(feature.stepGroups, step);
      }
      if (step.outline == true) {
        step.methodName = 'Outline';
        step.method = function method() {
        };
      } else {
        if (step.subSteps().length > 0) {
          step.methodName = 'Step Group';
          step.method = function method() {
          };
          _this.counts.stepGroups.total(_this.counts.stepGroups.total() + 1);
          $.each(step.subSteps(), function (index, subStep) {
            if (scenarioOrStepGroup.type.indexOf('background') > -1 && scenarioOrStepGroup.type.indexOf('outline') == -1) {
              _this.counts.subSteps.background(_this.counts.subSteps.background() + 1);
              _this.counts.subSteps.total(_this.counts.subSteps.total() + 1);
            }
            else if (scenarioOrStepGroup.type.indexOf('scenario') > -1 && scenarioOrStepGroup.type.indexOf('outline') == -1) {
              _this.counts.subSteps.scenario(_this.counts.subSteps.scenario() + 1);
              _this.counts.subSteps.total(_this.counts.subSteps.total() + 1);
            }
            //_this.loadInlineArgs(subStep);
            _this.loadStepMethod(subStep, feature, true);
            subStep.name = _this.replaceExampleParameters(subStep.name, scenarioOrStepGroup.exampleArg);
          });
        } else {
          if (scenarioOrStepGroup.type.indexOf('background') > -1 && scenarioOrStepGroup.type.indexOf('outline') == -1) {
            _this.counts.steps.background(_this.counts.steps.background() + 1);
            _this.counts.steps.total(_this.counts.steps.total() + 1);
          }
          else if (scenarioOrStepGroup.type.indexOf('scenario') > -1 && scenarioOrStepGroup.type.indexOf('outline') == -1) {
            _this.counts.steps.scenario(_this.counts.steps.scenario() + 1);
            _this.counts.steps.total(_this.counts.steps.total() + 1);
          }
          _this.loadStepMethod(step, feature, false);
          step.name = _this.replaceExampleParameters(step.name, step.stepOwner.exampleArg);
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
    var stepCopy = _this.cloneOutlineStepToStep(subStep);

    stepCopy.name = _this.replaceParameters(stepCopy.name, step.inlineArgs);
    if (stepCopy.runCondition)
      stepCopy.runCondition = _this.replaceParameters(stepCopy.runCondition, step.inlineArgs);
    if (outlineParameters)
      stepCopy.name = _this.replaceStepGroupOutlineParameters(stepCopy.name, outlineParameters);

    //_this.loadInlineArgs(stepCopy);

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
        tableRow[property] = _this.replaceParameters(tableRow[property], stepCopy.inlineArgs);
        if (outlineParameters)
          tableRow[property] = _this.replaceStepGroupOutlineParameters(tableRow[property], outlineParameters);
      }
    });
    $.each(stepCopy.tableArgArray, function (index, tableRow) {
      $.each(tableRow, function (index, tableField) {
        tableRow[index] = _this.replaceParameters(tableRow[index], stepCopy.inlineArgs);
        if (outlineParameters)
          tableRow[index] = _this.replaceStepGroupOutlineParameters(tableRow[index], outlineParameters);
      });
    });
    for (var property in stepCopy.exampleArg) {
      stepCopy.exampleArg[property] = _this.replaceParameters(stepCopy.exampleArg[property], stepCopy.inlineArgs);
      if (outlineParameters)
        stepCopy.exampleArg[property] = _this.replaceStepGroupOutlineParameters(stepCopy.exampleArg[property], outlineParameters);
    }

    stepCopy.stepOwner = step;
    step.subSteps.push(stepCopy);
  }
  _this.libraryMethods = [];
  _this.recommendedMethods = ko.observableArray();
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
                  if (isSubStep)
                    _this.counts.subSteps.defined(_this.counts.subSteps.defined() + 1);
                  else
                    _this.counts.steps.defined(_this.counts.steps.defined() + 1);
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
                  if (isSubStep)
                    _this.counts.subSteps.defined(_this.counts.subSteps.defined() + 1);
                  else
                    _this.counts.steps.defined(_this.counts.steps.defined() + 1);
                }
              }
            }
          }
        });
    });
    if (step.libraryMethodFullName == null) {
      if (isSubStep)
        _this.counts.subSteps.missingMethods(_this.counts.subSteps.missingMethods() + 1);
      else
        _this.counts.steps.missingMethods(_this.counts.steps.missingMethods() + 1);
      var recommendedMethod = 'this.Given(/^' + step.methodName + '$/, function(callback) {\n  callback();\n});\n';
      if(_this.recommendedMethods.indexOf(recommendedMethod) == -1)
        _this.recommendedMethods.push(recommendedMethod);
    }
  };
  _this.loadStepMethodName = function loadStepMethodName(step) {
    var methodName = null;
    methodNameSplit = step.name.split('##');
    methodName = methodNameSplit[0].trim();
    if (methodNameSplit[1]){
      step.comment = step.comment || ko.observable();
      step.comment(methodNameSplit[1]);
    }
    step.methodName = _this.getMethodName(step);
  };
//  _this.loadInlineArgs = function loadInlineArgs(step) {
//    step.inlineArgs = step.name.match(/"[^"]*"/g);
//    if (!step.inlineArgs)
//      step.inlineArgs = [];
//    if (step.inlineArgs && step.inlineArgs.length > 0)
//      $.each(step.inlineArgs, function (index, token) {
//        if (token != null)
//          step.inlineArgs[index] = token.substring(1, token.length - 1);
//      });
//
//  };

  //The signature below matches the signature called for a step method.
  _this.replaceExpressions = function replaceExpressions(state, inlineArgs, multiLineArg, tableArgArray) {
    $.each(inlineArgs, function (index, inlineArg) {
      inlineArgs[index] = _this.replaceExpression.apply(state, [inlineArg]);
    });
    if(multiLineArg)
      multiLineArg.forEach(function(lineArg){
        _this.replaceExpression.apply(state, [lineArg]);
      });
    $.each(tableArgArray, function (indexTR, tableRow) {
      for (var property in tableRow) {
        tableRow[property] = _this.replaceExpression.apply(state, [tableRow[property]]);
      }
    });
  };
  _this.replaceExpression = function replaceExpression(value) {
    var context = this;
    if (value && value.indexOf('{{') >= 0) {
      var expressions = value.match(/{{([^{{][^}}]+)}}/g);
      if (!expressions)
        throw new Error('Javascript function could not be parsed: ' + value);

      expressions.forEach(function (lookup) {
        var func = function () {
          var lookupExp = lookup.substring(2, lookup.length - 2);

          try {
            var lookupValue = eval(lookupExp);
          } catch (error) {
            throw new Error('Could not evaluate the expression: ' + lookupExp + ' Got error: ' + error.message);
          }
          value = value.replace(lookup, lookupValue);
        };

        func.call(context);
      });
    }
    return value;
  };
  _this.replaceParameters = function replaceParameters(value, parameters) {
    $.each(parameters, function (index, parameter) {
      value = value.replace(new RegExp('\\{' + index.toString() + '\\}', 'g'), parameter.toString());
    });
    return value;
  };
  _this.replaceExampleParameters = function replaceExampleParameters(value, exampleArg) {
    if (exampleArg && value && value.replace) {
      for (var property in exampleArg) {
        value = value.replace(new RegExp('\\<' + property + '\\>', 'g'), exampleArg[property].toString());
      }
    }
    return value;
  };
  _this.replaceStepGroupOutlineParameters = function replaceStepGroupOutlineParameters(value, parameters) {
    if (parameters) {
      for (var property in parameters) {
        value = value.replace(new RegExp('\\[\\[' + property + '\\]\\]', 'g'), parameters[property].toString());
      }
    }
    return value;
  };

  _this.getMethodName = function getMethodName(step) {
    var methodName = null;
    methodNameSplit = step.name.split('##');
    methodName = methodNameSplit[0].trim();
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
  _this.cloneOutlineToScenario = function cloneOutlineToScenario(outline, exampleIndex) {
    var steps = ko.observableArray();
    var clone = {
      id: outline.id + '_' + outline.clones.length + 1,
      type: outline.type.replace(' outline', ''),
      lineNumber: outline.lineNumber,
      steps: steps,
      exampleArgColumns: outline.exampleArgColumns,
      exampleArgColumnsDisplay: outline.exampleArgColumnsDisplay,
      exampleArg: outline.examples[exampleIndex],
      exampleArgDisplay: outline.examplesDisplay[exampleIndex],
      examples: [],
      examplesArrays: [],
      number: outline.number,
      runResult: ko.observable(),
      lastRunResult: ko.observable(),
      breakpoint: ko.observable(false),
      clones: [],
      aborted: false,
      step: null,
      error: ko.observable(),
      lastError: ko.observable(),
      scenarios: ko.observableArray(),
      name: outline.name,
      comments: outline.comments,
      outline: false,
      state: {},
      feature: outline.feature
    };
    _this.needComputedProperties[_this.needComputedProperties.length] = clone;
    $.each(outline.steps(), function (index, step) {
      step.outline = true;
      var stepClone = _this.cloneOutlineStepToStep(step, outline.examples[exampleIndex]);
      stepClone.stepOwner = clone;
      steps.push(stepClone);
    });
    outline.clones[outline.clones.length] = clone;
    return clone;
  };
  _this.cloneOutlineStepToStep = function cloneOutlineStepToStep(step, exampleArg) {
    var subSteps = ko.observableArray();
    var clone =
    {
      id: step.id + '_' + step.clones.length + 1,
      type: step.type,
      name: step.name,
      comments: step.comments,
      runCondition: step.runCondition,
      originalName: step.originalName,
      lineNumber: step.lineNumber,
      runResult: ko.observable(),
      lastRunResult: ko.observable(),
      error: ko.observable(),
      lastError: ko.observable(),
      outline: false,
      subSteps: subSteps,
      tableArg: [],
      tableArgArray: [],
      tableArgColumns: step.tableArgColumns.slice(0),
      methodName: step.methodName,
      method: step.method,
      inlineArgs: step.inlineArgs.slice(0),
      multiLineArg: step.multiLineArg.slice(0),
      libraryName: step.libraryName,
      libraryMethodName: step.libraryMethodName,
      libraryMethodFullName: step.libraryMethodFullName,
      clones: [],
      breakpoint: ko.observable(_this.breakpoints().indexOf(step.id) > -1)
    }
    if (exampleArg) {
      clone.name = _this.replaceExampleParameters(clone.name, exampleArg);
      clone.runCondition = (step.runCondition ? _this.replaceExampleParameters(step.runCondition, exampleArg) : null);
      clone.multiLineArg.forEach(function(lineArg, index){
        clone.multiLineArg[index] = (lineArg ? _this.replaceExampleParameters(lineArg, exampleArg) : null);
      });
    }
    _this.needComputedProperties[_this.needComputedProperties.length] = clone;
    $.each(step.subSteps(), function (index, subStep) {
      var stepClone = _this.cloneOutlineStepToStep(subStep);
      stepClone.stepOwner = clone;
      subSteps.push(stepClone);
    });

    $.each(step.tableArgArray, function (index, rowArg) {
      var cloneRowArg = rowArg.slice(0);
      if(exampleArg) {
        $.each(cloneRowArg, function(index, columnArg) {
          cloneRowArg[index] = _this.replaceExampleParameters(columnArg, exampleArg);
        });
      }
      clone.tableArgArray[index] = cloneRowArg;
    });
    $.each(step.tableArg, function (index, tableRow) {
      var cloneTableRow = $.extend(true, {}, tableRow);
      if(exampleArg) {
        Object.keys(cloneTableRow).forEach(function(prop) {
          cloneTableRow[prop] = _this.replaceExampleParameters(cloneTableRow[prop], exampleArg);
        });
      }
      clone.tableArg[index] = cloneTableRow;
    });
    step.clones[step.clones.length] = clone;
    return clone;
  };

  _this.needComputedProperties = [];
  _this.addComputedProperties = function addComputedProperties() {
    var computeProperties = function computeProperties(item) {
      if (!item.computed) {
        if (item.type != 'feature') {
          var resultMissingMethod = false;
          if (item.steps && item.steps().length > 0)
            resultMissingMethod = false;
          else if (item.subSteps && item.subSteps().length > 0)
            resultMissingMethod = false;
          else if (!item.method || typeof item.method !== 'function')
            resultMissingMethod = true;
          item.missingMethod = resultMissingMethod;

          var resultMissingChildMethod = false;
          if (item.steps && item.steps().length > 0)
            $.each(item.steps(), function (index, step) {
              computeProperties(step);
              if (step.missingChildMethods || step.missingMethod)
                resultMissingChildMethod = true;
            });
          else if (item.subSteps && item.subSteps().length > 0 && !(item.outline && item.type == 'step'))
            $.each(item.subSteps(), function (index, subStep) {
              computeProperties(subStep);
              if (subStep.missingMethod)
                resultMissingChildMethod = true;
            });
          if (item.clones && item.clones.length > 0 && !(item.outline && item.type == 'step'))
            $.map(item.clones, function (example) {
              computeProperties(example);
              if (example.missingChildMethods)
                resultMissingChildMethod = true;
            });
          item.missingChildMethods = resultMissingChildMethod;
          item.hasChildBreakpoint = ko.observable(false);
        } else {
          var resultMissingChildMethod = false;
          $.each(item.scenarios(), function (index, scenario) {
            computeProperties(scenario);
            if (scenario.missingChildMethods)
              resultMissingChildMethod = true;
          });
          item.missingChildMethods = resultMissingChildMethod;
          item.hasChildBreakpoint = ko.observable(false);
        }
      }
      item.computed = true;
    };
    $.each(_this.needComputedProperties.reverse(), function (index, item) {
      computeProperties(item);
    });
  };

  _this.parseFeature = function parseFeature(featureText, featureName) {
    var lines = featureText.split('\n');
    var lastRead = null;
    var feature = {};
    var stepOwner = {};
    var lastObject = null;
    $.each(lines, function (index, line) {
      var untrimmedLine = line;
      if(untrimmedLine.indexOf('\r') > 0)
        untrimmedLine = untrimmedLine.replace(/(\r\n|\n|\r)/gm,"");
      var lineNumber = index + 1;
      line = line.trim();
      if (line.length > 0) {
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
          if(lastObject)
            lastObject.comments.push(line);
        } else if (line.toLowerCase().indexOf("feature:") === 0) {
          _this.featureCount++;
          feature.id = _this.encodeId(featureName);
          feature.type = 'feature';
          feature.name = line.substr(9, line.length - 9);
          feature.number = _this.featureCount;
          feature.lineNumber = lineNumber;
          feature.description = ko.observableArray();
          feature.scenarios = ko.observableArray();
          feature.backgrounds = ko.observableArray();
          feature.stepGroups = ko.observableArray();
          feature.comments = ko.observableArray();
          feature.extraLines = ko.observableArray();
          feature.runResult = ko.observable();
          feature.lastRunResult = ko.observable();
          feature.breakpoint = ko.observable(false);
          feature.state = {};
          _this.needComputedProperties[_this.needComputedProperties.length] = feature;
          lastRead = 'feature';
          lastObject = feature;
        } else if (line.toLowerCase().indexOf("scenario:") === 0
          || line.toLowerCase().indexOf("scenario outline:") === 0
          || line.toLowerCase().indexOf("feature background:") === 0
          || line.toLowerCase().indexOf("feature background outline:") === 0) {
          var scenario = {};
          scenario.lineNumber = lineNumber;
          scenario.steps = ko.observableArray();
          scenario.examples = [];
          scenario.examplesDisplay = [];
          scenario.examplesArrays = [];
          scenario.exampleArgColumns = [];
          scenario.exampleArgColumnsDisplay = null;
          scenario.exampleArg = null;
          scenario.exampleArgDisplay = null;
          scenario.number = feature.scenarios.length;
          scenario.runResult = ko.observable();
          scenario.lastRunResult = ko.observable();
          scenario.breakpoint = ko.observable(false);
          scenario.clones = [];
          scenario.aborted = false;
          scenario.step = null;
          scenario.error = ko.observable();
          scenario.lastError = ko.observable();
          scenario.state = {};
          scenario.scenarios = ko.observableArray();
          scenario.comments = ko.observableArray();
          lastObject = scenario;
          _this.needComputedProperties[_this.needComputedProperties.length] = scenario;
          if (line.toLowerCase().indexOf("scenario:") === 0) {
            scenario.type = 'scenario';
            scenario.name = line.trim().substr(10, line.length - 10);
            scenario.id = _this.encodeId(featureName + '_' + scenario.name);
            scenario.outline = false;
            feature.scenarios.push(scenario);
            lastRead = 'scenario';
          } else if (line.toLowerCase().indexOf("scenario outline:") === 0) {
            scenario.type = 'scenario outline';
            scenario.name = line.trim().substr(18, line.length - 18);
            scenario.id = _this.encodeId(featureName + '_' + scenario.name);
            scenario.outline = true;
            feature.scenarios.push(scenario);
            lastRead = 'scenario outline';
          } else if (line.toLowerCase().indexOf("feature background:") === 0) {
            scenario.type = 'feature background';
            scenario.name = line.trim().substr(19, line.length - 19);
            scenario.id = _this.encodeId(featureName + '_' + scenario.name);
            scenario.outline = false;
            feature.backgrounds.push(scenario);
            lastRead = 'feature background';
          } else if (line.toLowerCase().indexOf("feature background outline:") === 0) {
            scenario.type = 'feature background outline';
            scenario.name = line.trim().substr(27, line.length - 27);
            scenario.id = _this.encodeId(featureName + '_' + scenario.name);
            scenario.outline = true;
            feature.backgrounds.push(scenario);
            lastRead = 'feature background outline';
          }
          scenario.feature = feature;
          stepOwner = scenario;
        } else if (line.toLowerCase().indexOf("examples:") === 0) {
          lastRead = 'example';
        } else if (line.toLowerCase().indexOf("step group:") === 0 || line.toLowerCase().indexOf("step group outline:") === 0) {
          var outline = line.toLowerCase().indexOf("step group outline:") === 0;
          var stepGroup = {};
          stepGroup.used = 0;
          stepGroup.type = (outline ? 'step group outline' : 'step group');
          stepGroup.lineNumber = lineNumber;
          stepGroup.inlineArgs = [];
          stepGroup.multiLineArg = [];
          stepGroup.steps = ko.observableArray();
          stepGroup.name = (outline ? line.trim().substr(19, line.trim().length - 19).trim() : line.trim().substr(11, line.trim().length - 11).trim());
          stepGroup.id = _this.encodeId(featureName + '_' + stepGroup.name);
          stepGroup.runCondition = null;
          stepGroup.comments = ko.observableArray();
          lastObject = stepGroup;
          if (stepGroup.name.indexOf('if(') > -1) {
            stepGroup.runCondition = stepGroup.name.trim().substring(stepGroup.name.trim().indexOf('if(') + 3, stepGroup.name.trim().length - 1);
            stepGroup.name = stepGroup.name.substring(0, stepGroup.name.indexOf('if('));
          }
          stepGroup.runResult = ko.observable();
          stepGroup.lastRunResult = ko.observable();
          _this.needComputedProperties[_this.needComputedProperties.length] = stepGroup;
          feature.stepGroups.push(stepGroup);
          stepOwner = stepGroup;
          lastRead = 'step group';
        } else if ((lastRead == 'feature' || lastRead == 'featureDescription') && line.indexOf('<div') !== 0) {
          feature.description.push(
            {
              id: _this.encodeId(featureName + '_' + lineNumber),
              type: 'feature description',
              line: ko.observable(line.trim()),
              lineNumber: lineNumber
            });
          lastRead = 'featureDescription';
        } else if (line.toLowerCase().indexOf("given ") === 0 ||
          line.toLowerCase().indexOf("when ") === 0 ||
          line.toLowerCase().indexOf("then ") === 0 ||
          line.toLowerCase().indexOf("and ") === 0 ||
          line.toLowerCase().indexOf("but ") === 0) {
          var step = {};
          step.type = 'step';
          step.name = line;
          step.id = _this.encodeId(featureName + '_' + stepOwner.id + '_' + step.name);
          step.runCondition = null;
          step.comments = ko.observableArray();
          lastObject = step;
          if (step.name.indexOf('if(') > -1) {
            step.runCondition = step.name.trim().substring(step.name.trim().indexOf('if(') + 3, step.name.trim().length - 1);
            step.name = step.name.substring(0, step.name.indexOf('if('));
          }
          step.originalName = line;
          step.lineNumber = lineNumber;
          step.runResult = ko.observable();
          step.lastRunResult = ko.observable();
          step.error = ko.observable();
          step.lastError = ko.observable();
          step.outline = false;
          step.subSteps = ko.observableArray();
          step.tableArg = [];
          step.tableArgArray = [];
          step.tableArgColumns = [];
          step.methodName = null;
          step.method = null;
          step.inlineArgs = [];
          step.multiLineArg = [];
          step.libraryName = null;
          step.libraryMethodName = null;
          step.libraryMethodFullName = null;
          step.clones = [];
          step.breakpoint = ko.observable(_this.breakpoints().indexOf(step.id) > -1);
          stepOwner.steps.push(step);
          step.stepOwner = stepOwner;
          lastRead = 'step';
          _this.needComputedProperties[_this.needComputedProperties.length] = step;
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
    _this.log('Reseting run counts...');
    _this.resetRunCounts();
    _this.log('Reseting run results...');
    _this.resetRunResults();
    _this.log('Running feature sets...');
    return _this.runFeatureSets(_this.featureSets)
      .then(function (results) {
        _this.runResult(results);
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
      .then(function (runResult) {
        _this.runResult(runResult);
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

  _this.runningFeatureSet = ko.observable();
  _this.runningFeature = ko.observable();
  _this.runningScenario = ko.observable();
  _this.runningStep = ko.observable();
  _this.runningSubStep = ko.observable();

  _this.runResult = ko.observable();
  _this.lastRunResult = ko.observable();
  _this.runFeatureSets = function runFeatureSets(featureSets) {
    var result = null;
    var dfd = $.when();
    $.each(featureSets(), function (index, featureSet) {
      dfd = dfd.then(function () {
        return _this.runFeatureSet(featureSet)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    });
    dfd = dfd.then(function () {
      _this.runResult(result);
      return result;
    });
    return dfd.promise();
  };
  _this.runFeatureSet = function runFeatureSet(featureSet) {
    var result = null;
    var dfd = $.when();
    _this.runningFeatureSet(featureSet);
    if (featureSet.features().length > 0)
      dfd = dfd.then(function () {
        return _this.runFeatures(featureSet.features)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    if(featureSet.featureSets().length > 0)
      dfd = dfd.then(function () {
        return _this.runFeatureSets(featureSet.featureSets)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    dfd = dfd.then(function () {
      _this.counts.featureSets.run(_this.counts.featureSets.run() + 1);
      if (result == 1)
        _this.counts.featureSets.pass(_this.counts.featureSets.pass() + 1);
      else if (result == -1)
        _this.counts.featureSets.fail(_this.counts.featureSets.fail() + 1);
      else
        _this.counts.featureSets.skip(_this.counts.featureSets.skip() + 1);

      featureSet.runResult(result);
      return result;
    });
    return dfd.promise();
  };
  _this.runFeatures = function runFeatures(features) {
    var result = null;
    var dfd = $.when();
    $.each(features(), function (index, feature) {
      dfd = dfd.then(function () {
        return _this.runFeature(feature)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    });
    dfd = dfd.then(function () {
      return result;
    });
    return dfd.promise();
  };
  _this.runFeature = function runFeature(feature) {
    var result = null;
    var dfd = $.when();
    if (_this.runningFeature())
      _this.runningFeature().state = null;
    _this.runningFeature(feature);
    dfd = dfd.then(function () {
      return _this.runScenarios(feature, feature.backgrounds, true)
        .then(function (runResult) {
          result = _this.updateAggregateRunResult(result, runResult);
        });
    });
    dfd = dfd.then(function () {
      return _this.runScenarios(feature, feature.scenarios)
        .then(function (runResult) {
          result = _this.updateAggregateRunResult(result, runResult);
        });
    });
    dfd = dfd.then(function () {
      _this.counts.features.run(_this.counts.features.run() + 1);
      if (result == 1)
        _this.counts.features.pass(_this.counts.features.pass() + 1);
      else if (result == -1)
        _this.counts.features.fail(_this.counts.features.fail() + 1);
      else
        _this.counts.features.skip(_this.counts.features.skip() + 1);

      feature.runResult(result);
      return result;
    });
    return dfd.promise();
  };
  _this.runScenarios = function runScenarios(feature, scenarios, isBackground) {
    var result = null;
    var dfd = $.when();
    $.each(scenarios(), function (index, scenario) {
      dfd = dfd.then(function () {
        return _this.runScenario(feature, scenario, isBackground)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    });
    dfd = dfd.then(function () {
      return result;
    });
    return dfd.promise();
  };
  _this.runScenario = function runScenario(feature, scenario, isBackground) {
    var result = null;
    var dfd = $.when();
    if (_this.runningScenario())
      _this.runningScenario().state = null;
    _this.runningScenario(scenario);
    if (scenario.outline) {
      dfd = dfd.then(function () {
        return _this.runScenarios(feature, scenario.scenarios, isBackground)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    } else {
      if (isBackground)
        scenario.state = feature.state;
      else
        scenario.state = $.extend(true, {}, feature.state);
        //scenario.state = $.extend(true, {}, feature.state, scenario.state);
      dfd = dfd.then(function () {
        return _this.runSteps(scenario)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    }
    dfd = dfd.then(function () {
      if (!scenario.outline) {
        if (isBackground) {
          _this.counts.backgrounds.run(_this.counts.backgrounds.run() + 1);
          if (result == 1)
            _this.counts.backgrounds.pass(_this.counts.backgrounds.pass() + 1);
          else if (result == -1)
            _this.counts.backgrounds.fail(_this.counts.backgrounds.fail() + 1);
          else
            _this.counts.backgrounds.skip(_this.counts.backgrounds.skip() + 1);
        } else {
          _this.counts.scenarios.run(_this.counts.scenarios.run() + 1);
          if (result == 1)
            _this.counts.scenarios.pass(_this.counts.scenarios.pass() + 1);
          else if (result == -1)
            _this.counts.scenarios.fail(_this.counts.scenarios.fail() + 1);
          else
            _this.counts.scenarios.skip(_this.counts.scenarios.skip() + 1);
        }
      }
      scenario.runResult(result);
      return result;
    });
    return dfd.promise();
  };
  _this.runSteps = function runSteps(stepOwner) {
    var result = null;
    var dfd = new $.when();
    $.each(stepOwner.steps(), function (index, step) {
      if (step.subSteps().length > 0) {
        _this.setShouldRun(step, step.inlineArgs, stepOwner, stepOwner.state);
        dfd = dfd.then(function () {
          return _this.runSubSteps(step, stepOwner)
            .then(function (runResult) {
              result = _this.updateAggregateRunResult(result, runResult);
              step.runResult(runResult);
            });
        });
      } else {
        dfd = dfd.then(function () {
          return _this.runStep(step, stepOwner)
            .then(function (runResult) {
              result = _this.updateAggregateRunResult(result, runResult);
            });
        });
      }
    });
    dfd = dfd.then(function () {
      return result;
    });
    return dfd.promise();
  };
  _this.runSubSteps = function runSubSteps(step, stepOwner) {
    var result = null;
    var dfd = $.when();
    $.each(step.subSteps(), function (index, subStep) {
      if (!step.shouldRun)
        subStep.runCondition = 'false';
      dfd = dfd.then(function () {
        return _this.runStep(subStep, stepOwner, true)
          .then(function (runResult) {
            result = _this.updateAggregateRunResult(result, runResult);
          });
      });
    });
    dfd = dfd.then(function () {
      return result;
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
          step.runResult(0);
          if (subStep) {
            _this.counts.subSteps.run(_this.counts.subSteps.run() + 1);
            _this.counts.subSteps.skip(_this.counts.subSteps.skip() + 1);
          } else {
            _this.counts.steps.run(_this.counts.steps.run() + 1);
            _this.counts.steps.skip(_this.counts.steps.skip() + 1);
          }
          dfd.resolve(0);
        } else {
          if (!step.method) {
            step.runResult(-1);
            stepOwner.aborted = true;
            if (subStep) {
              _this.counts.subSteps.run(_this.counts.subSteps.run() + 1);
              _this.counts.subSteps.fail(_this.counts.subSteps.fail() + 1);
            } else {
              _this.counts.steps.run(_this.counts.steps.run() + 1);
              _this.counts.steps.fail(_this.counts.steps.fail() + 1);
            }
            dfd.resolve(-1)
          } else {
            try {
              stepOwner.config = _this.config;
              var stepDeferred = new $.Deferred();
              stepDeferred.then(function () {
                step.runResult(1);
                if (subStep) {
                  _this.counts.subSteps.run(_this.counts.subSteps.run() + 1);
                  _this.counts.subSteps.pass(_this.counts.subSteps.pass() + 1);
                } else {
                  _this.counts.steps.run(_this.counts.steps.run() + 1);
                  _this.counts.steps.pass(_this.counts.steps.pass() + 1);
                }
                dfd.resolve(1);
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
                step.runResult(-1);
                if (subStep) {
                  _this.counts.subSteps.run(_this.counts.subSteps.run() + 1);
                  _this.counts.subSteps.fail(_this.counts.subSteps.fail() + 1);
                } else {
                  _this.counts.steps.run(_this.counts.steps.run() + 1);
                  _this.counts.steps.fail(_this.counts.steps.fail() + 1);
                }
                dfd.resolve(-1);
              });
              _this.runStepMethod(step, stepOwner, stepDeferred);
            }
            catch (error) {
              if (_this.breakOnException())
                debugger;
              stepOwner.aborted = true;
              stepOwner.error(error);
              step.error(error);
              step.runResult(-1);
              if (subStep) {
                _this.counts.subSteps.run(_this.counts.subSteps.run() + 1);
                _this.counts.subSteps.fail(_this.counts.subSteps.fail() + 1);
              } else {
                _this.counts.steps.run(_this.counts.steps.run() + 1);
                _this.counts.steps.fail(_this.counts.steps.fail() + 1);
              }
              dfd.resolve(-1);
            }
          }
        }
        return dfd.promise();
      });
  };
  _this.runStepMethod = function runStepMethod(step, stepOwner, stepDeferred) {
    _this.setShouldRun(step, step.inlineArgs, stepOwner, stepOwner.state);
    if (_this.breakpoints().indexOf(step.id) >= 0)
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
      _this.replaceExpressions(stepOwner.state, step.inlineArgs, step.multiLineArg, step.tableArgArray);
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
      runner.runCondition = _this.replaceParameters(runner.runCondition, inlineArgs);
      runner.runCondition = _this.replaceExpression('{{' + runner.runCondition + '}}');
      runner.shouldRun = eval(runner.runCondition);
    } else {
      runner.shouldRun = true;
    }
  };

  _this.updateAggregateRunResult = function updateAggregateRunResult(aggregateRunResult, childRunResult) {
    if (childRunResult === -1)
      aggregateRunResult = -1;
    if (childRunResult === 2)
      aggregateRunResult = 2;
    else if ((childRunResult === 0 && aggregateRunResult === 1) || aggregateRunResult == 2)
      aggregateRunResult = 2;
    else if (childRunResult === 0 && aggregateRunResult !== -1)
      aggregateRunResult = 0;
    else if (childRunResult === 1 && (aggregateRunResult != -1 && aggregateRunResult != 0))
      aggregateRunResult = 1;
    return aggregateRunResult;
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
      _this.breakpoints.remove(entity.id);
    else
      _this.breakpoints.push(entity.id);
    entity.breakpoint(!entity.breakpoint());
  };
  _this.breakpoints = ko.observableArray();
  _this.breakOnException = ko.observable(false);
  _this.toggleOnException = function toggleOnException() {
    if (_this.breakOnException())
      _this.breakOnException(false);
    else
      _this.breakOnException(true);
  };

  _this.rootFeatureSet = ko.observable();
  _this.walk = function walk(startFeatureSetPath) {
    startFeatureSetPath = _this.getURLParameter('walkFeatureSet');
    if (startFeatureSetPath == "null")
      startFeatureSetPath = '/features/featureSet.js';
    require.undef(startFeatureSetPath);
    require([startFeatureSetPath], function (rootFeatureSet) {
      _this.initializeFeatureSet(rootFeatureSet, startFeatureSetPath, 0);
      _this.rootFeatureSet(rootFeatureSet);
      _this.walkExpandFeatureSet(rootFeatureSet);
      ko.applyBindings(_this, $('body')[0]);
      if (_this.featureSetPaths().length > 0 || _this.featurePaths().length > 0) {
        _this.load();
      }
    });
  };
  _this.initializeFeatureSet = function initializeFeatureSet(featureSet, featureSetPath, level) {
    featureSet = featureSet || {};
    featureSet.id = featureSet.id || _this.encodeId(featureSetPath);
    featureSet.featureSetPaths = featureSet.featureSetPaths || [];
    featureSet.featurePaths = featureSet.featurePaths || [];
    featureSet.libraryPaths = featureSet.libraryPaths || [];
    featureSet.path = featureSetPath;
    featureSet.featureSets = ko.observableArray();
    featureSet.features = ko.observableArray();
    featureSet.selected = ko.observable(false);
    featureSet.expanded = ko.observable(false);
    featureSet.level = level
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
    if (!featureSet.featureSetPaths)
      featureSet.featureSetPaths = [];
    if (!featureSet.featurePaths)
      featureSet.featurePaths = [];

    if ((featureSet.featureSetPaths.length > 0 && featureSet.featureSets().length == 0)
      || (featureSet.featurePaths.length > 0 && featureSet.features().length == 0)) {
      $.each(featureSet.featureSetPaths, function (index, featureSetPath) {
        require([featureSetPath], function (childFeatureSet) {
          _this.initializeFeatureSet(childFeatureSet, featureSetPath, parseInt(featureSet.level) + 2);
          featureSet.featureSets.push(childFeatureSet);
//          featureSet.featureSets.sort(function (a, b) {
//            if (a.name == b.name)
//              return 0
//            else if (a.name > b.name)
//              return 1
//            else return -1;
//          });
        });
      });
      $.each(featureSet.featurePaths, function (index, featurePath) {
        var feature = _this.initializeFeature(featurePath, featureSet.level + 2);
        featureSet.features.push(feature);
//        featureSet.features.sort(function (a, b) {
//          if (a.name == b.name)
//            return 0
//          else if (a.name > b.name)
//            return 1
//          else return -1;
//        });
      });
    }
    featureSet.expanded(true);
  };

  _this.toggleWalking = function toggleWalking() {
    if (_this.view() == 'Running')
      _this.view('Walking');
    else
      _this.view('Running');
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
    if(_this.allCollapsed())
      $('.collapsible').collapse('show');
    else
      $('.collapsible').collapse('hide');

    _this.allCollapsed(!_this.allCollapsed());
  };

  _this.allCollapsed = ko.observable(true);

  return _this;
});

//# sourceURL=gherkin-runner/gherkinRunner.js