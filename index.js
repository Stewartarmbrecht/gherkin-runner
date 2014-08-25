var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// insert this before your routes
app.use(function(req, res, next) {
  for (var key in req.query)
  {
    req.query[key.toLowerCase()] = req.query[key];
  }
  next();
});

app.get('/', function(request, response) {
  response.redirect('/gherkinRunner.html');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});
