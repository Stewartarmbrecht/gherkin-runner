var _this = {};
_this.encodeId = function encodeId(value) {
    var hash = 0, i, chr, len;
    if (value.length == 0) return hash;
    for (i = 0, len = value.length; i < len; i++) {
      chr = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return 'gr' + hash;
  };
_this.replaceExpressions = function replaceExpressions(state, inlineArgs, multiLineArg, tableArgArray) {
    inlineArgs.forEach(function (inlineArg, index, inlineArgs) {
      inlineArgs[index] = _this.replaceExpression.apply(state, [inlineArg]);
    });
    if (multiLineArg)
      multiLineArg.forEach(function (lineArg) {
        _this.replaceExpression.apply(state, [lineArg]);
      });
    tableArgArray.forEach(function (tableRow) {
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
    parameters.forEach(function (parameter, index) {
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
_this.aggregateRunResult = function aggregateRunResult(childResult, parentResult) {
  var result = 0;
  if(parentResult === null)
    result = childResult;
  else if(childResult === -1)
    result = -1;
  else if(childResult === 0 && parentResult !== -1)
    result = 0;
  else if(childResult === 1 && parentResult === 1)
    result = 1;
  else
    result = parentResult;
  return result;
};
module.exports = _this;