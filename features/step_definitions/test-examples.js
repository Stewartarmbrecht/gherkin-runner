/*jslint node: true */
"use strict";
module.exports = function () {
  var gherkinRunner = require('gherkin-runner/gherkinRunner'),
    utilities = require('features/support/utilities'),
    diff = require('gherkin-runner/vendor/deep-diff/releases/deep-diff-0.2.0.min').diff;
  this.$ = null;
  this.Given(/^a file "([^"]*)" with the following content:$/, function(filePath, expectedFileContents, callback) {
    require(['text!' + filePath], function(fileContents){
      var errorMsg = utilities.compareMultiLineStrings(expectedFileContents, fileContents);
      callback(errorMsg);
    }, function(error){
      callback(error);
    })
  });
};