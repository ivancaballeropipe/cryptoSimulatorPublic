'use strict'

// Cargar modulos de node para crear servidor
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Accesos a traves de las peticiones
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "*");
    next();
});

// MiddLewares
app.use(bodyParser.urlencoded({extended:true }));
app.use(bodyParser.json());

module.exports = app;