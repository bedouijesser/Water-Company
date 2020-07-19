const express = require('express');
const app = express();
var mysql = require("mysql");
const util = require('util');
const { APP_ID } = require('@angular/core');

app.use(express.static("./dist/"));
app.get("/pages/*", function (req, res) {
  res.sendFile("index.html", {
    root: "dist/"
  });
});
var listener = app.listen(process.env.PORT || 3000, function(){
  console.log('Listening on port ' + listener.address().port); //Listening on port 3000
  // console.log(app);
});

var pool = mysql.createPool({
  connectionLimit: 100,
  host: "biiyxfusqndydqa8txbr-mysql.services.clever-cloud.com",
  user: "u5kvnkvrgp3mgqgv",
  password: "0ohLVcGjy6kPGvbtalqR",
  database: "biiyxfusqndydqa8txbr"

});
pool.getConnection((err, connection) => {
  if (err) {
    console.log("connection error");
  } else {
    console.log("connected");
  }
})


function ensureToken(req, res, next) {
  const bearerHeader = req.query.authentification;

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    req.token = bearerToken;

    next();
  } else {
    res.sendStatus(403);
  }
}

app.get('/apiTest', function (req, res) {
  console.log('hello world');
  res.status(200).json("Test works")
});

app.get('/api/map/sp-list',  (req, res) => {
  pool.getConnection(async (err, connection) =>  {
    if (err) {
      res.status(500).json(err)
    } else {
      const asyncQuery = util.promisify(connection.query).bind(connection);

      try {
        query = `SELECT * FROM SP_main`;

        rows = await asyncQuery(query);
        res.status(200).json(rows);

      } catch (error) {
        console.log(err);
        res.status(500).json(err);
      }

    }
  });
});
app.get('/api/map/add-marker',  (req, res) => {
  pool.getConnection(async (err, connection) =>  {
    if (err) {
      res.status(500).json(err)
    } else {
      const asyncQuery = util.promisify(connection.query).bind(connection);
      marker = JSON.parse(req.query.marker);
      console.log('req.body : ', marker)
      try {
        query = `INSERT INTO SP_main
              (SP_Title, SP_Description, SP_Manager, SP_Type, SP_Email, SP_Tel, SP_Fax, SP_Coordonates)
              VALUES
              ('${marker.properties.title}',
              '${marker.properties.description}',
              '${marker.properties.manager}',
              '${marker.properties.type}',
              '${marker.properties.email}',
              ${marker.properties.fax},
              ${marker.properties.tel},
              '${JSON.stringify(marker.geometry.coordinates)}'
              )`;

        rows = await asyncQuery(query);
        res.status(200).json(rows);

      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }

    }
  });
});


