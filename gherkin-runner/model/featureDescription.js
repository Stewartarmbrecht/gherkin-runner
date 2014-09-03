var utilities = require('/gherkin-runner/model/utilities.js');
function FeatureDescription(line, lineNumber, feature) {
    this.id = utilities.encodeId(feature.path + '_' + lineNumber),
    this.type = 'feature description',
    this.line = ko.observable(line.trim()),
    this.lineNumber = lineNumber
};

module.exports = FeatureDescription;