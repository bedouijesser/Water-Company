let NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  NODE_ENV = "dev";

}
let PORT = process.env.PORT;
if (!PORT) {
  PORT = 1338;

}
console.log(`Your ENV IS   ${NODE_ENV}`);
console.log(`Your PORT IS   ${PORT}`);

var jwt = require("jsonwebtoken");
var secretKey = "test";
var express = require("express");
const session = require("express-session");
const cors = require('cors');
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");

var fsEx = require("fs-extra");
var fs = require("fs");
const multer = require('multer');
const uploadDir = 'ServerDev/Sales Folder/Direct Sales File/Temp';
const upload = multer({
  dest: uploadDir
});
const uploadInputDataDocDir = 'ServerDev/Sales Folder/Direct Sales File/InputDataDocTemp';
const uploadInputDataDoc = multer({
  dest: uploadInputDataDocDir
});
const uploadSQDocDir = 'ServerDev/Sales Folder/Direct Sales File/SQDocTemp';
const uploadSQDoc = multer({
  dest: uploadSQDocDir
});
const uploadInputDataIDDir = 'ServerDev/Sales Folder/Direct Sales File/InputDataIDTemp';
const uploadInputDataID = multer({
  dest: uploadInputDataIDDir
});

// var https = require('https');
var https = require('http');
// var privateKey  = fs.readFileSync('ssl/k.pem');

// var certificate = fs.readFileSync('ssl/k.crt');

app.use(session({
  secret: "boogeyman",
  resave: false,
  saveUninitialized: true
}));
/*
app.use(cors({origin: [
  "http://localhost:4200"
], credentials: true}));
*/
//CORS Middleware
app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  next();
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());





const preFilesPath = "C:/Users/oussama/";
if (NODE_ENV == 'dev') {

  var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "Water_company"


  });
  /*
  	var connection = mysql.createConnection({
      host:"localhost",
      user:"root",
      password:"",
      database:"kgtc_dev"

    });*/
} else {

  //   var pool = mysql.createPool({
  //     connectionLimit:100,
  //     host:"localhost",
  //     user:"kgtc_user",
  //     password:"UXTq{[LgWF7y",
  //     database:"kgtc_dev"

  // });
  var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "Water_company"

  });
}



pool.getConnection(function (err, connection) {
  if (err) {
    console.log("connection error");
  } else {

    console.log("connected");
  }
});

app.get('/', function (req, res) {
  if (req.session.page_views) {
    req.session.page_views++;
    res.send('You visited this page ' + req.session.page_views + " times");
  } else {
    req.session.page_views = 1;
    res.send("Welcome to this page for the first time!");
  }
});

/**
 * Middleware to check that a payload is present
 */
const validatePayloadMiddleware = (req, res, next) => {
  if (req.body) {
    next();
  } else {
    res.status(403).send({
      errorMessage: 'You need a payload'
    });
  }
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var credentials = {key: privateKey, cert: certificate};
var server = https.createServer( /*credentials,*/ app);

server.listen(PORT);
