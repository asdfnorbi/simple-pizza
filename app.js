'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app;

const swaggerSecurity = require('./api/helpers/swagger_security.js');

var config = {
  appRoot: __dirname,
  swaggerSecurityHandlers: swaggerSecurity.swaggerSecurityHandlers
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  swaggerExpress.register(app);

  var port = process.env.PORT || 5000;
  app.listen(port);
});
