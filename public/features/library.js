define(['gherkinRunner', 'features/utilities'], function (gherkinRunner, utilities) {
  var _this = {};
  _this.$ = null;
  _this['the user is on the home page'] = function (callback) {
    $.address.value('');
    var uiTestWindow = $('#uitestwindow');
    uiTestWindow.empty();
    utilities.$ = null;
    uiTestWindow.attr('src', 'about:blank');
    utilities.waitTillTrue(function () {
      return uiTestWindow[0].contentWindow.$ == undefined;
    }).then(function () {
      uiTestWindow.attr('src', 'todoApp/index.html');
      utilities.waitTillTrue(function () {
        return uiTestWindow[0].contentWindow.$;
      }).then(function () {
        utilities.$ = uiTestWindow[0].contentWindow.$;
        gherkinRunner.showUIWindow();
        callback();
      });
    });
  };
  _this['I should see an empty list'] = function (callback) {
    utilities.waitTillExist('#todo-list')
      .then(function () {
        var listLength = $('#todo-list li').length;
        if (listLength > 0)
          callback(new Error("The list was not empty."));
        else
          callback();
      })
      .fail(callback);
  };
  _this['there should be an input for the first to do'] = function (callback) {
    utilities.waitTillVisible('input#new-todo')
      .then(function () {
        callback();
      })
      .fail(callback);
  };
  _this[/the entry field should have a placeholder that states "(.*)"/] = function (placeholder, callback) {
    utilities.waitTillAttributeValue('input#new-todo', 'placeholder', placeholder)
      .then(function () {
        callback();
      })
      .fail(callback);
  };
  _this[/the list should be titled "(.*)"/] = function (title, callback) {
    utilities.waitTillHasText('header#header > h1', title)
      .then(function () {
        callback();
      })
      .fail(callback);
  };
  return _this;
});
