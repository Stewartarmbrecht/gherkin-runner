var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('case sensitive routing', false);
app.use('/gherkin-runner', express.static(__dirname + '/gherkin-runner'));
app.use('/features', express.static(__dirname + '/features'));
app.use('/todo-app', express.static(__dirname + '/todo-app'));

app.get('/', function(request, response) {
  response.redirect('/gherkin-runner/gherkinRunner.html');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
