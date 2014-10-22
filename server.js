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
    crypto = require('crypto'),
    hyperglue = require('hyperglue'),
    permissions = require('./lib/permissions')

var lib = require('./lib')
var signer = require('./lib/signer')


var users = {
    'foo' : 'bar'
}
var app = express();

app.use(function(req,res,next) {
    console.log(req.method,req.url);
    next()
})
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

app.post('/token',function(req,res,next) {
    console.log("Token request");   
    console.log(req.body);
    console.log(clients)
    var client_id = req.body.client_id;
    var client_secret = req.body.client_secret;
    var obj = clients[client_id];
    if (client_secret === obj.client_secret) {
        var access_token = uuid.v4()
        response.json({access_token:access_token}).status(200).pipe(res)
    } else {
        response.json({error:'invalid_request'}).status(200).pipe(res)
    }
})


app.get('/logout',function(req,res,next) {
    delete req.session.user;
    var done = finalhandler(req, res)
    console.log(req.url,req.path)
    ecstatic('./web')(req,res,done)
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
        var html = [
            '<div id="rows">',
            '<div class="row">',
            '<span class="name"></span>',
            '<span class="message"></span>',
            '</div>',
            '</div>'
        ].join('\n');
        var list = permissions.list;
        list = list.map(function(item) {
            return { '.name' : item, '.message' : 'Perform operation ' + item }
        })
        
        ecstatic('./web',{passthrough:{
            'auth/index.html' : function() { return hyperstream({
                'span#thirdparty' : {
                    _html: client.name
                },
                'div#permissions' : {
                    _html: hyperglue(html, {'.row': list}).outerHTML
                }                
            })}
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
        // authorization result object
        var jwt = lib.generateJwt()
        console.log("Result of signer signJWT:")
        console.log(signer.signJWT(jwt.payload))
        var authorization = {
          "id_token" : "idtokenstr",
          "access_token" : token, 
          "state" : "",
          "expires_in" : "3600",
          "error" : "undefined",
          "error_description" : "undefined",
          "authUser" : "0",
          "status" : {
            "ripple_logged_in" : "true",
            "method" : "PROMPT",
            "signed_in" : "true"
          }
        };
        response.json({ok:true,authorization:authorization,redirect:url}).status(200).pipe(res)
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
