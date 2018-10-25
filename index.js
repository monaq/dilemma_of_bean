var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs")
var port = process.ENV.PORT || 80

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(port, function(){
    console.log("Express server has started on port 3000")
});

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

var router = require('./router')(app, fs);