var http = require('http');
var express = require('express');
var bp = require('body-parser');
var ecstatic = require('ecstatic');
var app = express();
app.use(bp.json());
app.use(ecstatic('./web'))
var server = http.createServer(app);

server.listen(3005);
