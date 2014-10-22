var http = require('http');
var express = require('express');
var bp = require('body-parser');
var ecstatic = require('ecstatic');
var response = require('response')
var request = require('request');
var app = express();
app.use(bp.json());
app.use(ecstatic('./web'))
var oauth = {
    client_id:undefined,
    client_secret:undefined
}
app.post('/register_app', function(req,res,next) {
    console.log("register app");
    console.log(req.headers)
    console.log(req.body)
    var href = "http://localhost:3000/auth?response_type=code&client_id=CLIENT_ID";
    href = href.replace('CLIENT_ID',req.body.client_id)
    oauth.client_id = req.body.client_id;
    oauth.client_secret = req.body.client_secret;
    console.log("OAUTH:", oauth)
    response.json({ok:true,href:href}).status(200).pipe(res)
})
app.post('/request_token',function(req,res,next) {
    console.log("request token");
    console.log(req.headers)
    console.log(req.body)
    var obj = {
        grant_type:'authorization_code',
        code:req.body.code,
        redirect_uri:'/client_err',
        client_id:oauth.client_id, 
        client_secret:oauth.client_secret 
    }
    console.log("OBJ:",obj)
    request.post({url:'http://localhost:3000/token',json:true,body:obj},function(err, resp, body) {
        if (body.access_token) {
            response.json({access_token:body.access_token}).status(200).pipe(res)            
        } else {
            response.json({ok:false}).status(200).pipe(res) 
        }
    })
})
var server = http.createServer(app);
server.listen(3005);
