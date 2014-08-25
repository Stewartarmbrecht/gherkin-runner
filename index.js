var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000));
app.set('case sensitive routing', false);
app.use(app.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.redirect('/gherkinRunner.html');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
