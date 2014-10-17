var express = require('express'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server');

var app = express();

app.use(function(req,res,next) {
    console.log(req.method + " " + req.url);
    console.log(req.headers)
    next()
})
app.use(bodyParser.json());

var memorymodel = require('./models/memory')

app.oauth = oauthserver({
  model: memorymodel,
  grants: ['password'],
  debug: true
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
  res.send('Secret area');
});

app.use(app.oauth.errorHandler());

app.listen(3000);
