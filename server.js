var express = require('express'),
    bodyParser = require('body-parser'),
    oauthserver = require('oauth2-server'),
    ecstatic = require('ecstatic'),
    response = require('response'),
    qs = require('querystring'),
    uuid = require('uuid'),
    serveStatic = require('serve-static'),
    session = require('express-session'),
    finalhandler = require('finalhandler'),
    hyperstream = require('hyperstream'),
    crypto = require('crypto')

var users = {
    'foo' : 'bar'
}
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({secret: 'keyboard cat'}))


/*
app.oauth = oauthserver({
  model: require('./models/meomory'),
  grants: ['auth_code', 'password'],
  debug: true
});

*/
var clients = {};
app.post('/client_register',function(req,res,next) {
    console.log(req.body);
    var obj = req.body;
    obj.client_secret = uuid.v4();
    obj.client_id = uuid.v4();
    clients[obj.client_id] = obj;
    response.json(obj).status(200).pipe(res)
})

app.use(function(req,res,next) {
    console.log(req.method,req.url);
    next()
})
app.get('/auth',function(req,res,next) {
    var client_id, redirect_uri;
    if (!req.query) {
        return response.txt('invalid client id').status(400).pipe(res) 
    }
    if (req.query) {
        client_id = req.query.client_id;
        if ((!client_id) || (!clients[client_id])) {
            return response.txt('invalid client id').status(400).pipe(res) 
        }
    } 
    if (!req.session.user) {
        console.log("no req session user")
        res.redirect('/login?client_id='+client_id)
    } else {
        console.log("ther eis now req session user")
        var client = clients[client_id];
        var done = finalhandler(req, res)
        ecstatic('./web',{passthrough:{
            'auth/index.html' : function() { return hyperstream({
                'span#thirdparty' : {
                    _html: client.name
                }                
            }) }
        }})(req,res,done)
    }
})


    var generateRandomToken = function (callback) {
      crypto.randomBytes(256, function (ex, buffer) {
        if (ex) return callback(error('server_error'));

        var token = crypto
          .createHash('sha1')
          .update(buffer)
          .digest('hex');

        callback(false, token);
      });
    };

app.post('/authorize',function(req,res,next) {
    console.log("req.query authorize:", req.query)
    if (!req.session.user) {
        return res.redirect('/login?client_id=' + req.query.client_id +
        '&redirect_uri=' + req.query.redirect_uri);
    }
    next();
}, function(req, res, next) {
    var client_id = req.query.client_id;
    var redirect_uri = clients[client_id].redirect_uri;
    console.log(clients)
    generateRandomToken(function(err,token) {
        console.log("Generated Token:", token)
        var url = redirect_uri+'?code='+token
        console.log("redirecting to:",url)
        response.json({ok:true,redirect:url}).status(200).pipe(res)
//        res.redirect(url)
    })
})

app.use(function(req,res,next) {
    console.log("Using ecstatic middleware",req.path)
    return ecstatic('./web')(req,res,next)
})

// Handle login
app.post('/login', function (req, res, next) {
    console.log("Login",req.body)
    console.log(req.query)
    var obj = req.body;
    var args = qs.stringify({client_id:req.query.client_id})
    console.log(args)
    if ((users[obj.username]) && (users[obj.username] == obj.password)) {
        console.log("Good")
        req.session.user = obj.username;
        response.json({ok:true,redirect:'/auth?'+args}).status(200).pipe(res)
    } else {
        console.log("bad")
        response.json({ok:false}).status(200).pipe(res)
    }
});

app.listen(3000);
