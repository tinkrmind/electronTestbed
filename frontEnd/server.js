
/*
  Four line static file server
  This server script serves files from a subfolder called 'public'
  adapted from expressjs.com examples, 2016
  by Tom Igoe
*/
var express = require('express');	        // include the express library
var app = express();					          // create a server using express
app.use('/assets',express.static('assets'))
app.use('/',express.static('public')); // serve static files from /public
app.listen(1337);                      // start the server

