var express = require('express');	        // include the express library
var app = express();					          // create a server using express
app.use('/assets',express.static('assets', {
  setHeaders: function(res, path) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}))
app.use('/',express.static('public')); // serve static files from /public
app.listen(1337);                      // start the server

