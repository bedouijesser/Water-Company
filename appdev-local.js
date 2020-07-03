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

var nodemailer = require('nodemailer');
/*var transporter = nodemailer.createTransport({
  service:'gmail',
  secure: false,
  port: 465 ,
  auth:{
    user:'bedouioussama@gmail.com',
    pass:'OUSSAMA13579bedoui'
  },
  tls: {
    rejectUnauthorized: false
  }
});*/
// Or using SMTP Pool if you need to send a large amount of emails
var smtpPool = require('nodemailer-smtp-pool');
var transporter = nodemailer.createTransport(smtpPool({
  pool: true,
  port: 465,
  secure: true, // use SSL
  host: 'kgtc.net',
  auth: {
    user: 'notification@kgtc.net',
    pass: 'KGTC123456789kgtc'
  },
  tls: {
    rejectUnauthorized: false
  },
  maxConnections: 5,
  maxMessages: 10
}));
// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
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


// const preFilesPath="C:/Users/oussama/";
// var connection = mysql.createConnection({
// host:"localhost",
// user:"kgtc_user",
// password:"UXTq{[LgWF7y",
// database:"kgtc_construct"
// });






const preFilesPath = "C:/Users/oussama/";
if (NODE_ENV == 'dev') {

  // var pool = mysql.createPool({
  //   connectionLimit:100,
  //   host:"localhost",
  //   user:"kgtc_user",
  //   password:"UXTq{[LgWF7y",
  //   database:"kgtc_dev"
  var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "kgtc_dev_2"


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
    database: "kgtc_dev_2"

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

/**
 * Log the user in.
 * User needs to provide pw and email, this is then compared to the pw in the "database"
 * If pw and email match, the user is fetched and stored into the session.
 * Finally the user is returned from the request.
 */
app.post('/login', (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      res.status(500).json(err)
    } else {
      //  query=`select Employee_First_Name,Employee_Last_Name,Professional_mail,Position
      //   from hr_emp_gnd
      //     where Professional_mail = '`+req.body.email+`'
      //  && Password = '`+req.body.password+`';`
      query = `select EmployeeName,ProfessionalMail,Actual_Position_ID
      from HR_Employee_General_Data
      where ProfessionalMail = '` + req.body.email + `'
      && Password = ` + connection.escape(req.body.password) + `;`
      connection.query(query,
        function (err, rows, fields) {
          if (err) {
            console.log(err);
            res.status(403).send({
              errorMessage: 'Internal Error'
            });
          } else if (rows[0]) {
            const userWithoutPassword = {
              email: rows[0].ProfessionalMail,
              name: rows[0].EmployeeName,
              position: rows[0].Actual_Position_ID
            };
            req.session.user = userWithoutPassword;
            const token = jwt.sign({
              exp: 60 * 60 * 60 * 12,
              data: req.body.email
            }, secretKey);
            res.json({
              data: {
                token: token
              }
            });
            connection.release();
          } else {
            query = `select CP_Name,OS_Contact_Person_Mail
            from suppliers_access
            where OS_Contact_Person_Mail = ` + connection.escape(req.body.email) + `
            AND Password = ` + connection.escape(req.body.password) + `;`;
            connection.query(query,
              function (err, rows, fields) {
                if (err) {
                  console.log(err);
                  res.status(403).send({
                    errorMessage: 'Internal Error'
                  });
                } else if (rows[0]) {
                  const userWithoutPassword = {
                    email: rows[0].OS_Contact_Person_Mail,
                    name: rows[0].CP_Name,
                    position: 'Supplier'
                  };
                  req.session.user = userWithoutPassword;
                  const token = jwt.sign({
                    exp: 60 * 60 * 60 * 12,
                    data: req.body.email
                  }, secretKey);
                  res.json({
                    data: {
                      token: token
                    }
                  });
                  connection.release();
                } else {
                  console.log(err);
                  res.status(403).json({
                    errorMessage: 'Unvalid username/password'
                  });
                  connection.release();
                }
              })
          }
        })
    }
  })
})

/**
 * Check if user is logged in.
 */
app.get('/login', (req, res) => {

  req.session.user ? res.status(200).send({
    loggedIn: true
  }) : res.status(200).send({
    loggedIn: false
  });
});

/**
 * Log the user out of the application.
 */
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out.');
    } else {
      res.status(200).send({});
      connection.release();
    }
  });
});

const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(403).send({
      errorMessage: 'You must be logged in.'
    });
  }
};

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
app.get('/user', ensureToken, (req, res) => {
  let email = jwt.decode(req.query.authentification).data;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select EmployeeName,Actual_Position_ID
      from HR_Employee_General_Data
      where ProfessionalMail = '` + email + `';`;
      connection.query(query, function (err, rows, fields) {
        if (err) {
          res.json("error");
          console.log(err);
        } else {
          if (rows[0]){
            const user = {
              email: email,
              name: rows[0].CP_Name,
              position: rows[0].Actual_Position_ID
            };
            res.status(200).json(user);
            connection.release();
          }else {

            query = `select CP_Name
            from suppliers_access
            where OS_Contact_Person_Mail = '` + email + `';`;
            connection.query(query, function (err, rows, fields) {
              if (err) {
                res.json("error");
                console.log(err);
              } else {
                const user = {
                  email: email,
                  name: rows[0].CP_Name,
                  position: 'Supplier'
                };
                res.status(200).json(user);
                connection.release();
              }
            });
          }
        }
      });
    }
  })
});

app.get('/names', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      connection.query(`select Employee_First_Name, Employee_Last_Name
                      from HR_EMP_GND `,
        function (err, rows, fields) {
          if (err) {
            res.status(403).send({
              errorMessage: 'Internal Error'
            });
          } else {
            empList = [];
            for (emp of rows) {
              empList.push(emp.Employee_First_Name + " " + emp.Employee_Last_Name)
            }
            res.status(200).send(empList);
            connection.release();
          }
        });
    }
  });
})

app.get('/positions', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      connection.query(`select distinct(Position)
                    from hr_emp_gnd `,
        function (err, rows, fields) {
          if (err) {
            res.status(403).send({
              errorMessage: 'Internal Error'
            });
          } else {
            posList = [];
            for (pos of rows) {
              posList.push(pos.Position_Title);
            }
            res.status(200).send(posList);

            connection.release();
          }
        });

    }
  });
})
app.post("/file", ensureToken, upload.single('file'), (req, res) => {
  today = new Date();
  var dd = String(today.getDate());
  dd < 10 ? dd = '0' + dd : true;
  var mm = String(today.getMonth() + 1); //January is 0!
  mm < 10 ? mm = '0' + mm : true;
  var yyyy = today.getFullYear();
  var time = today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();
  today = mm + '-' + dd + '-' + yyyy + '_' + time;

  form = JSON.parse(req.body.form);
  user = JSON.parse(req.body.user);



  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      connection.query("INSERT INTO `pft` VALUES ();", function (err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          var fileType = "Type ";
          if (form['fTypeSales']) {
            fileType = fileType.concat('1');
          }
          if (form['fTypeProject']) {
            fileType = fileType.concat('2');
          }
          if (form['fTypeService']) {
            fileType = fileType.concat('3');
          }


          id = rows.insertId;
          var query = "";
          /*
            IF The User is a General Manager or His secritary
          */
          if (user['position'] == 'General Manager' || user['position'] == 'General Manager Secritary') {
            pfCode = "PF-" + yyyy + "-" + mm + "-" + id;

            query = "UPDATE `pft` SET `PF_Code` = 'PF-" + yyyy + "-" + mm + "-" + id + "'," +
              "`PF_URL` = 'Desktop/ServerFolder/PFT Folder/PF-" + yyyy + "-" + mm + "-" + id + " '," +
              "`PF_Created_By` = '" + user['email'] + "'," +
              "`PF_Lastupdate_By` = 'Standard'," +
              "`File_Received_On` = '" + req.body.receivedOn + "' ," +
              "`File_Received_By_Position` = '" + user['position'] + "' ," +
              "`File_Received_By_Name` = '" + user['name'] + "' ,"


            for (var i = 1; i <= 5; i++) {
              /***************************************************************************************************
               * we check the select position or name of Trans1
               * here if position
               */

              if (form['namePos' + i] == "pos") {
                query += "`Transfer_to" + i + "_Position` = '" + form['transferList' + i] + "' ," +
                  "`Transfer_to" + i + "_Employee_Code` = (select Employee_Code from hr_emp_gnd where Position = '" + form['transferList' + i] + "') ," +
                  "`Transfer_to" + i + "_Employee_Name` = (select concat_ws(' ',Employee_First_Name,Employee_Last_Name) from hr_emp_gnd where Position = '" + form['transferList' + i] + "') ,"

              }
              /************************************
               * Here If name for Trans1
               */
              if (form['namePos' + i] == "name") {
                query += "`Transfer_to" + i + "_Position` = (select position from HR_EMP_GND " +
                  "where concat_ws(' ',Employee_First_Name,Employee_Last_Name) = '" + form['transferList' + i] + "' " +
                  "Order By position ASC LIMIT 1) ," +
                  "`Transfer_to" + i + "_Employee_Code` = (select Employee_Code from hr_emp_gnd where Position = " +
                  "(select position from HR_EMP_GND " +
                  "where concat_ws(' ',Employee_First_Name,Employee_Last_Name) ='" + form['transferList' + i] + "' " +
                  "order by position ASC LIMIT 1)) ," +
                  "`Transfer_to" + i + "_Employee_Name` = '" + form['transferList' + i] + "',"
              }
            }
            query += "`GEN_Management_Decision_Approval_Status` = 'Required'," +
              "`File_Type` = '" + fileType + "'" +
              "WHERE `pft`.`PF_No` = '" + id + "';";

          } else {
            /*
              Else the Other Users
            */
            query = "UPDATE `pft` SET `PF_Code` = 'PF-" + yyyy + "-" + mm + "-" + id + "'," +
              "`PF_URL` = 'Desktop/ServerFolder/PFT Folder/PF-" + yyyy + "-" + mm + "-" + id + " '," +
              "`PF_Created_By` = '" + user['email'] + "'," +
              "`PF_Lastupdate_By` = 'Standard'," +
              "`File_Received_On` = '" + req.body.receivedOn + "' ," +
              "`File_Received_By_Position` = '" + user['position'] + "' ," +
              "`File_Received_By_Name` = '" + user['name'] + "' ," +
              "`Transfer_to1_Position` = 'Sales Manager' ," +
              "`Transfer_to1_Employee_Code` = (select Employee_Code from hr_emp_gnd where Position = 'Sales Manager') ," +
              "`Transfer_to1_Employee_Name` = (select concat_ws(' ',Employee_First_Name,Employee_Last_Name) from hr_emp_gnd where Position = 'Sales Manager') ," +
              "`File_Type` = '" + fileType + "'" +
              "WHERE `pft`.`PF_No` = '" + id + "';";
          }
          /**
           * We pass The treated query to insert in the prefile table
           */
          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
            } else {
              /*****************************************************************************
               * Copy the folder from the source to the prefiles directory
               */
              try {
                fsEx.copySync('../Desktop/ServerFolder/Model/Mod-PF Folder/Model-PF Folder',
                  '../Desktop/ServerFolder/PF-Folder/PF-' + yyyy + '-' + mm + '-' + id);
                console.log('Directory Copied!')

              } catch (err) {
                console.log(err);
              }
              /******************************************************************************
               * Move the file from the upload folder to the new prefile folder
               */
              try {
                fsEx.moveSync('./' + uploadDir + '/' + req.file.filename,
                  '../Desktop/ServerFolder/PF-Folder/PF-' + yyyy + '-' + mm + '-' + id + '/Input Data/' + yyyy + '-' + mm + '-' + dd + '/doc.rar');
                console.log('File Moved!')
              } catch (err) {
                console.log(err);
              }

              /*****************************************************************************
               * Then we send a notification e-mail to the Transfer_to1_Employee_Code
               */
              query = `select Professional_mail from
                  hr_emp_gnd
                  where Employee_Code = (select Transfer_to1_Employee_Code
                                        from pft
                                        where pf_no = '` + id + `')`
              connection.query(query, function (err, rows, fields) {
                if (err) {
                  console.log(err)
                } else {
                  var mailOptions = {
                    from: 'bedouioussama@gmail.com',
                    to: 'c.benslama2012@gmail.com',
                    subject: 'Sending Email using Node.js',
                    text: 'You have a new pre-file !'
                  }


                  transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log('Email sent ' + info.response);
                      query = "INSERT INTO act_dashboard" +
                        "( `Ref`, `Responsible_Code`, `Responsible_Name`, `Responsible_Position`, `Action_Deadline`) " +
                        "VALUES ('SA-PFT/PF-" + yyyy + "-" + mm + "-" + id + "', concat_ws('','SA-PFT/',(select Transfer_to1_Employee_Code from pft where PF_No =" + id + "))," +
                        "concat_ws('','SA-PFT/',(select Transfer_to1_Employee_Name from pft where PF_No = " + id + ")), concat_ws('','SA-PFT/',(select Transfer_to1_Position from pft where PF_No = " + id + "))," +
                        " concat_ws('','SA-PFT/',(select Date_add(PF_Created_On,Interval 2 day) from pft where PF_No = " + id + ")));";
                      connection.query(query, function (err, rows, fields) {
                        if (err) {
                          console.log(err);
                        } else {
                          res.status(200).send({
                            emailSent: true
                          });
                          connection.release();
                        }
                      });
                    }
                  });
                }
              });

            }
          });
        }
      });
    }
  });
})
app.post("/forgotPassword", ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      connection.query("select Professional_mail from hr_emp_gnd where Professional_mail= '" + req.body.email + "'", function (err, rows, field) {
        if (err) {
          console.log(err);
        } else {
          if (rows[0]) {
            var mailOptions = {
              from: 'bedouioussama@gmail.com',
              to: 'c.benslama2012@gmail.com',
              subject: 'Sending Email using Node.js',
              text: 'your password !'
            }

            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.log(err);
              } else {
                connection.release();
                res.status(200).send({
                  exist: true
                });
              }
            });
          } else
            connection.release();
          res.status(200).send({
            exist: false
          });

        }
      });
    }
  })
})
app.get("/prefilelist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      let query = `select pf_code as pfCode,
    concat_ws(' ',
              concat_ws('-',
                        Extract(YEAR From pf_created_on),
                        Extract(Day FROM pf_created_on),
                        Extract(Day FROM pf_created_on)
                      ),
              concat_ws(':',
                        Extract(Hour from pf_created_on),
                        Extract(Minute from pf_created_on),
                        Extract(Second from pf_created_on)
                      )
            ) as createdOn,(select concat_ws(' ',Employee_First_Name,Employee_Last_Name)
                                              from hr_emp_gnd
                                              where Professional_mail = PF_Created_By ) as createdBy,pf_status as status,
                                              Replace(PFA_Responsible_Name,'Standard','-') as pfaResponsableName,
                                              PFA_Responsible_Code as pfaResponsableCode,
                                              PF_URL as pfUrl
                  from pft`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
})
app.get("/showPreFile", ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      connection.query("select * from pft where PF_Code = '" + req.query.pfCode + "'", (err, rows, fields) => {
        if (err) {
          res.json(err);
        } else {
          connection.release();
          res.status(200).json(rows[0]);
        }
      })
    }
  });
});
app.get('/test', ensureToken, (req, res) => {

  res.download("C:/Users/oussama/Desktop/ServerFolder/PF-Folder/PF-2020-01-200/Input Data/2020-01-01/doc.rar", 'doc.rar');
});
/*********************************************************************************************************
 * ***************Client
 * *********************************************************************************************
 * ************************************************************************************************
 */
app.get('/showClient', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ClientID as ID,ClientReference as Reference,ClientName as Name,ClientAddedBy as AddedBy,ClientAddedOn as AddedOn,ClientHeadOfficeAdress as HeadOfficeAdress,HeadOfficeLocation as HeadOfficeLocation,
            ClientTel as Tel,ClientFax as Fax,ClientWebsite as Website,CompanyMail,TotalPOsAmountUSD,ClientGrade as Grade,ClientType as Type
            from client_main_table,general_client_type,(select max(ClientID) as ID
                                                        from client_main_table
                                                        group by ClientReference) as maxTable
            where ClientReference='` + req.query.ref + `'
            && maxTable.ID =client_main_table.ClientID
            && client_main_table.ClientTypeID=general_client_type.ClientTypeID
            `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          if (rows[0]) {
            var client = rows;
            query = `select CountryName
                  from general_country
                  where CountryID in (select CountryCode
                                      from client_country
                                      where ClientID = (select MAX(ClientID)
                                                        from client_main_table
                                                        where ClientReference='${req.query.ref}'
                                                        group by ClientReference
                                                        )
                                      )`

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {
                if (!rows[0]) {
                  rows[0] = {
                    CountryName: null
                  }
                }
                if (!rows[1]) {
                  rows[1] = {
                    CountryName: null
                  }
                }
                if (!rows[2]) {
                  rows[2] = {
                    CountryName: null
                  }
                }
                client = [...client, ...rows];
                query = `select ContactPersonName,ContactPersonPosition,ContactPersonMail,ContactPersonTel1,ContactPersonTel2,ContactPersonStatus
                from client_contact_person
                where ClientId=(select max(ClientId)
                                from client_main_table
                                where ClientReference='${req.query.ref}'
                                group by ClientReference)`

                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json(err);
                  } else {

                    client = [...client, {
                      contactPersons: rows
                    }];

                    connection.release();
                    res.status(200).json(client);
                  }
                })
              }
            })
          } else {
            query = `select ConsultantID as ID,ConsultantReference as Reference,ConsultantName as Name,ConsultantAddedBy as AddedBy,ConsultantAddedOn as AddedOn,ConsultantHeadOfficeAdress as HeadOfficeAdress,HeadOfficeLocation as HeadOfficeLocation,
                          ConsultantTel as Tel,ConsultantFax as Fax,ConsultantWebsite as Website,CompanyMail,TotalPOsAmountUSD,ConsultantGrade as Grade,ConsultantType as Type
            from consultant_main_table,general_consultant_type ,(select max(ConsultantID) as ID
                                                                from consultant_main_table
                                                                group by ConsultantReference) as maxTable
            where ConsultantReference='` + req.query.ref + `'
            &&  maxTable.ID = consultant_main_table.ConsultantID
            && consultant_main_table.ConsultantTypeID=general_consultant_type.ConsultantTypeID`;

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {
                var consultant = rows;
                query = `select CountryName
                      from general_country
                      where CountryID in (select CountryCode
                                          from consultant_country
                                          where ConsultantID = (select MAX(ConsultantID)
                                                            from consultant_main_table
                                                            where ConsultantReference='${req.query.ref}'
                                                            group by ConsultantReference
                                                            )
                                          )`

                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json(err);
                  } else {
                    if (!rows[0]) {
                      rows[0] = {
                        CountryName: null
                      }
                    }
                    if (!rows[1]) {
                      rows[1] = {
                        CountryName: null
                      }
                    }
                    if (!rows[2]) {
                      rows[2] = {
                        CountryName: null
                      }
                    }
                    consultant = [...consultant, ...rows];
                    query = `select ContactPersonName,ContactPersonPosition,ContactPersonMail,ContactPersonTel1,ContactPersonTel2,ContactPersonStatus
                          from consultant_contact_person
                          where ConsultantId=(select max(ConsultantId)
                                from consultant_main_table
                                where ConsultantReference='${req.query.ref}'
                                group by ConsultantReference)`

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);
                        res.status(500).json(err);
                      } else {

                        consultant = [...consultant, {
                          contactPersons: rows
                        }];

                        connection.release();
                        res.status(200).json(consultant);
                      }
                    })
                  }
                })
              }
            })
          }
        }
      });
    }
  })
})


app.get('/clientList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // query=`select Client_Ref,Client_Name,Client_Type,Client_Grade
      // from clients `;
      query = `select ClientReference as Reference,ClientName as Name,ClientType as Type,ClientGrade as Grade
      from client_main_table,general_client_type,(select max(ClientID) as ID
                                                  from client_main_table
                                                  group by ClientReference) as maxTable
      where client_main_table.ClientTypeID=general_client_type.ClientTypeID
            && maxTable.ID = client_main_table.ClientID`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          var clientConsultants = rows;
          query = `select ConsultantReference as Reference,ConsultantName as Name,ConsultantType as Type,ConsultantGrade as Grade
              from consultant_main_table,general_consultant_type,(select max(ConsultantID) as ID
                                                                from consultant_main_table
                                                                group by ConsultantReference) as maxTable
              where consultant_main_table.ConsultantTypeID=general_consultant_type.ConsultantTypeID
                  && maxTable.ID = consultant_main_table.ConsultantID`
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              clientConsultants = [...clientConsultants, ...rows];

              connection.release();
              res.status(200).json(clientConsultants);
            }
          })
        }
      });
    }
  });
});

app.get('/general/client/chartGrades', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ClientGrade as name, count(ClientGrade) as value
        from client_main_table,(select max(ClientID) as ID
                                from client_main_table
                                group by ClientReference) as maxTable
        where client_main_table.ClientID=maxTable.ID
        group by ClientGrade `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          var grades = rows
          query = `select ConsultantGrade as name, count(ConsultantGrade) as value
                from consultant_main_table,(select max(ConsultantID) as ID
                                            from consultant_main_table
                                            group by ConsultantReference) as maxTable
                where consultant_main_table.ConsultantID=maxTable.ID
                group by ConsultantGrade `;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              var exist;
              if (grades.length > 0) {
                for (let [keyRow, valueRow] of Object.entries(rows)) {
                  exist = false;
                  for (let [keyGrade, valueGrade] of Object.entries(grades)) {
                    if (keyGrade == keyRow) {
                      valueGrade += valueRow;
                      exist = true;
                    }
                  }
                  if (!exist) {
                    grades = [...grades, {
                      keyRow: valueRow
                    }]
                  }
                }
              } else {
                grades = [...grades, ...rows]
              }


              connection.release();
              res.status(200).json(grades);
            }

          });
        }
      });
    }
  });
});
///////////////////////////////// consultant type list //////////////////////////////////////////////
app.get('/general/client/consultanttypeList', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ConsultantTypeID as No,ConsultantType as Client_Type
            from general_consultant_type`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});



////////////////////////////////////country list client ///////////////////////////////////
app.get('/general/client/countrylist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select CountryName
        from general_country`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/general/client/typeList', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ClientTypeID as No,ClientType as Client_Type
          from general_client_type`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          var typeList = rows;
          query = `select ConsultantTypeID as No,ConsultantType as Client_Type
          from general_consultant_type`;
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              typeList = [...typeList, ...rows]
              connection.release();
              res.status(200).json(typeList);
            }
          });
        }
      });
    }
  })
});
app.get('/general/client/gradeList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Client_Grade from
    gnrl_client_grade`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.delete('/general/client/delete/:no', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      if (req.query.type == 'Local Consultant' || req.query.type == 'International Consultant') {
        query = `select ConsultantReference
            from consultant_main_table
            where ConsultantID=${req.params.no}`
        connection.query(query, (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.status(500).json(err);
          } else {

            ref = rows[0].ConsultantReference;
            query = `delete from consultant_contact_person
            where ConsultantID in (select ConsultantID
                              from consultant_main_table
                              where ConsultantReference='${ref}')`;

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {
                query = `delete from  consultant_country
                where ConsultantID in (select ConsultantID
                                  from consultant_main_table
                                  where ConsultantReference='${ref}')`;
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json(err);
                  } else {
                    query = `delete from  consultant_data_update
                    where ConsultantID in (select ConsultantID
                                      from Consultant_Main_Table
                                      where ConsultantReference=(select ConsultantReference
                                                            from consultant_main_table
                                                            where ConsultantID=` + req.params.no + `)
                                      )`;

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);
                        res.status(500).json(err);
                      } else {
                        query = `select ConsultantID
                          from consultant_main_table
                          where ConsultantReference='${ref}'`
                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json(err)
                          } else {
                            query = `delete from consultant_main_table
                            where ConsultantID in (`;
                            for (let row of rows) {
                              query += `${row.ConsultantID},`
                            }
                            if (query[query.length - 1] == ',') {
                              query = query.substring(0, query.length - 1);
                            }
                            query += ')';

                            connection.query(query, (err, rows, fields) => {
                              if (err) {
                                console.log(err);
                                res.status(500).json(err);
                              } else {
                                connection.release();
                                res.status(200).json({
                                  deleted: true
                                });
                              }
                            })
                          }
                        })

                      }
                    })
                  }
                })
              }
            });
          }
        })
      } else {
        query = `select ClientReference
            from client_main_table
            where ClientID=${req.params.no}`
        connection.query(query, (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.status(500).json(err);
          } else {

            ref = rows[0].ClientReference;
            query = `delete from client_contact_person
            where ClientID in (select ClientID
                              from client_main_table
                              where ClientReference='${ref}')`;

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {
                query = `delete from  client_country
                where ClientID in (select ClientID
                                  from client_main_table
                                  where ClientReference='${ref}')`;
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);
                    res.status(500).json(err);
                  } else {
                    query = `delete from  client_data_update
                    where ClientID in (select ClientID
                                      from client_main_table
                                      where ClientReference=(select ClientReference
                                                            from client_main_table
                                                            where ClientID=` + req.params.no + `)
                                      )`;

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);
                        res.status(500).json(err);
                      } else {
                        query = `select ClientID
                          from client_main_table
                          where ClientReference='${ref}'`
                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json(err)
                          } else {
                            query = `delete from client_main_table
                            where ClientID in (`;
                            for (let row of rows) {
                              query += `${row.ClientID},`
                            }
                            if (query[query.length - 1] == ',') {
                              query = query.substring(0, query.length - 1);
                            }
                            query += ')';

                            connection.query(query, (err, rows, fields) => {
                              if (err) {
                                console.log(err);
                                res.status(500).json(err);
                              } else {
                                connection.release();
                                res.status(200).json({
                                  deleted: true
                                });
                              }
                            })
                          }
                        })

                      }
                    })
                  }
                })
              }
            });
          }
        })
      }


    }
  });
});

app.get('/general/client/chartTypes', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ClientType as name, count(ClientType) as value
            from client_main_table,general_client_type,(select max(ClientID) as ID
                                                        from client_main_table
                                                        group by ClientReference) as maxTable
            where client_main_table.ClientTypeID=general_client_type.ClientTypeID
            && client_main_table.ClientID=maxTable.ID
            group by ClientType`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          var types = rows;
          query = `select ConsultantType as name, count(ConsultantType) as value
          from consultant_main_table,general_consultant_type,(select max(ConsultantID) as ID
                                                              from consultant_main_table
                                                              group by ConsultantReference) as maxTable
          where consultant_main_table.ConsultantTypeID=general_consultant_type.ConsultantTypeID
          && consultant_main_table.ConsultantID=maxTable.ID
          group by ConsultantType`;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              types = [...types, ...rows]
              connection.release();
              res.status(200).json(types);
            }
          });
        }
      })
    }
  });
});

app.post('/general/client/createClient', ensureToken, (req, res) => {
  let email = jwt.decode(req.query.authentification).data;

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      /*****************************************************************
       * Insert into Consultant/Client_Main_Table
       * **** */
      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
        query = `INSERT INTO consultant_main_table
      ( ConsultantGrade,ConsultantName, ConsultantTypeID, ConsultantAddedOn,
        ConsultantAddedBy, ConsultantHeadOfficeAdress,
        ConsultantTel, ConsultantFax, HeadOfficeLocation, CompanyMail,
        ConsultantWebsite`
      } else {
        query = `INSERT INTO client_main_table
      ( ClientGrade,ClientName, ClientTypeID, ClientAddedOn,
        ClientAddedBy, ClientHeadOfficeAdress,
        ClientTel, ClientFax, HeadOfficeLocation, CompanyMail,
        ClientWebsite`

      }
      query += ')VALUES';
      query += `('${req.body.grade}','` + req.body.name + `', (select `;
      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
        query += `ConsultantTypeID from general_consultant_type where ConsultantType`
      } else {
        query += `ClientTypeID from general_client_type where ClientType`
      }
      query += `='${req.body.type}'), CURRENT_TIMESTAMP, (select EmployeeName
                                                                  from hr_employee_general_data
                                                                  where ProfessionalMail='` + email + `'),

    '` + req.body.officeAdress + `', '` + req.body.officeTel + `', '` + req.body.officeFax + `', '` + req.body.officeLocation + `',
    '` + req.body.officeMail + `', '` + req.body.companyWebsite + `')`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          /*****************************************************************
           * update the Consultant/Client_Main_Table
           * **** */
          if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
            query = `update consultant_main_table set ConsultantReference = concat_ws('',
          'CS/',
          Extract(YEAR from CURRENT_TIMESTAMP) ,
          '/',
          Extract(MONTH from CURRENT_TIMESTAMP),
          '/',
          ` + rows.insertId + `)
          where ConsultantID=` + rows.insertId
          } else {
            query = `update client_main_table set ClientReference = concat_ws('',
          'CL/',
          Extract(YEAR from CURRENT_TIMESTAMP) ,
          '/',
          Extract(MONTH from CURRENT_TIMESTAMP),
          '/',
          ` + rows.insertId + `)
          where ClientID=` + rows.insertId

          }
          var id = rows.insertId;
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
            } else {
              if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                query = `insert into consultant_country
              (ConsultantID,CountryCode)
              values(
                ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country1 + `')
              )`
                if (req.body.country2) {
                  query += `,(
                  ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country2 + `')
                )`
                }

                if (req.body.country3) {
                  query += `,(
                  ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country3 + `')
                )`
                }

              } else {

                query = `insert into client_country
                (ClientID,CountryCode)
                values(
                  ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country1 + `')
                )`
                if (req.body.country2) {
                  query += `,(
                    ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country2 + `')
                  )`
                }

                if (req.body.country3) {
                  query += `,(
                    ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country3 + `')
                  )`
                }
              }
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  /*****************************************************************
                   * Insert into Contact Person
                   * **** */
                  if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                    query = `insert into consultant_contact_person
                  ( ConsultantID,ContactPersonName,ContactPersonPosition,
                    ContactPersonMail,ContactPersonTel1,ContactPersonTel2
                  )`


                  } else {
                    query = `insert into client_contact_person
                  (ClientID,ContactPersonName,ContactPersonPosition,
                    ContactPersonMail,ContactPersonTel1,ContactPersonTel2
                    )`
                  }
                  query += `values(
                  ` + id + `,'` + req.body.contactPersons[0].contactPersonName + `', '` + req.body.contactPersons[0].contactPersonPos + `',
                  '` + req.body.contactPersons[0].contactPersonMail + `','` + req.body.contactPersons[0].contactPersonPhone1 + `','` + req.body.contactPersons[0].contactPersonPhone2 + `'
                )`

                  for (var i = 1; i < req.body.contactPersons.length; i++) {
                    query += `,(
                    ` + id + `,'` + req.body.contactPersons[i].contactPersonName + `', '` + req.body.contactPersons[i].contactPersonPos + `',
                    '` + req.body.contactPersons[i].contactPersonMail + `','` + req.body.contactPersons[i].contactPersonPhone1 + `','` + req.body.contactPersons[i].contactPersonPhone2 + `'
                  )`
                  }
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      /*****************************************************************
                       * Insert into Update Client Consultant
                       * **** */
                      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                        query = `insert into consultant_data_update
                        (ConsultantID,ConsultantUpdatedBy,ConsultantUpdatedOn)
                        values
                        (${id},(select EmployeeID from hr_employee_general_data where ProfessionalMail='${email}'),current_timestamp)`
                      } else {
                        query = `insert into client_data_update
                        (ClientID,ClientUpdateBy,ClientUpdateOn)
                        values
                        (${id},(select EmployeeID from hr_employee_general_data where ProfessionalMail='${email}'),current_timestamp)`
                      }
                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {
                          connection.release();
                          res.status(200).json({
                            created: true
                          });
                        }
                      })
                    }
                  })
                }
              })
            }
          });
        }
      });
    }
  });
});





///////////////////////////////////////////////modify client //////////////////////////////////////////////
app.post('/general/client/modifyClient', ensureToken, (req, res) => {
  let email = jwt.decode(req.query.authentification).data;

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      /*****************************************************************
       * Insert into Consultant/Client_Main_Table
       * **** */

      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
        query = `INSERT INTO consultant_main_table
      ( ConsultantGrade,ConsultantName, ConsultantTypeID, ConsultantAddedOn,
        ConsultantAddedBy, ConsultantHeadOfficeAdress,
        ConsultantTel, ConsultantFax, HeadOfficeLocation, CompanyMail,
        ConsultantWebsite`
      } else {
        query = `INSERT INTO client_main_table
      ( ClientGrade,ClientName, ClientTypeID, ClientAddedOn,
        ClientAddedBy, ClientHeadOfficeAdress,
        ClientTel, ClientFax, HeadOfficeLocation, CompanyMail,
        ClientWebsite`

      }

      query += ')VALUES';
      query += `('${req.body.grade}','` + req.body.name + `', (select `;
      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
        query += `ConsultantTypeID from general_consultant_type where ConsultantType`
      } else {
        query += `ClientTypeID from general_client_type where ClientType`
      }
      query += `='${req.body.type}'), CURRENT_TIMESTAMP, (select EmployeeName
                                                      from hr_employee_general_data
                                                      where ProfessionalMail='` + email + `'),

    '` + req.body.officeAdress + `', '` + req.body.officeTel + `', '` + req.body.officeFax + `', '` + req.body.officeLocation + `',
    '` + req.body.officeMail + `', '` + req.body.companyWebsite + `')`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          var id = rows.insertId;
          if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
            query = `select ConsultantReference
                from consultant_main_table
                where ConsultantID=${req.body.no}`
          } else {
            query = `select ClientReference
          from client_main_table
          where ClientID=${req.body.no}`
          }
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              /*****************************************************************
               * update the Consultant/Client_Main_Table
               * **** */
              if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                query = `update consultant_main_table set
              ConsultantReference = '${rows[0].ConsultantReference}'
              where ConsultantID=` + id
              } else {
                query = `update client_main_table set
              ClientReference ='${rows[0].ClientReference}'
              where ClientID=` + id

              }

              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                } else {
                  if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                    query = `insert into consultant_country
                  (ConsultantID,CountryCode)
                  values(
                    ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country1 + `')
                  )`
                    if (req.body.country2) {
                      query += `,(
                      ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country2 + `')
                    )`
                    }

                    if (req.body.country3) {
                      query += `,(
                      ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country3 + `')
                    )`
                    }

                  } else {

                    query = `insert into client_country
                    (ClientID,CountryCode)
                    values(
                      ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country1 + `')
                    )`
                    if (req.body.country2) {
                      query += `,(
                        ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country2 + `')
                      )`
                    }

                    if (req.body.country3) {
                      query += `,(
                        ` + id + `,(select CountryID from general_country where CountryName='` + req.body.country3 + `')
                      )`
                    }
                  }
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      /*****************************************************************
                       * Insert into Contact Person
                       * **** */
                      if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                        query = `insert into consultant_contact_person
                      (ConsultantID,ContactPersonName,ContactPersonPosition,
                        ContactPersonMail,ContactPersonTel1,ContactPersonTel2
                        )`


                      } else {
                        query = `insert into client_contact_person
                      (ClientID,ContactPersonName,ContactPersonPosition,
                        ContactPersonMail,ContactPersonTel1,ContactPersonTel2
                        )`
                      }

                      query += `values(
                      ` + id + `,'` + req.body.contactPersons[0].contactPersonName + `', '` + req.body.contactPersons[0].contactPersonPos + `',
                      '` + req.body.contactPersons[0].contactPersonMail + `','` + req.body.contactPersons[0].contactPersonPhone1 + `','` + req.body.contactPersons[0].contactPersonPhone2 + `'
                    )`

                      for (var i = 1; i < req.body.contactPersons.length; i++) {
                        query += `,(
                        ` + id + `,'` + req.body.contactPersons[i].contactPersonName + `', '` + req.body.contactPersons[i].contactPersonPos + `',
                        '` + req.body.contactPersons[i].contactPersonMail + `','` + req.body.contactPersons[i].contactPersonPhone1 + `','` + req.body.contactPersons[i].contactPersonPhone2 + `'
                      )`
                      }

                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {
                          /*****************************************************************
                           * Insert into Update Client Consultant
                           * **** */
                          if (req.body.type == 'Local Consultant' || req.body.type == 'International Consultant') {
                            query = `insert into consultant_data_update
                            (ConsultantID,ConsultantUpdatedBy,ConsultantUpdatedOn)
                            values
                            (${id},(select employeeID from hr_employee_general_data where ProfessionalMail='${email}'),current_timestamp)`
                          } else {
                            query = `insert into client_data_update
                            (ClientID,ClientUpdateBy,ClientUpdateOn)
                            values
                            (${id},(select EmployeeID from hr_employee_general_data where ProfessionalMail='${email}'),current_timestamp)`
                          }
                          connection.query(query, (err, rows, fields) => {
                            if (err) {
                              console.log(err);
                              res.status(500).json(err);
                            } else {
                              connection.release();
                              res.status(200).json({
                                modified: true
                              });
                            }
                          })
                        }
                      })
                    }
                  })
                }
              });
            }
          })

        }
      });
    }

  });
});
/****************************************************************************************************************
 * **********************************************************************************************************************
 * **********TASK PLANNER *************************************************************************
 * *******************************************************************************************************************.*
 * ************************************************************************************************************/

app.get("/tasksdashboard/taskplanner/dsfref", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Reference
          from sales_dsf_main_table as dsf1,(select No,Max(DSF_Added_on) as DSF_Added_on
                                            from sales_dsf_main_table
                                            group by No)as dsf2
          where dsf1.No=dsf2.No
          && dsf1.DSF_Added_on=dsf2.DSF_Added_on`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/psfref", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select File_Ref from sales_psf`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/csfref", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select File_Ref from sales_csf`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/ssfref", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select File_Ref from sales_ssf`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});


app.get("/tasksdashboard/taskplanner/filetypelist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select File_Type from gnrl_task_file_type`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/departmentlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Dep_Title
          from departments`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/divisionlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Div1_Title,Div1_Title,Div2_Title,Div3_Title,Div4_Title,
                Div5_Title,Div6_Title,Div7_Title,Div8_Title,Div9_Title ,Div10_Title
          from departments
          where Dep_Title = '` + req.query.department + `'`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
          console.log(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});

app.get("/tasksdashboard/taskplanner/employeeslist", (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      email = jwt.decode(req.query.authentification).data;
      query = `select Concat_ws(' ',Employee_First_Name,Employee_Last_Name) Actual_Emp_Name,Employee_Code,Position
          from hr_emp_gnd
          where Department = '` + req.query.department + `'
          && Division='` + req.query.division + `'
          && Position in (select Position
            from    (select * from hr_emp_gnd
                    order by Manager_Position, Employee_No) products_sorted,
                    (select @pv := (select Employee_No
                                    from hr_emp_gnd
                                    where Professional_mail='` + email + `')
                    ) initialisation
            where   find_in_set(Manager_Position, @pv)
            and     length(@pv := concat(@pv, ',', Employee_No))
            )`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
          console.log(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      })
    }
  });
});


app.post("/tasksdashboard/taskplanner/createTask", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      date = req.body.deadline.split("T");
      deadline = date[0].concat(" ", date[1].split('Z')[0]);

      query = `INSERT INTO act_dashboard
          ( Action_Type, File_Type, File_Ref, Required_Action,
          Responsible_Department, Responsible_Division,
          Action_Status, Action_Closed_On, Action_Deadline, Action_Delay
    `;
      if (req.body.position) {
        query += ",Responsible_Position,Responsible_Code,Responsible_Name"
      }
      if (req.body.codeName) {
        query += ",Responsible_Position,Responsible_Code,Responsible_Name"
      }

      query += `)
          VALUES
          ( 'Scheduled', '` + req.body.fileType + `', '` + req.body.fileRef + `', '` + req.body.requiredAction + `',
          '` + req.body.department + `', '` + req.body.division + `', 'On Going', '2000-01-01 00:00:00.000000',
          '` + deadline + `', DATEDIFF(Current_Date,'` + req.body.deadline.split("T")[0] + `')`;
      if (req.body.position) {
        query += `,'` + req.body.position + `',(select Employee_Code from hr_emp_gnd where Position='` + req.body.position + `'),
      (select Concat_ws(' ',Employee_First_Name,Employee_Last_Name) from hr_emp_gnd where Position='` + req.body.position + `')`
      }
      if (req.body.codeName) {
        query += `,(select Position from hr_emp_gnd where Employee_Code='` + req.body.codeName.Employee_Code + `'),'` + req.body.codeName.Employee_Code + `',
      '` + req.body.codeName.Actual_Emp_Name + `'`;
      }
      query += ");"
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            created: true
          });
        }
      });
    }
  });
});

/****************************************************************************************************************
 * **********************************************************************************************************************
 * **********TASK Dashboard *************************************************************************
 * *******************************************************************************************************************.*
 * ************************************************************************************************************/

app.get('/tasksdashboard/taskdashboard/tasklist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      var email = jwt.decode(req.query.authentification).data;

      query = `select Required_Action,Responsible_Name,Action_Deadline,File_Ref,
                Action_Status,Action_Closed_On,Action_Type,No
          from act_dashboard
          where  Responsible_Position =(select Position
                                          from hr_emp_gnd
                                          where Professional_mail='` + email + `')
          || Responsible_Position in (select Position
                                          from    (select * from hr_emp_gnd
                                                  order by Manager_Position, Employee_No) products_sorted,
                                                  (select @pv := (select Employee_No
                                                                  from hr_emp_gnd
                                                                  where Professional_mail='` + email + `')
                                                  ) initialisation
                                          where   find_in_set(Manager_Position, @pv)
                                          and     length(@pv := concat(@pv, ',', Employee_No))
                                          )

          order By No desc`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/tasksdashboard/taskdashboard/tasksStatus', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Action_Status as name, count(Action_Status) as value from
    act_dashboard
    group by Action_Status `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/tasksdashboard/taskdashboard/showtask', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select * from
        act_dashboard
        where No='` + req.query.no + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows[0]);
        }
      });
    }
  });

});
app.put("/tasksdashboard/taskdashboard/updatestatus", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `update act_dashboard
    set Action_Status='` + req.body.status + `'
    where No=` + req.body.no;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            updated: true
          })
        }
      })
    }
  });
});

app.delete('/tasksdashboard/taskdashboard/delete/:no', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `delete from act_dashboard
        where No='` + req.params.no + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            deleted: true
          });
        }
      });
    }
  });
});

/*************************************************************************************************************
 * **********************************************************************************************************
 * ************************************************Sales
 ***************************************************************************************************
 ***************************************************************************************************************/

/*************************************************************************************************
 * ************************************************Sales Files
 **************************************************************************************************/

/*************************************************************************************************
 * ************************************************Direct Sales File
 **************************************************************************************************/

/*************************************************************************************************
 * ************************************************Add new DSF
 **************************************************************************************************/

app.get('/sales/salesfiles/directsalesfile/addnewdsf/salespositions', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      var email = jwt.decode(req.query.authentification).data;
      query = `select Position_ID,Position_Description from hr_title_table`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});


app.get('/sales/salesfiles/directsalesfile/addnewdsf/employeeslist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select EmployeeID,EmployeeName from hr_employee_general_data
      where Actual_Position_ID=${req.query.position}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/salesrequirements', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Design_Requirement
    from general_design_requirement`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/inquiryreceivedby', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Enquiry_Received_By
    from general_enquiry_received_by`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

/************************Participant 1 */

app.get('/sales/salesfiles/directsalesfile/addnewdsf/participant1positions', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Position_ID,Position_Description from hr_title_table`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/participant1employeeslist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select EmployeeID,EmployeeName from hr_employee_general_data
      where Actual_Position_ID=${req.query.position}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

/************************Participant 2 */

app.get('/sales/salesfiles/directsalesfile/addnewdsf/participant2positions', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Position_ID,Position_Description from hr_title_table`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/participant2employeeslist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select EmployeeID,EmployeeName from hr_employee_general_data
      where Actual_Position_ID=${req.query.position}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/******************************************
 * *********************Client
 ******************************************/
app.get('/sales/salesfiles/directsalesfile/addnewdsf/clientlist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ClientID,ClientName
        from client_main_table `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/consultantlist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ConsultantID,ConsultantName
        from consultant_main_table
       `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
          console.log(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/contactList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ContactPersonID,ContactPersonName,ContactPersonPosition,ContactPersonMail,ContactPersonTel1,
    ContactPersonTel2,ContactPersonStatus
        from client_contact_person
        where ClientID='${req.query.client}'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/directsalesfile/addnewdsf/consultantcontactperson', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ContactPersonID,ContactPersonName,ContactPersonPosition,ContactPersonMail,ContactPersonTel1,
    ContactPersonTel2,ContactPersonStatus
        from consultant_contact_person
        where ConsultantID='${req.query.consultant}'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/******************************************
 * *********************Project Informations
 ******************************************/

app.get('/sales/salesfiles/directsalesfile/addnewdsf/projectbuildingtypes', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Building_Type_ID,Building_Type
        from general_building_type `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/addnewdsf/createdsf", ensureToken, upload.single('file'), (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;
      date = form['deadline'].split("T");
      deadline = date[0].concat(" ", (date[1].split('Z')[0]).split('.')[0]);
      query = `INSERT INTO sales_dsf_main_table
        (
        DSF_Added_on, DSF_Design_Requirements,DSF_Inquiry_Received_By,
        DSF_Project_Type,DSF_Added_By_ID, DSF_Incharge_ID,
        DSF_Client_ID, DSF_Consultant_ID,DSF_Project_Owner, Comment,DSF_Deadline)

        VALUES

        (CURRENT_TIMESTAMP, '` + form['designRequirement'] + `','` + form['inquiryReceivedBy'] + `',
        '` + form['projectType'] + `',(select EmployeeID from hr_employee_general_data where ProfessionalMail='` + email + `'),` + form['salesFileParticipant1Name'] + `,
        ` + form['client'] + `,` + form['consultant'] + `,'` + form['projectOwner'] + `','-','${deadline}');`


      connection.query(query, function (err, rows, fields) {
        if (err) {
          console.log(err);
          res.status(500).json({
            inserted: false
          });
        } else {
          id = rows.insertId;
          query = `INSERT INTO dfs_client_contact_person(DSF_ID,Contact_Person_ID)
          VALUES
          (${id},` + form['salesFileClient1Name'] + `)`
          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `INSERT INTO dfs_consultant_contact_person(DSF_ID,Contact_Person_ID)
                    VALUES
                    (${id},` + form['salesFileConsultant1Name'] + `)`
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json({
                    select: false
                  });
                } else {
                  query = `INSERT INTO dsf_project_buildings(DSF_ID,Building_Type_ID,Built-up-Area-m2 )
                        VALUES
                        (${id},` + form['projectBuildingType'] + `,` + form['totalBuiltupArea'] + `)`
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      res.status(500).json({
                        select: false
                      });
                    } else {
                      query = `INSERT INTO dsf_project_locations(DSF_ID,Project_Location )
                      VALUES
                      (${id},'` + form['lon'] + `')`
                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          res.status(500).json({
                            select: false
                          });
                        } else {
                          if (form['designRequirement'] == "Detailed Design Required" || form['designRequirement'] == "Ratio Based Design Required") {
                            if (form['salesFileParticipant1Role1'] != "No Participant" && form['salesFileParticipant1Role2'] == "No Participant" && form['salesFileParticipant1Role3'] == "No Participant") {
                              query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                        VALUES
                        (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role1'] + `','` + form['SP1deadlineRole1'].split("T")[0] + `')`
                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  res.status(500).json({
                                    select: false
                                  });
                                } else {
                                  /////////////////////////////////////////// participant 2 start ///////////////////////////////
                                  if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                    form['salesFileParticipant2Role3'] == "No Participant") {
                                    query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                  VALUES
                                  (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                  ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                    connection.query(query, (err, rows, fields) => {
                                      if (err) {
                                        res.status(500).json({
                                          select: false
                                        });
                                      } else {
                                        query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                  VALUES
                                  (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                  ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                        connection.query(query, (err, rows, fields) => {
                                          if (err) {
                                            res.status(500).json({
                                              select: false
                                            });
                                          } else {
                                            /******************************************************************************
                                             * Move the file from the upload folder to the new prefile folder
                                             */
                                            try {
                                              fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                              connection.release();
                                              res.status(200).json({
                                                moved: true,
                                                id: id
                                              });
                                            } catch (err) {
                                              console.log(err);
                                              res.status(500).json({
                                                moved: false
                                              });
                                            }
                                          }
                                        });

                                      }
                                    });
                                  }
                                  if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] == "No Participant" &&
                                    form['salesFileParticipant2Role3'] == "No Participant") {
                                    query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                              VALUES
                              (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                              ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                    connection.query(query, (err, rows, fields) => {
                                      if (err) {
                                        res.status(500).json({
                                          select: false
                                        });
                                      } else {
                                        /******************************************************************************
                                         * Move the file from the upload folder to the new prefile folder
                                         */
                                        try {
                                          fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                            './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                          connection.release();
                                          res.status(200).json({
                                            moved: true,
                                            id: id
                                          });
                                        } catch (err) {
                                          console.log(err);
                                          res.status(500).json({
                                            moved: false
                                          });
                                        }
                                      }
                                    });

                                  }
                                  if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                    form['salesFileParticipant2Role3'] != "No Participant") {
                                    query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                  VALUES
                                  (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                  ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                    connection.query(query, (err, rows, fields) => {
                                      if (err) {
                                        res.status(500).json({
                                          select: false
                                        });
                                      } else {
                                        query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                      VALUES
                                      (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                      ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                        connection.query(query, (err, rows, fields) => {
                                          if (err) {
                                            res.status(500).json({
                                              select: false
                                            });
                                          } else {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                            VALUES
                                            (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role3'] + `'
                                            ,'` + form['SP2deadlineRole3'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                /******************************************************************************
                                                 * Move the file from the upload folder to the new prefile folder
                                                 */
                                                try {
                                                  fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                    './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                  connection.release();
                                                  res.status(200).json({
                                                    moved: true,
                                                    id: id
                                                  });
                                                } catch (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    moved: false
                                                  });
                                                }
                                              }
                                            });

                                          }
                                        });

                                      }
                                    });

                                  }
                                  /////////////////////////////////////////// participant 2 end ///////////////////////////////
                                }
                              });
                            }
                            if (form['salesFileParticipant1Role1'] != "No Participant" && form['salesFileParticipant1Role2'] != "No Participant" &&
                              form['salesFileParticipant1Role3'] == "No Participant") {
                              query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                      VALUES
                      (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role1'] + `'
                      ,'` + form['SP1deadlineRole1'].split("T")[0] + `')`
                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  res.status(500).json({
                                    select: false
                                  });
                                } else {
                                  query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                  VALUES
                                  (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role2'] + `'
                                  ,'` + form['SP1deadlineRole2'].split("T")[0] + `')`
                                  connection.query(query, (err, rows, fields) => {
                                    if (err) {
                                      res.status(500).json({
                                        select: false
                                      });
                                    } else {
                                      /////////////////////////////////////////// participant 2 start ///////////////////////////////
                                      if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                        form['salesFileParticipant2Role3'] == "No Participant") {
                                        query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                      VALUES
                                                      (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                                      ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                        connection.query(query, (err, rows, fields) => {
                                          if (err) {
                                            res.status(500).json({
                                              select: false
                                            });
                                          } else {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                      VALUES
                                                      (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                                      ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                /******************************************************************************
                                                 * Move the file from the upload folder to the new prefile folder
                                                 */
                                                try {
                                                  fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                    './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                  connection.release();
                                                  res.status(200).json({
                                                    moved: true,
                                                    id: id
                                                  });
                                                } catch (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    moved: false
                                                  });
                                                }
                                              }
                                            });

                                          }
                                        });
                                      }
                                      if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] == "No Participant" &&
                                        form['salesFileParticipant2Role3'] == "No Participant") {
                                        query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                  VALUES
                                                  (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                                  ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                        connection.query(query, (err, rows, fields) => {
                                          if (err) {
                                            res.status(500).json({
                                              select: false
                                            });
                                          } else {
                                            /******************************************************************************
                                             * Move the file from the upload folder to the new prefile folder
                                             */
                                            try {
                                              fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                              connection.release();
                                              res.status(200).json({
                                                moved: true,
                                                id: id
                                              });
                                            } catch (err) {
                                              console.log(err);
                                              res.status(500).json({
                                                moved: false
                                              });
                                            }
                                          }
                                        });

                                      }
                                      if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                        form['salesFileParticipant2Role3'] != "No Participant") {
                                        query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                      VALUES
                                                      (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                                      ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                        connection.query(query, (err, rows, fields) => {
                                          if (err) {
                                            res.status(500).json({
                                              select: false
                                            });
                                          } else {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                          VALUES
                                                          (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                                          ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                                VALUES
                                                                (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role3'] + `'
                                                                ,'` + form['SP2deadlineRole3'].split("T")[0] + `')`
                                                connection.query(query, (err, rows, fields) => {
                                                  if (err) {
                                                    res.status(500).json({
                                                      select: false
                                                    });
                                                  } else {
                                                    /******************************************************************************
                                                     * Move the file from the upload folder to the new prefile folder
                                                     */
                                                    try {
                                                      fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                        './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                      connection.release();
                                                      res.status(200).json({
                                                        moved: true,
                                                        id: id
                                                      });
                                                    } catch (err) {
                                                      console.log(err);
                                                      res.status(500).json({
                                                        moved: false
                                                      });
                                                    }
                                                  }
                                                });

                                              }
                                            });

                                          }
                                        });

                                      }
                                      /////////////////////////////////////////// participant 2 end ///////////////////////////////
                                    }
                                  });

                                }

                              });
                            }
                            if (form['salesFileParticipant1Role1'] != "No Participant" && form['salesFileParticipant1Role2'] != "No Participant" &&
                              form['salesFileParticipant1Role3'] != "No Participant") {
                              query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                      VALUES
                      (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role1'] + `'
                      ,'` + form['SP1deadlineRole1'].split("T")[0] + `')`
                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  res.status(500).json({
                                    select: false
                                  });
                                } else {
                                  query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                              VALUES
                              (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role2'] + `'
                              ,'` + form['SP1deadlineRole2'].split("T")[0] + `')`
                                  connection.query(query, (err, rows, fields) => {
                                    if (err) {
                                      res.status(500).json({
                                        select: false
                                      });
                                    } else {
                                      query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                    VALUES
                                    (${id},` + form['salesFileParticipant1Code'] + `,'` + form['salesFileParticipant1Role3'] + `'
                                    ,'` + form['SP1deadlineRole3'].split("T")[0] + `')`
                                      connection.query(query, (err, rows, fields) => {
                                        if (err) {
                                          res.status(500).json({
                                            select: false
                                          });
                                        } else {
                                          /////////////////////////////////////////// participant 2 start ///////////////////////////////
                                          if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                            form['salesFileParticipant2Role3'] == "No Participant") {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                          VALUES
                                          (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                          ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                          VALUES
                                          (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                          ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                                connection.query(query, (err, rows, fields) => {
                                                  if (err) {
                                                    res.status(500).json({
                                                      select: false
                                                    });
                                                  } else {
                                                    /******************************************************************************
                                                     * Move the file from the upload folder to the new prefile folder
                                                     */
                                                    try {
                                                      fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                        './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                      connection.release();
                                                      res.status(200).json({
                                                        moved: true,
                                                        id: id
                                                      });
                                                    } catch (err) {
                                                      console.log(err);
                                                      res.status(500).json({
                                                        moved: false
                                                      });
                                                    }
                                                  }
                                                });

                                              }
                                            });
                                          }
                                          if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] == "No Participant" &&
                                            form['salesFileParticipant2Role3'] == "No Participant") {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                      VALUES
                                      (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                      ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                /******************************************************************************
                                                 * Move the file from the upload folder to the new prefile folder
                                                 */
                                                try {
                                                  fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                    './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                  connection.release();
                                                  res.status(200).json({
                                                    moved: true,
                                                    id: id
                                                  });
                                                } catch (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    moved: false
                                                  });
                                                }
                                              }
                                            });

                                          }
                                          if (form['salesFileParticipant2Role1'] != "No Participant" && form['salesFileParticipant2Role2'] != "No Participant" &&
                                            form['salesFileParticipant2Role3'] != "No Participant") {
                                            query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                          VALUES
                                          (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role1'] + `'
                                          ,'` + form['SP2deadlineRole1'].split("T")[0] + `')`
                                            connection.query(query, (err, rows, fields) => {
                                              if (err) {
                                                res.status(500).json({
                                                  select: false
                                                });
                                              } else {
                                                query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                              VALUES
                                              (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role2'] + `'
                                              ,'` + form['SP2deadlineRole2'].split("T")[0] + `')`
                                                connection.query(query, (err, rows, fields) => {
                                                  if (err) {
                                                    res.status(500).json({
                                                      select: false
                                                    });
                                                  } else {
                                                    query = `INSERT INTO dsf_participants_task(DSF_ID,DSF_Participant_ID,Task_Description,Task_Deadline )
                                                    VALUES
                                                    (${id},` + form['salesFileParticipant2Code'] + `,'` + form['salesFileParticipant2Role3'] + `'
                                                    ,'` + form['SP2deadlineRole3'].split("T")[0] + `')`
                                                    connection.query(query, (err, rows, fields) => {
                                                      if (err) {
                                                        res.status(500).json({
                                                          select: false
                                                        });
                                                      } else {
                                                        /******************************************************************************
                                                         * Move the file from the upload folder to the new prefile folder
                                                         */
                                                        try {
                                                          fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                                                            './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');
                                                          connection.release();
                                                          res.status(200).json({
                                                            moved: true,
                                                            id: id
                                                          });
                                                        } catch (err) {
                                                          console.log(err);
                                                          res.status(500).json({
                                                            moved: false
                                                          });
                                                        }
                                                      }
                                                    });

                                                  }
                                                });

                                              }
                                            });

                                          }
                                          /////////////////////////////////////////// participant 2 end ///////////////////////////////

                                        }
                                      });
                                    }
                                  });
                                }
                              });

                            }
                            ///////////////////////////////////////// role 3 //////////////////////////////////
                          }

                        }
                      });

                    }
                  });

                }
              });

            }
          });
        }
      });

    }
  });
});

/*******************************************************************************************************
 * ********************************************************************************************
 * *************************Step 2
 * *********************************************************************************************
 */
/******************************************
 * *********************Product
 ******************************************/
app.get('/sales/salesfiles/directsalesfile/addnewdsf/productlist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Product_Type_ID,Product_Type_Description
        from general_products_types `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/directsalesfile/addnewdsf/acsystemlist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select AC_System_ID,AC_System
        from general_ac_system `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.post('/sales/salesfiles/directsalesfile/addnewdsf/saveproductlist', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `insert into dsf_product_type(DSF_ID,Material_Category_ID) `;
      query += `values(
      ` + req.query.no + `,` + req.body[0].product + `
    )`
      for (var i = 1; i < req.body.length; i++) {
        query += `,(` + req.query.no + `,` + req.body[i].product + `)`


      }
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json({
            added: false
          });
        } else {
          let existAcSystem = false;

          for (var i = 1; i < req.body.length; i++) {
            if (req.body[i].product == "AC Equipment" && existAcSystem == false) {
              query = `insert into dsf_product_ac_systems (DSF_Product_Type_ID,AC_System_ID,Built_up_Area_m2,Cooling_Capacity_KW,Heating_Capacity_KW)
      values (` + rows[0].DSF_Product_Type_ID + `,` + req.body[0].product + `)`;
              existAcSystem = true;
            }
            if (req.body[i].product == "AC Equipment" && existAcSystem == true) {
              query += `,(` + req.query.no + `,` + req.body[i].acSystemType + `,
        '` + req.body[i].totalTreatedArea + `','` + req.body[i].totalCooling + `','` + req.body[i].totalHeating + `')`
            }

          }
          if (existAcSystem) {
            connection.query(query, (err, rows, fields) => {
              if (err) {
                res.status(500).json({
                  added: false
                });
              } else {
                connection.release();
                res.status(200).json({
                  added: true
                });
              }
            });
          } else {
            connection.release();
            res.status(200).json({
              added: true
            });
          }

        }
      });
    }
  });
});


app.get('/sales/salesfiles/directsalesfile/addnewdsf/competitorslist', (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Competitor_ID,Brand_Name
        from general_competitor `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/companylist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Company_Name
        from general_competitor where Competitor_ID=${req.query.brand}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(comp);
        }
      });
    }
  });
});
/************************************************************
 * Dsf Restriction
 */
app.get('/sales/salesfiles/directsalesfile/addnewdsf/dsfRestriction', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      let email = jwt.decode(req.query.authentification).data;
      query = `select Position_Description,Department_Name
        from hr_title_table,management_group_companies_departments
         where Title_ID=(select Title_ID from hr_position_table where Position_ID=
          (select Actual_Position_ID where Professional_mail='` + email + `' ) )
          && Position_ID=(select Position_ID from hr_position_table where Position_ID=
            (select Actual_Position_ID where Professional_mail='` + email + `' ) )
          && management_group_companies_departments.Department_ID=(select Department_ID from hr_position_table where
            Position_ID=
          (select Actual_Position_ID where Professional_mail='` + email + `' ) )`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(comp);
        }
      });
    }
  });
});
////////////////////////////////////////////////////
app.post('/sales/salesfiles/directsalesfile/addnewdsf/savecompetitorlist', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `insert into dsf_competitor(DSF_ID,Competitor_ID) `;
      query += `values(
      ` + req.query.no + `,` + req.body[0].competitor + `
    )`
      for (var i = 1; i < req.body.length; i++) {
        query += `,(` + req.query.no + `,` + req.body[i].competitor + `)`


      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          connection.release();
          res.status(200).json({
            added: true
          });
        }

      })

    }
  })
})



//////////////////////////////////////////////////
app.get('/sales/salesfiles/directsalesfile/addnewdsf/countrieslist', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Ctry_Name)
        from gnrl_ctry`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.post('/sales/salesfiles/directsalesfile/addnewdsf/savefinalstep', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = "update dsf_main_table set " +
        "Project_Country = '" + req.body.country + "'," +
        "DSF_Title  ='" + req.body.deadline + "'," +
        "Comment='" + req.body.comment + "'," +
        "DSF_Status='On Going'" +
        "where No=" + req.query.no;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          connection.release();
          res.status(200).json({
            added: true
          });
        }
      });
    }
  });
});


app.get("/sales/salesfiles/directsalesfile/addnewdsf/dsflist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select dsf1.No,DSF_Status,DSF_Project_Type,DSF_Title,DSF_Added_By_Name,
                  DSF_Reference,DSF_Deadline,DSF_Actual_Closing_Date
          from dsf_main_table as dsf1,(select No,Max(DSF_Added_on) as DSF_Added_on
                                            from sales_dsf_main_table
                                            group by No)as dsf2
          where dsf1.No=dsf2.No
          && dsf1.DSF_Added_on=dsf2.DSF_Added_on

    `
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

app.get('/sales/salesfiles/directsalesfile/addnewdsf/showdsf', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Reference,DSF_Project_Type,DSF_Incharge_Name,DSF_Incharge_Position,
                DSF_Client_Name,DSF_Client_Grade,DSF_Consultant,Project_Country,DSF_Product_Type1,
                DSF_Product_Type2,DSF_Product_Type3,DSF_Product_Type4,DSF_Product_Type5,DSF_Product_Type6,
                DSF_Product_Type7,DSF_Product_Type8,DSF_Product_Type9,DSF_Product_Type10,DSF_Competitor1_Brand,
                DSF_Competitor2_Brand,DSF_Competitor3_Brand,DSF_Competitor4_Brand,DSF_Competitor5_Brand,DSF_Competitor6_Brand,
                DSF_Competitor7_Brand,DSF_Competitor8_Brand,DSF_Competitor9_Brand,DSF_Competitor10_Brand,
                DSF_Status,DSF_Target_Quotation_Date,DSF_Actual_Closing_Date,DSF_Won_By,` + "`DSF_Won_Amount(USD)` as DSF_Won_Amount" + `,Comment,DSF_Title
        from sales_dsf_main_table
        where No='` + req.query.no + `'`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows[0]);

        }
      });
    }
  });
});
app.get('/sales/salesfiles/directsalesfile/addnewdsf/dsfsStatus', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Status as name, count(DSF_Status) as value
            from sales_dsf_main_table as dsf1,(select No,Max(DSF_Added_on) as DSF_Added_on
                                              from sales_dsf_main_table
                                              group by No)as dsf2
            where dsf1.No=dsf2.No
            && dsf1.DSF_Added_on=dsf2.DSF_Added_on
            group by DSF_Status`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

/**************************************************************************************************************
 * ************* Update DSF
 ********************************/

app.get("/sales/salesfiles/directsalesfile/inputdata/fullexistingdsflist", ensureToken, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
            from sales_dsf_main_table
            where No=${req.query.No}
            && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                              from sales_dsf_main_table
                              where No=${req.query.No})`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err)
        } else {
          res.status(200).json(rows[0]);
        }
      })
    }
  })
});

app.get('/sales/salesfiles/directsalesfile/updatedsf/salesfileinchargepositions', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      var email = jwt.decode(req.query.authentification).data;
      query = `select distinct(Position)
    from hr_emp_gnd
    where (Department Like '%sales%'
    || Department Like '%Sales%')
    && Position <> 'Sales Director'
    && Position in (select Position
                    from    (select * from hr_emp_gnd
                            order by Manager_Position, Employee_No) products_sorted,
                            (select @pv := (select Employee_No
                                            from hr_emp_gnd
                                            where Position='` + req.query.position + `')
                            ) initialisation
                    where   find_in_set(Manager_Position, @pv)
                    and     length(@pv := concat(@pv, ',', Employee_No))
                    )
    `;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.post("/sales/salesfiles/directsalesfile/updatedsf/savestep1", ensureToken, upload.single('file'), (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Status,DSF_Reference
            from sales_dsf_main_table
            where No=${req.query.No}
            && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                              from sales_dsf_main_table
                              where No=${req.query.No})`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err)
        } else {
          status = rows[0].DSF_Status;
          reference = rows[0].DSF_Reference
          form = JSON.parse(req.body.form);
          var email = jwt.decode(req.query.authentification).data;
          date = form['deadline'].split("T");
          deadline = date[0].concat(" ", (date[1].split('Z')[0]).split('.')[0]);
          console.log(form)
          query = `INSERT INTO sales_dsf_main_table
          ( DSF_Deadline,
          No,DSF_Added_on, DSF_Type,DSF_Design_Requirements,
          DSF_Inquiry_Received_By,DSF_Project_Type, DSF_Added_By_Name,
          DSF_Added_By_Code, DSF_Added_By_Position, DSF_Incharge_Name,
          DSF_Incharge_Code, DSF_Incharge_Position, DSF_Participant1_Name,
          DSF_Participant1_Code, DSF_Participant1_Position, DSF_Participant1_Task1,
          DSF_Participant1_Task2, DSF_Participant1_Task3, DSF_Participant2_Name,
          DSF_Participant2_Code,DSF_Participant2_Position, DSF_Participant2_Task1,
          DSF_Participant2_Task2,DSF_Participant2_Task3, DSF_Client_Name,
          DSF_Client_Grade, DSF_Client_Contact_Person1_Name,DSF_Client_Contact_Person1_Position,
          DSF_Client_Contact_Person1_Tel, DSF_Client_Contact_Person1_Mail,DSF_Client_Contact_Person2_Name,
          DSF_Client_Contact_Person2_Position,DSF_Client_Contact_Person2_Tel, DSF_Client_Contact_Person2_Mail,
          DSF_Consultant,DSF_Consultant_Contact_Person1_Name, DSF_Consultant_Contact_Person1_Position,
          DSF_Consultant_Contact_Person1_Tel, DSF_Consultant_Contact_Person1_Mail,DSF_Consultant_Contact_Person2_Name,
          DSF_Consultant_Contact_Person2_Position,DSF_Consultant_Contact_Person2_Tel, DSF_Consultant_Contact_Person2_Mail,
          DSF_Project_Building_Type, DSF_Project_Owner,
          ` + '`DSF_Project_Built_Area(m2)`' + `,Comment,DSF_Status,
          lat,lng,DSF_Reference,DSF_URL)

          VALUES

          ('${deadline}',
          ${req.query.No},CURRENT_TIMESTAMP(), 'DSF', '` + form['designRequirement'] + `',
          '` + form['inquiryReceivedBy'] + `', '` + form['projectType'] + `',(select concat_ws(' ', Employee_First_Name,Employee_Last_Name) from hr_emp_gnd where Professional_mail='` + email + `'),
          (select Employee_Code from hr_emp_gnd where Professional_mail='` + email + `'), (select Position from hr_emp_gnd where Professional_mail='` + email + `'), '` + form['salesFileInChargeName'] + `',
          '` + form['salesFileInChargeCode'] + `','` + form['salesFileInChargePosition'] + `','` + form['salesFileParticipant1Name'] + `',
          '` + form['salesFileParticipant1Code'] + `','` + form['salesFileParticipant1Position'] + `','` + form['salesFileParticipant1Role1'] + `',
          '` + form['salesFileParticipant1Role2'] + `', '` + form['salesFileParticipant1Role3'] + `', '` + form['salesFileParticipant2Name'] + `',
          '` + form['salesFileParticipant2Code'] + `','` + form['salesFileParticipant2Position'] + `','` + form['salesFileParticipant2Role1'] + `',
           '` + form['salesFileParticipant2Role2'] + `', '` + form['salesFileParticipant2Role3'] + `', '` + form['client'] + `',
           (select Grade from hr_emp_gnd where Professional_mail='` + email + `'),'` + form['salesFileClient1Name'] + `', '` + form['salesFileClient1Position'] + `',
           '` + form['salesFileClient1Tel'] + `','` + form['salesFileClient1Mail'] + `', '` + form['salesFileClient2Name'] + `',
           '` + form['salesFileClient2Position'] + `','` + form['salesFileClient2Tel'] + `', '` + form['salesFileClient2Mail'] + `',
           '` + form['consultant'] + `','` + form['salesFileConsultant1Name'] + `','` + form['salesFileConsultant1Position'] + `',
           '` + form['salesFileConsultant1Tel'] + `','` + form['salesFileConsultant1Mail'] + `', '` + form['salesFileConsultant2Name'] + `',
           '` + form['salesFileConsultant2Position'] + `','` + form['salesFileConsultant2Tel'] + `', '` + form['salesFileConsultant2Mail'] + `',
           '` + form['projectBuildingType'] + `','` + form['projectOwner'] + `','` + form['totalBuiltupArea'] + `',
           '-','${status}',` + form['lat'] + `,` + form['lon'] + `,'${reference}','ServerDev/Sales Folder/Direct Sales File/DSF/');`


          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                inserted: false
              });
            } else {
              if (form.file) {
                query = `select max(DSF_Added_on) as DSF_Added_on
                      from sales_dsf_main_table
                      where No=${req.query.No}`;

                connection.query(query, function (err, rows, fields) {
                  if (err) {
                    console.log(err);
                    res.status(500).json({
                      updated: false
                    });
                  } else {
                    reference = rows[0].DSF_Reference;
                    query = `select DSF_URL,DSF_Reference,concat_ws('',
                                                                  DSF_Reference,
                                                                  '-',
                                                                  Day(current_timestamp),
                                                                  ' ',
                                                                  Time(current_timestamp)
                                                                  )
                                                                  as FileName
                          from sales_dsf_main_table
                          where No = ${req.query.No}
                          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                            from sales_dsf_main_table
                                            where No=${req.query.No})`
                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        res.status(500).json({
                          select: false
                        });
                      } else {
                        /******************************************************************************
                         * Move the file from the upload folder to the new prefile folder
                         */
                        try {
                          if (req.file)
                            fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                              './ServerDev/Sales Folder/Direct Sales File/DSF/' + rows[0].DSF_Reference + '/' + rows[0].FileName + '.rar');

                          connection.release();
                          res.status(200).json({
                            moved: true,
                            id: req.query.No
                          });
                        } catch (err) {
                          console.log(err);
                          res.status(500).json({
                            moved: false
                          });
                        }
                      }
                    });

                  }
                });
              } else {
                query = `select max(DSF_Added_on) as DSF_Added_on
                          from sales_dsf_main_table
                          where No=${req.query.No}`;

                connection.query(query, function (err, rows, fields) {
                  if (err) {
                    console.log(err);
                    res.status(500).json({
                      updated: false
                    });
                  } else {


                    addedOn = rows[0].DSF_Added_on;

                    query = `update sales_dsf_main_table set
                          DSF_Reference='${reference}',
                          DSF_URL='ServerDev/Sales Folder/Direct Sales File/DSF/'
                          where No = ${req.query.No}
                          && DSF_Added_on =` + connection.escape(addedOn)

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);
                        res.status(500).json(err);
                      } else {
                        connection.release();
                        res.status(200).json({
                          moved: true,
                          id: req.query.No
                        });

                      }
                    });
                  }
                })
              }
            };
          })
        }
      })
    }
  })
});
/////////////////////////////////////////////////////////////////////////////////////////
app.post('/sales/salesfiles/directsalesfile/updatedsf/savestep2', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      res.status(500).json(err)
    } else {
      query = `select DSF_Status,DSF_Reference,DSF_Added_on
          from sales_dsf_main_table
          where No=${req.query.No}
          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                            from sales_dsf_main_table
                            where No=${req.query.No})`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          status = rows[0].DSF_Status;
          reference = rows[0].DSF_Reference;
          query = "update sales_dsf_main_table set ";

          for (var i = 0; i < req.body.length; i++) {
            if (req.body[i].product == "AC Equipment") {
              query += "DSF_Product_Type" + (i + 1) + "='" + req.body[i].product + "'," +
                "`DSF_AC_System" + (i + 1) + "_Type`='" + req.body[i].acSystemType + "'," +
                "`DSF_AC_System" + (i + 1) + "_Area(m2)`=" + req.body[i].totalTreatedArea + "," +
                "`DSF_AC_System" + (i + 1) + "_Cooling(KW)`=" + req.body[i].totalCooling + "," +
                "`DSF_AC_System" + (i + 1) + "_Heating(KW)`=" + req.body[i].totalHeating + ""
            } else {
              query += "DSF_Product_Type" + (i + 1) + "='" + req.body[i].product + "'," +
                "`DSF_AC_System" + (i + 1) + "_Type`='-'," +
                "`DSF_AC_System" + (i + 1) + "_Area(m2)`=-1," +
                "`DSF_AC_System" + (i + 1) + "_Cooling(KW)`=-1," +
                "`DSF_AC_System" + (i + 1) + "_Heating(KW)`=-1"
            }
            if (i != req.body.length - 1)
              query += ','

          }
          if (status == 'Under Creation-Step1')
            query += `,DSF_Status='Under Creation-Step2'`
          query += ` where No=${req.query.No}
              && DSF_Added_on = ${connection.escape(rows[0].DSF_Added_on)}`;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err)
              res.status(500).json({
                added: false
              });
            } else {
              connection.release();
              res.status(200).json({
                added: true
              });
            }
          });
        }
      })
    }
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////

app.post('/sales/salesfiles/directsalesfile/updatedsf/savestep3', ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Status,DSF_Reference,DSF_Added_on
          from sales_dsf_main_table
          where No=${req.query.No}
          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                            from sales_dsf_main_table
                            where No=${req.query.No})`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          status = rows[0].DSF_Status;
          reference = rows[0].DSF_Reference;
          query = "update sales_dsf_main_table set ";

          for (var i = 0; i < req.body.length; i++) {
            query += "`DSF_Competitor" + (i + 1) + "_Company`='" + req.body[i].companyName + "'," +
              "`DSF_Competitor" + (i + 1) + "_Brand`='" + req.body[i].competitor + "'";
            if (i != req.body.length - 1) {
              query += ','
            }
          }
          if (status == 'Under Creation-Step2')
            query += `,DSF_Status='Under Creation-Step3'`
          query += ` where No=${req.query.No}
                    && DSF_Added_on = ${connection.escape(rows[0].DSF_Added_on)}`;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json({
                added: false
              });
            } else {
              connection.release();
              res.status(200).json({
                added: true
              });
            }
          })
        }
      })
    }
  })
});
////////////////////////////////////////////////////////////////////////////////////////

app.post('/sales/salesfiles/directsalesfile/updatedsf/savestep4', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Status,DSF_Reference,DSF_Added_on
          from sales_dsf_main_table
          where No=${req.query.No}
          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                            from sales_dsf_main_table
                            where No=${req.query.No})`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          status = rows[0].DSF_Status;
          reference = rows[0].DSF_Reference;

          query = "update sales_dsf_main_table set " +
            "Project_Country = '" + req.body.country + "'," +
            "DSF_Title  ='" + req.body.deadline + "'," +
            "Comment='" + req.body.comment + "'"

          if (status == 'Under Creation-Step3')
            query += `,DSF_Status='On Going'`
          query += ` where No=${req.query.No}
                  && DSF_Added_on = ${connection.escape(rows[0].DSF_Added_on)}`;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json({
                added: false
              });
            } else {
              connection.release();
              res.status(200).json({
                added: true
              });
            }
          })
        }
      })
    }
  })
})

/********************************************************************************************
 * **************************************************************************************
 * ******** Quotation
 ****************************************************/

app.get("/sales/salesfiles/directsalesfile/quotations/quotationlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select No,QUOT_Status,QUOT_Type,QUOT_DSF_Project_Title,QUOT_Added_By_Name,
                QUOT_Ref,QUOT_Added_on
          from gnrl_sales_file_quotation`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
app.get('/sales/salesfiles/directsalesfile/quotations/showquotation', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select QUOT_OP_MQOUOT,QUOT_Company,QUOT_Ref,QUOT_Subject,QUOT_Sales_Manager_Approval,QUOT_Sales_Director_Approval
    QUOT_DSF_Project_Title,
    QUOT_DSF_Reference,
    QUOT_Status,QUOT_Total_Amount_USD
          from gnrl_sales_file_quotation
          where No='` + req.query.no + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows[0]);

        }
      });
    }
  });
});

app.get('/sales/salesfiles/directsalesfile/quotations/quotationsStatus', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select QUOT_Status as name, count(	QUOT_Status) as value from
              gnrl_sales_file_quotation
        group by 	QUOT_Status `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});


app.get("/sales/salesfiles/directsalesfile/addnewdsf/dsfreftitlelist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select dsf1.No,DSF_Title,DSF_Reference,DSF_Incharge_Position
          from sales_dsf_main_table as dsf1,(select No,Max(DSF_Added_on) as DSF_Added_on
                                            from sales_dsf_main_table
                                            group by No)as dsf2
          where dsf1.No=dsf2.No
          && dsf1.DSF_Added_on=dsf2.DSF_Added_on
          && DSF_Status='On Going'`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/inputdata/sftypelist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Sales_File_Type)
          from gnrl_sales_file_type`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/inputdata/sfreflist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(DSF_Reference),No
          from sales_dsf_main_table
          where DSF_Type='` + req.query.sfType + `'`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/inputdata/inputdatatypelist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Input_Data_Type)
          from sales_inputdata_type`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/inputdata/inputdatalist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Title
          from sales_input_data,sales_input_data_history
          where
          sales_input_data.No=sales_input_data_history.Input_Data_Id
          && Review=(select max(Review)
                  from sales_input_data_history
                  where Input_Data_Id=sales_input_data.No)
          && version=(select max(version)
                  from sales_input_data_history
                  where Input_Data_Id=sales_input_data.No
                  && Review  =(select max(Review)
                                from sales_input_data_history
                                where Input_Data_Id=sales_input_data.No))
          order by No desc`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/inputdata/receivedbylist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Enquiry_Received_By)
          from gnrl_sf_enquiry_received_by`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/addnewdsf/brandlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Brand)
          from sales_our_brands`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});


app.get("/sales/salesfiles/directsalesfile/addnewdsf/currencylist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Currency_Trigram)
    from gnrl_currency`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/addnewdsf/incotermlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Incoterms_Code)
          from sales_incoterms`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/directsalesfile/addnewdsf/producttypelist', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select DSF_Product_Type1,DSF_AC_System1_Type,DSF_AC_System1_Type,` + '`DSF_AC_System1_Area(m2)`' + `,` + '`DSF_AC_System1_Cooling(KW)`' + `,` + '`DSF_AC_System1_Heating(KW)`' + `,
      DSF_Product_Type2,DSF_AC_System2_Type,DSF_AC_System2_Type,` + '`DSF_AC_System2_Area(m2)`' + `,` + '`DSF_AC_System2_Cooling(KW)`' + `,` + '`DSF_AC_System2_Heating(KW)`' + `,
      DSF_Product_Type3,DSF_AC_System3_Type,DSF_AC_System3_Type,` + '`DSF_AC_System3_Area(m2)`' + `,` + '`DSF_AC_System3_Cooling(KW)`' + `,` + '`DSF_AC_System3_Heating(KW)`' + `,
      DSF_Product_Type4,DSF_AC_System4_Type,DSF_AC_System4_Type,` + '`DSF_AC_System4_Area(m2)`' + `,` + '`DSF_AC_System4_Cooling(KW)`' + `,` + '`DSF_AC_System4_Heating(KW)`' + `,
      DSF_Product_Type5,DSF_AC_System5_Type,DSF_AC_System5_Type,` + '`DSF_AC_System5_Area(m2)`' + `,` + '`DSF_AC_System5_Cooling(KW)`' + `,` + '`DSF_AC_System5_Heating(KW)`' + `,
      DSF_Product_Type6,DSF_AC_System6_Type,DSF_AC_System6_Type,` + '`DSF_AC_System6_Area(m2)`' + `,` + '`DSF_AC_System6_Cooling(KW)`' + `,` + '`DSF_AC_System6_Heating(KW)`' + `,
      DSF_Product_Type7,DSF_AC_System7_Type,DSF_AC_System7_Type,` + '`DSF_AC_System7_Area(m2)`' + `,` + '`DSF_AC_System7_Cooling(KW)`' + `,` + '`DSF_AC_System7_Heating(KW)`' + `,
      DSF_Product_Type8,DSF_AC_System8_Type,DSF_AC_System8_Type,` + '`DSF_AC_System8_Area(m2)`' + `,` + '`DSF_AC_System8_Cooling(KW)`' + `,` + '`DSF_AC_System8_Heating(KW)`' + `,
      DSF_Product_Type9,DSF_AC_System9_Type,DSF_AC_System9_Type,` + '`DSF_AC_System9_Area(m2)`' + `,` + '`DSF_AC_System9_Cooling(KW)`' + `,` + '`DSF_AC_System9_Heating(KW)`' + `,
      DSF_Product_Type10,DSF_AC_System10_Type,DSF_AC_System10_Type,` + '`DSF_AC_System10_Area(m2)`' + `,` + '`DSF_AC_System10_Cooling(KW)`' + `,` + '`DSF_AC_System10_Heating(KW)`' + `
      from sales_dsf_main_table
      where No=` + req.query.no;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          final = [];
          for (var i = 1; i <= 10; i++) {
            if (rows[0]['DSF_Product_Type' + i] != '-') {
              final.push({
                DSF_Product_Type: rows[0]['DSF_Product_Type' + i],
                DSF_AC_System_Type: rows[0]['DSF_AC_System' + i + '_Type'],
                DSF_AC_System_Area: rows[0]['DSF_AC_System' + i + '_Area(m2)'],
                DSF_AC_System_Cooling: rows[0]['DSF_AC_System' + i + '_Cooling(KW)'],
                DSF_AC_System_Heating: rows[0]['DSF_AC_System' + i + '_Heating(KW)']
              })
            }
          }
          connection.release();
          res.status(200).json(final);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/addnewdsf/supplierquotationlist", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select No,Ref,ReceivedOn,Currency,Incoterms,TotalAmount,Related_RFQ_Ref
        from sales_supquot_main_table
    `;
      if (req.query.acSystem.localeCompare('AC Equipment')) {
        query += `where (ProductType ='` + req.query.productType + `'
      && ACSystem='` + req.query.acSystem + `'
      && Brand='` + req.query.brand + `')`;
      } else {
        query += `where (ProductType ='` + req.query.productType + `'
      && Brand='` + req.query.brand + `')`;
      }
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/addnewdsf/existingquotation", ensureToken, (req, res) => {



  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select No
          from sales_supquot_main_table
          where ProductType ='` + req.body.productType + `'
          && ACSystem='` + req.body.systemType + `'
          && Ref ='` + req.body.quotationRef + `'
          && Related_RFQ_Ref='` + req.body.RFQRef + `'
          `
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.post("/sales/salesfiles/directsalesfile/inputdata/createinputdata", ensureToken, uploadInputDataDoc.fields([{
  name: 'file',
  maxCount: 1
}, {
  name: "file1",
  maxCount: 1
}]), (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;

      query = `INSERT INTO sales_input_data
      ( Sales_File_Type,Input_Data_Revision,
        Received_From,
        Input_Data_Status)

        VALUES

        ('` + form['sfType'] + `', 'A',
        (select concat_ws(' ', Employee_First_Name,Employee_Last_Name) from hr_emp_gnd where Professional_mail='` + email + `'),
        'valid')`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          id = rows.insertId;
          query = `insert into sales_input_data_history
        (Sales_File_Reference,Input_Data_Type,Received_On,Received_By,
        Title, Input_Data_Id,Receiving_Document_File_Name,
        Input_Data_File_Name)

        Values

        ('` + form['sfRef'] + `','` + form['inputDataType'] + `','` + form['receivedOn'] + `' ,'${form['receivedBy']}',
        '` + form['title'] + `',` + id + `,concat_ws('','` + id + `-',current_timestamp),
        concat_ws('','` + id + `-',current_timestamp))`;
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              var query = `update sales_input_data  set

            URL=concat_ws('',
                            'ServerDev/Sales Folder/Direct Sales File/Input Data/',
                            concat_ws('',
                                    (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                    '/` + id + `'
                            )
                          )

            where No=` + id;


              connection.query(query, function (err, rows, fields) {
                if (err) {
                  console.log(err);
                  res.status(500).json({
                    updated: false
                  });
                } else {
                  query = `select URL,Receiving_Document_File_Name,Input_Data_File_Name
                from sales_input_data inuptData,sales_input_data_history inputDataHistory
                where No = ` + id + `
                && inuptData.No = inputDataHistory.Input_Data_Id`
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err)
                      res.status(500).json({
                        select: false
                      });
                    } else {

                      /******************************************************************************
                       * Move the file from the upload folder to the new prefile folder
                       */
                      try {

                        fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/InputDataDocTemp/' + req.files['file'][0].filename,
                          './' + rows[0].URL + '/Receiving Document/' + rows[0].Receiving_Document_File_Name + '.rar');

                        try {

                          fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/InputDataDocTemp/' + req.files['file1'][0].filename,
                            './' + rows[0].URL + '/Input Data/' + rows[0].Input_Data_File_Name + '.rar');
                          connection.release();
                          res.status(200).json({
                            moved: true,
                            id: id
                          });
                        } catch (err) {
                          console.log(err);
                          res.status(500).json({
                            moved: false
                          });
                        }
                      } catch (err) {
                        console.log(err);
                        res.status(500).json({
                          moved: false
                        });
                      }
                    }
                  });
                }
              });
            }
          })
        }
      });
    }
  });
});
/****************************************************************************************
 * Update Input Data
 ***********************/
app.get("/sales/salesfiles/directsalesfile/inputdata/fullinputdatalist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Sales_File_Type,Input_Data_Revision,Received_From,Input_Data_Status,No,
                  Title,Input_Data_Type,Sales_File_Reference,Date(Received_On) as Received_On,Received_By
          from sales_input_data,sales_input_data_history
          where
          sales_input_data.No=sales_input_data_history.Input_Data_Id
          && Review=(select max(Review)
                      from sales_input_data_history
                      where Input_Data_Id=sales_input_data.No)
          && version=(select max(version)
                      from sales_input_data_history
                      where Input_Data_Id=sales_input_data.No
                      && Review  =(select max(Review)
                                    from sales_input_data_history
                                    where Input_Data_Id=sales_input_data.No))
          order by No desc`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

/***************************************************************************************** */
app.post("/sales/salesfiles/directsalesfile/inputdata/updateinputdata", ensureToken, uploadInputDataDoc.fields([{
  name: 'file',
  maxCount: 1
}, {
  name: "file1",
  maxCount: 1
}]), (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);
      query = `select Review,Receiving_Document_File_Name,Input_Data_File_Name
          from sales_input_data_history
          where Input_Data_Id=` + form['No'] + `
          && Review=(select max(Review)
                      from sales_input_data_history
                      where Input_Data_Id=` + form['No'] + `)
          && version=(select max(version)
                      from sales_input_data_history
                      where Input_Data_Id=` + form['No'] + `
                      && Review  =(select max(Review)
                                    from sales_input_data_history
                                    where Input_Data_Id=` + form['No'] + `))
    `
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            updated: false
          });
        } else {
          inputDataFileName = rows[0].Input_Data_File_Name;
          receivingDocumentFileName = rows[0].Receiving_Document_File_Name;
          query = `insert into sales_input_data_history
        (Sales_File_Reference,Input_Data_Type,Received_On,Received_By,Title,
        Input_Data_Id,Review,Receiving_Document_File_Name,Input_Data_File_Name)
        Values
        ('${form['sfRef']}','${form['inputDataType']}','${form['receivedOn']}','${form['receivedBy']}','${form['title']}',
        ` + form['No'] + `,` + (rows[0].Review + 1);
          if (form["document"] != '' && form["document"]) {
            query += `,concat_ws('','` + form['No'] + `-',current_timestamp)`
          } else {
            query += `,'` + receivingDocumentFileName + `'`
          }
          if (form["documentData"] != '' && form["documentData"]) {
            query += `,concat_ws('','` + form['No'] + `-',current_timestamp)`
          } else {
            query += `,'` + inputDataFileName + `'`
          }
          query += `)
        `
          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select URL,Receiving_Document_File_Name
            from sales_input_data,sales_input_data_history
            where  sales_input_data.No=sales_input_data_history.Input_Data_Id
            && No=${form['No']}
            && Review=(select max(Review)
                      from sales_input_data_history
                      where Input_Data_Id=` + form['No'] + `)
            && version=(select max(version)
                        from sales_input_data_history
                        where Input_Data_Id=` + form['No'] + `
                        && Review =(select max(Review)
                                      from sales_input_data_history
                                      where Input_Data_Id=` + form['No'] + `))`;
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  /******************************************************************************
                   * Move the file from the upload folder to the new prefile folder
                   */
                  try {
                    if (form["document"] != '' && form["document"]) {
                      fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/InputDataDocTemp/' + req.files['file'][0].filename,
                        './' + rows[0].URL + '/Receiving Document/' + rows[0].Receiving_Document_File_Name + '.rar');
                    }

                    try {
                      if (form["documentData"] != '' && form["documentData"]) {
                        fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/InputDataDocTemp/' + req.files['file1'][0].filename,
                          './' + rows[0].URL + '/Input Data/' + rows[0].Input_Data_File_Name + '.rar');
                      }
                      connection.release();
                      res.status(200).json({
                        updated: true

                      });
                    } catch (err) {
                      console.log(err);
                      res.status(500).json({
                        updated: false
                      });
                    }
                  } catch (err) {
                    console.log(err);
                    res.status(500).json({
                      updated: false
                    });
                  }
                }
              });
            }
          })
        }
      })
    }
  })
})
/*********************************************************************************** */
app.post("/sales/salesfiles/directsalesfile/inputdata/updatesimpleinputdata", ensureToken, upload.single('file'), (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);

      query = `select Review,version,Receiving_Document_File_Name,Input_Data_File_Name,
                    Input_Data_File_Name,Sales_File_Reference,Title
            from sales_input_data_history
            where Input_Data_Id=` + form['No'] + `
            && Review=(select max(Review)
                        from sales_input_data_history
                        where Input_Data_Id=` + form['No'] + `)
            && version=(select max(version)
                        from sales_input_data_history
                        where Input_Data_Id=` + form['No'] + `
                        && Review =(select max(Review)
                                      from sales_input_data_history
                                      where Input_Data_Id=` + form['No'] + `))

      `
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            updated: false
          });
        } else {
          inputDataFileName = rows[0].Input_Data_File_Name;
          receivingDocumentFileName = rows[0].Receiving_Document_File_Name;
          query = `insert into sales_input_data_history
          (Input_Data_Type,Received_On,Received_By,
          Input_Data_File_Name,Sales_File_Reference,Title,
          Input_Data_Id,Review,version,Receiving_Document_File_Name)
          Values
          ('${form['inputDataType']}','${form['receivedOn']}','${form['receivedBy']}',
          '${rows[0].Input_Data_File_Name}','${rows[0].Sales_File_Reference}','${rows[0].Title}',
          ` + form['No'] + `,` + rows[0].Review + `,` + (rows[0].version + 1);
          if (form["document"] != '' && form["document"]) {
            query += `,concat_ws('','` + form['No'] + `-',current_timestamp)`
          } else {
            query += `,'` + receivingDocumentFileName + `'`
          }
          query += `)
          `
          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select URL,Receiving_Document_File_Name
                    from sales_input_data,sales_input_data_history
                    where  sales_input_data.No=sales_input_data_history.Input_Data_Id
                    && No=${form['No']}
                    && Review=(select max(Review)
                              from sales_input_data_history
                              where Input_Data_Id=` + form['No'] + `)
                    && version=(select max(version)
                                from sales_input_data_history
                                where Input_Data_Id=` + form['No'] + `
                                && Review =(select max(Review)
                                              from sales_input_data_history
                                              where Input_Data_Id=` + form['No'] + `))`;
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  /******************************************************************************
                   * Move the file from the upload folder to the new prefile folder
                   */
                  try {
                    if (req.file) {
                      fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/Temp/' + req.file.filename,
                        './' + rows[0].URL + '/Receiving Document/' + rows[0].Receiving_Document_File_Name + '.rar');
                    }
                    connection.release();
                    res.status(200).json({
                      updated: true,
                    });
                  } catch (err) {
                    console.log(err);
                    res.status(500).json({
                      updated: false
                    });
                  }
                }
              })
            }
          })
        }
      })

    }
  })
})
///////////////////////////////////////////////////////////////////////////////////////////

app.get("/sales/salesfiles/directsalesfile/inputdata/downloadreceivingdocument", ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      No = req.query.No
      query = `select URL,Receiving_Document_File_Name
      from sales_input_data,sales_input_data_history
      where  sales_input_data.No=sales_input_data_history.Input_Data_Id
      && No=${No}
      && Review=(select max(Review)
                from sales_input_data_history
                where Input_Data_Id=${No})
      && version=(select max(version)
                  from sales_input_data_history
                  where Input_Data_Id=${No}
                  && Review =(select max(Review)
                                from sales_input_data_history
                                where Input_Data_Id=${No}))`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err)
          res.status(500).json(err);
        } else {
          res.download('./' + rows[0].URL + '/Receiving Document/' + rows[0].Receiving_Document_File_Name + '.rar', 'ReceivingDocument.rar');

        }
      })
    }
  })
})
/////////////////////////////////////////////////////////////////////////////////////////////

app.get("/sales/salesfiles/directsalesfile/inputdata/downloadinputdata", ensureToken, (req, res) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      No = req.query.No
      query = `select URL,Input_Data_File_Name
      from sales_input_data,sales_input_data_history
      where  sales_input_data.No=sales_input_data_history.Input_Data_Id
      && No=${No}
      && Review=(select max(Review)
                from sales_input_data_history
                where Input_Data_Id=${No})
      && version=(select max(version)
                  from sales_input_data_history
                  where Input_Data_Id=${No}
                  && Review =(select max(Review)
                                from sales_input_data_history
                                where Input_Data_Id=${No}))`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err)
          res.status(500).json(err);
        } else {
          res.download('./' + rows[0].URL + '/Input Data/' + rows[0].Input_Data_File_Name + '.rar', 'InputData.rar');

        }
      })
    }
  })
})
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
/*****************************************************************************
 * DSF
 */
app.post("/sales/salesfiles/directsalesfile/addnewdsf/sendsq", ensureToken, uploadSQDoc.fields([{
  name: 'file',
  maxCount: 1
}, {
  name: "file1",
  maxCount: 1
}]), (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;
      date = form['receivedOn'].split("T");
      receivedOn = date[0].concat(" ", date[1].split('Z')[0]);

      query = `INSERT INTO sales_supquot_main_table
    ( Related_RFQ_Ref,File_Type,File_Reference,
      ProductType,ACSystem,Brand,Ref,
      ReceivedOn,Received_By,Currency,Incoterms,TotalAmount)

      VALUES

      ('` + form['relatedRFQRef'] + `','DSF','` + form['fileRef'] + `',
      '` + form['productType'] + `','` + form['systemType'] + `','` + form['brand'] + `','` + form['quotationRef'] + `',
      '` + receivedOn + `','Mail','` + form['currency'] + `','` + form['incoterms'] + `','` + form['amount'] + `')`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          id = rows.insertId;
          var query = `update sales_supquot_main_table  set

        ReceivingDocUrl=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/ReceivingDocAdress/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          ),
        URL=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/QuotationDocs/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          )
        where No=` + id;

          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select ReceivingDocUrl,URL
                  from sales_supquot_main_table
                  where No = ` + id
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json({
                    select: false
                  });
                } else {

                  /******************************************************************************
                   * Move the file from the upload folder to the new prefile folder
                   */
                  try {

                    fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file'][0].filename,
                      './' + rows[0].ReceivingDocUrl + '.pdf');

                    try {

                      fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file1'][0].filename,
                        './' + rows[0].URL + '.rar');
                      connection.release();
                      res.status(200).json({
                        added: true,
                        id: id
                      });
                    } catch (err) {
                      console.log(err);
                      res.status(500).json({
                        added: false
                      });
                    }
                  } catch (err) {
                    console.log(err);
                    res.status(500).json({
                      added: false
                    });
                  }
                }
              });

            }
          });
        }
      });
    }

  });
});
/*************************** NO DOCS************************************************************** */
app.post("/sales/salesfiles/directsalesfile/addnewdsf/sendsqmodnodocs", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = req.body;
      var email = jwt.decode(req.query.authentification).data;
      date = form['receivedOn'].split("T");
      receivedOn = date[0].concat(" ", date[1].split('Z')[0]);

      query = `update sales_supquot_main_table set
      Related_RFQ_Ref='` + form['relatedRFQRef'] + `',
      File_Reference='` + form['fileRef'] + `',
      ProductType='` + form['productType'] + `',
      Ref='` + form['quotationRef'] + `',
      ReceivedOn='` + receivedOn + `',
      Currency='` + form['currency'] + `',
      Incoterms='` + form['incoterms'] + `',
      TotalAmount='` + form['amount'] + `'

      where Ref='` + form['lastRef'] + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          connection.release();
          res.status(200).json({
            added: true
          });
        }
      });
    }

  });
});

/********************************* DOC ********************************************* */

app.post("/sales/salesfiles/directsalesfile/addnewdsf/sendsqdoc", ensureToken, uploadSQDoc.fields([{
  name: 'file',
  maxCount: 1
}]), (req, res) => {



  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;
      date = form['receivedOn'].split("T");
      receivedOn = date[0].concat(" ", date[1].split('Z')[0]);

      query = `update sales_supquot_main_table set
    Related_RFQ_Ref='` + form['relatedRFQRef'] + `',
    File_Reference='` + form['fileRef'] + `',
      ProductType='` + form['productType'] + `',
      Ref='` + form['quotationRef'] + `',
      ReceivedOn='` + receivedOn + `',
      Currency='` + form['currency'] + `',
      Incoterms='` + form['incoterms'] + `',
      TotalAmount='` + form['amount'] + `'

      where Ref='` + form['lastRef'] + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          id = form['no'];
          var query = `update sales_supquot_main_table  set

        ReceivingDocUrl=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/ReceivingDocAdress/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          )

        where No=` + id;

          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select ReceivingDocUrl
                  from sales_supquot_main_table
                  where No = ` + id
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json({
                    select: false
                  });
                } else {

                  fsEx.remove('./' + rows[0].ReceivingDocUrl + '.pdf', err => {
                    if (err)
                      return console.error(err)
                    else {
                      /******************************************************************************
                       * Move the file from the upload folder to the new prefile folder
                       */
                      try {
                        fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file'][0].filename,
                          './' + rows[0].ReceivingDocUrl + '.pdf');
                        connection.release();
                        res.status(200).json({
                          added: true,
                          id: id
                        });
                      } catch (err) {
                        console.log(err);
                        res.status(500).json({
                          added: false
                        });
                      }
                    }

                  })

                }
              });

            }
          });
        }
      });
    }

  });
});

/******************************** DOC DATA *********************************************************** */

app.post("/sales/salesfiles/directsalesfile/addnewdsf/sendsqdocdata", ensureToken, uploadSQDoc.fields([{
  name: "file1",
  maxCount: 1
}]), (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;
      date = form['receivedOn'].split("T");
      receivedOn = date[0].concat(" ", date[1].split('Z')[0]);

      query = `update sales_supquot_main_table set
    Related_RFQ_Ref='` + form['relatedRFQRef'] + `',
    File_Reference='` + form['fileRef'] + `',
    ProductType='` + form['productType'] + `',
    Ref='` + form['quotationRef'] + `',
    ReceivedOn='` + receivedOn + `',
    Currency='` + form['currency'] + `',
    Incoterms='` + form['incoterms'] + `',
    TotalAmount='` + form['amount'] + `'

    where Ref='` + form['lastRef'] + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          id = form['no'];
          var query = `update sales_supquot_main_table  set


        URL=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/QuotationDocs/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          )
        where No=` + id;

          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select ReceivingDocUrl,URL
                  from sales_supquot_main_table
                  where No = ` + id
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json({
                    select: false
                  });
                } else {


                  fsEx.remove('./' + rows[0].URL + '.pdf', err => {
                    if (err)
                      return console.error(err)
                    else {
                      /******************************************************************************
                       * Move the file from the upload folder to the new prefile folder
                       */
                      try {
                        fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file1'][0].filename,
                          './' + rows[0].URL + '.rar');
                        connection.release();
                        res.status(200).json({
                          added: true,
                          id: id
                        });

                      } catch (err) {
                        console.log(err);
                        res.status(500).json({
                          added: false
                        });
                      }

                    }

                  })

                }
              });

            }
          });
        }
      });
    }

  });
});
/******************************* DOCS ******************************************************* */
app.post("/sales/salesfiles/directsalesfile/addnewdsf/sendsqdocs", ensureToken, uploadSQDoc.fields([{
  name: 'file',
  maxCount: 1
}, {
  name: "file1",
  maxCount: 1
}]), (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      form = JSON.parse(req.body.form);
      var email = jwt.decode(req.query.authentification).data;
      date = form['receivedOn'].split("T");
      receivedOn = date[0].concat(" ", date[1].split('Z')[0]);

      query = `update sales_supquot_main_table set
      Related_RFQ_Ref='` + form['relatedRFQRef'] + `',
      File_Reference='` + form['fileRef'] + `',
      ProductType='` + form['productType'] + `',
      Ref='` + form['quotationRef'] + `',
      ReceivedOn='` + receivedOn + `',
      Currency='` + form['currency'] + `',
      Incoterms='` + form['incoterms'] + `',
      TotalAmount='` + form['amount'] + `'

      where Ref='` + form['lastRef'] + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            added: false
          });
        } else {
          id = form['no'];
          var query = `update sales_supquot_main_table  set

        ReceivingDocUrl=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/ReceivingDocAdress/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          ),
        URL=concat_ws('',
                          'ServerDev/Sales Folder/Direct Sales File/Quotation/SQ',
                          concat_ws('',
                                  (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                  '/QuotationDocs/',
                                  Extract(YEAR from current_timestamp),
                                  '-',
                                  Extract(MONTH from current_timestamp),
                                  '` + id + `'
                                  )
                          )
        where No=` + id;

          connection.query(query, function (err, rows, fields) {
            if (err) {
              console.log(err);
              res.status(500).json({
                updated: false
              });
            } else {
              query = `select ReceivingDocUrl,URL
                  from sales_supquot_main_table
                  where No = ` + id
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json({
                    select: false
                  });
                } else {

                  fsEx.remove('./' + rows[0].ReceivingDocUrl + '.pdf', err => {
                    if (err)
                      return console.error(err)
                    else {
                      fsEx.remove('./' + rows[0].URL + '.pdf', err => {
                        if (err)
                          return console.error(err)
                        else {
                          /******************************************************************************
                           * Move the file from the upload folder to the new prefile folder
                           */
                          try {
                            fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file'][0].filename,
                              './' + rows[0].ReceivingDocUrl + '.rar');
                            connection.release();
                            res.status(200).json({
                              added: true,
                              id: id
                            });

                            try {

                              fsEx.moveSync('./ServerDev/Sales Folder/Direct Sales File/SQDocTemp/' + req.files['file1'][0].filename,
                                './' + rows[0].URL + '.rar');
                              connection.release();
                              res.status(200).json({
                                added: true,
                                id: id
                              });
                            } catch (err) {
                              console.log(err);
                              res.status(500).json({
                                added: false
                              });
                            }
                          } catch (err) {
                            console.log(err);
                            res.status(500).json({
                              added: false
                            });
                          }

                        }

                      })

                    }

                  })


                }
              });

            }
          });
        }
      });
    }

  });
});
/********************************************************************************************** */

app.get("/sales/salesfiles/directsalesfile/quotations/supplierquotationitemlist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
    from  sales_supquot_item_details
    where SUPQUOT_Ref ='` + req.query.ref + `'`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get("/sales/salesfiles/directsalesfile/quotations/supplierquotation", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
          from  sales_supquot_main_table
          where Ref ='` + req.query.ref + `'`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows[0]);
        }
      });
    }
  });
});
app.post("/sales/salesfiles/directsalesfile/quotations/existingsqitem", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `select No
    from sales_supquot_item_details
    where SUPQUOT_Ref ='` + req.body.sqRef + `'
    && Item_Ref='` + req.body.itemRef + `'
    && Item_Description ='` + req.body.itemDescription + `'
    `

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/quotations/sendsqitem", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `INSERT INTO sales_supquot_item_details
    (No, Item_Ref, Item_Description,
    Item_Qty, SUPQUOT_Ref, Brand,
    Item_Unit_Cost, Item_Total_Cost, Supplier_Quotation_Currency,
    Supplier_Quotation_Incoterm, Added_For, RFQ_Ref)
    VALUES
    ('` + req.body.itemNo + `', '` + req.body.itemRef + `', '` + req.body.itemDescription + `',
    '` + req.body.itemQty + `', '` + req.body.sqRef + `','` + req.body.brand + `',
    '` + req.body.unitPrice + `', ` + parseInt(req.body.unitPrice, 10) * parseInt(req.body.itemQty, 10) + `, '` + req.body.currency + `',
    '` + req.body.incoterm + `','-', '` + req.body.rfqRef + `')`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            added: true
          });
        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/quotations/sendsqitemmodification", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = ` UPDATE sales_supquot_item_details set
    No='` + req.body.itemNo + `',
    Item_Ref='` + req.body.itemRef + `',
    Item_Description='` + req.body.itemDescription + `',
    Item_Qty=` + req.body.itemQty + `,
    Item_Unit_Cost=` + req.body.unitPrice + `,
    Item_Total_Cost=` + parseInt(req.body.unitPrice, 10) * parseInt(req.body.itemQty, 10) + `

    where No=` + req.body.lastNo;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            modified: true
          });
        }
      });
    }
  });
});

app.delete('/sales/salesfiles/directsalesfile/quotations/deletesqitem/:no', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `delete from sales_supquot_item_details
        where No='` + req.params.no + `'`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json({
            deleted: true
          });
        }
      });
    }

  });
});

app.delete('/sales/salesfiles/directsalesfile/quotations/deletesq/:no', (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select ReceivingDocUrl,URL
    from sales_supquot_main_table
    where No = ` + req.params.no
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json({
            select: false
          });
        } else {
          fsEx.remove('./' + rows[0].ReceivingDocUrl + '.pdf', err => {
            if (err)
              return console.error(err)
            else {
              fsEx.remove('./' + rows[0].URL + '.pdf', err => {
                if (err)
                  return console.error(err)
                else {
                  query = `delete from sales_supquot_main_table
                    where No='` + req.params.no + `'`;

                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      connection.release();
                      res.status(200).json({
                        deleted: true
                      });
                    }
                  });

                }

              })

            }

          })


        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/addnewdsf/savestep1", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      let email = jwt.decode(req.query.authentification).data;

      query = `select Project_Country from sales_dsf_main_table where No=` + req.body.No;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json({
            added: false
          });
        } else {
          query = `INSERT INTO gnrl_sales_file_quotation

      (QUOT_DSF_Reference, QUOT_DSF_Project_Title,QUOT_Rev,
      QUOT_Added_on,QUOT_Type,QUOT_Company,
      QUOT_Added_By_Name,QUOT_Added_By_Code,QUOT_Added_By_Position,
      DSF_Client_Name,DSF_Receiver1_Name,DSF_Receiver1_Position,
      DSF_Receiver1_Tel,DSF_Receiver1_Mail,DSF_Receiver2_Name,
      DSF_Receiver2_Position,DSF_Receiver2_Tel,DSF_Receiver2_Mail,
      QUOT_Currency,QUOT_Status)

      VALUES

      ('` + req.body.DSF_Reference + `', '` + req.body.DSF_Title + `','A',
      Current_Timestamp,'Main Option',(select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
      (select concat_ws(' ',Employee_First_Name,Employee_Last_Name)
      from hr_emp_gnd
      where Professional_mail='` + email + `'),
      (select Employee_Code
        from hr_emp_gnd
        where Professional_mail = '` + email + `'),
        (select Position
        from hr_emp_gnd
        where Professional_mail = '` + email + `'),
    (select DSF_Client_Name from  sales_dsf_main_table where No=${req.body.No}
                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                          from sales_dsf_main_table
                                                                          where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person1_Name from  sales_dsf_main_table where No=${req.body.No}
                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                          from sales_dsf_main_table
                                                                          where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person1_Position from  sales_dsf_main_table where No=${req.body.No}
                                                                            && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                              from sales_dsf_main_table
                                                                                              where No=${req.body.No})) ,
    (select DSF_Client_Contact_Person1_Tel from  sales_dsf_main_table where  No=${req.body.No}
                                                                      && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                        from sales_dsf_main_table
                                                                                        where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person1_Mail from  sales_dsf_main_table where No=${req.body.No}
                                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                          from sales_dsf_main_table
                                                                                          where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person2_Name from  sales_dsf_main_table where No=${req.body.No}
                                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                          from sales_dsf_main_table
                                                                                          where No=${req.body.No})) ,
    (select DSF_Client_Contact_Person2_Position from  sales_dsf_main_table where No=${req.body.No}
                                                                            && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                              from sales_dsf_main_table
                                                                                              where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person2_Tel from  sales_dsf_main_table where No=${req.body.No}
                                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                          from sales_dsf_main_table
                                                                                          where No=${req.body.No})) ,
      (select DSF_Client_Contact_Person2_Mail from  sales_dsf_main_table where No=${req.body.No}
                                                                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                          from sales_dsf_main_table
                                                                                          where No=${req.body.No})) ,`
          if (rows[0] == 'Qatar')
            query += `'QAR'`;
          else
            query += `'USD'`;
          query += `,'Under Creation Step 1')`
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              id = rows.insertId;
              query = 'select Extract(YEAR From QUOT_Added_on) as year,Extract(Day From QUOT_Added_on) as day from gnrl_sales_file_quotation where No=' + id;
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json(err);
                } else {
                  query = `update gnrl_sales_file_quotation set
              QUOT_Ref=concat_ws('-',
                                (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                (select Employee_Trigram from hr_emp_gnd where Professional_mail='` + email + `'),
                                'Q',
                                '` + rows[0].year + `',
                                '` + rows[0].day + `',
                                '` + id + `',
                                'A'),
              QUOT_OP_MQOUOT=concat_ws('-',
                                (select Company_Acting_In from hr_emp_gnd where Professional_mail='` + email + `'),
                                (select Employee_Trigram from hr_emp_gnd where Professional_mail='` + email + `'),
                                'Q',
                                '` + rows[0].year + `',
                                '` + rows[0].day + `',
                                '` + id + `',
                                'A')
              where No=` + id;
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);

                      res.status(500).json({
                        added: false
                      });
                    } else {

                      query = `select QUOT_Added_on,QUOT_Ref from gnrl_sales_file_quotation where No=` + id
                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          res.status(500).json(err)
                        } else {
                          connection.release();
                          res.status(200).json({
                            added: true,
                            ref: rows[0].QUOT_Ref
                          });
                        }
                      })

                    }
                  })
                }
              })


            }
          });
        }
      });
    }

  });
});

app.post("/sales/salesfiles/directsalesfile/addnewdsf/savestep2", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `update gnrl_sales_file_quotation set
      QUOT_Subject='` + req.body.quotationSubject + `',
      Input_Data1_Ref='` + req.body.inputData1 + `'`;
      if (req.body.inputData2)
        query += `,Input_Data2_Ref='` + req.body.inputData2 + `'`
      if (req.body.inputData3)
        query += `,Input_Data3_Ref='` + req.body.inputData3 + `'`
      if (req.body.inputData4)
        query += `,Input_Data4_Ref='` + req.body.inputData4 + `'`
      if (req.body.inputData5)
        query += `,Input_Data5_Ref='` + req.body.inputData5 + `'`

      query += `,QUOT_Status='Under Creation Step 2'
      where QUOT_Ref='` + req.query.quotationRef + `';`;
      connection.query(query, (err, rows, fiels) => {
        if (err) {
          res.status(500).json({
            added: false
          });
        } else {
          connection.release();
          res.status(200).json({
            added: true
          });
        }
      });
    }
  });
});

app.post("/sales/salesfiles/directsalesfile/addnewdsf/savestep3", ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `INSERT INTO ` + '`sales-quot-items-details`' + `
      ( QUOT_Ref, SUPQUOT_Ref,Brand,
        Item_Ref, Item_Description, Item_Qty,
        Item_Unit_Cost, Item_Total_Cost,Supplier_Quotation_Currency,
        Supplier_Quotation_Incoterm
      )
      VALUES `;
      var unitCost;
      for (let product of req.body) {
        unitCost = parseInt(product.Item_Total_Cost) / parseInt(product.Item_Qty);

        query += `('` + req.query.ref + `','` + product.SUPQUOT_Ref + `','` + product.Brand + `',
      '` + product.Item_Ref + `','` + product.Item_Description + `',` + product.Item_Qty + `,
      ` + unitCost + `,` + product.Item_Total_Cost + `,'` + product.Supplier_Quotation_Currency + `',
      '` + product.Supplier_Quotation_Incoterm + `'),`;
      }
      query = query.substring(0, query.length - 1);

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          query = `update gnrl_sales_file_quotation set
            QUOT_Status='Under Creation Step 3'
            where QUOT_Ref='` + req.query.ref + `';`
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              connection.release();
              res.status(200).json({
                added: true
              });
            }
          });

        }
      });
      /*
        query+=`where QUOT_Ref='`+req.query.quotationRef+`';`;
        connection.query(query,(err,rows,fiels)=>{
          if(err){
            res.status(500).json({added:false});
          }else{
            connection.release();
      		res.status(200).json({added:true});
          }
        });*/
    }
  });
});
////////////////////////////////////////////////////////////////////////////////
function getINCF(supplierQuotation, quotation) {
  if (supplierQuotation == 'EXW') {
    if (quotation != 'EXW') {
      return 0.2;
    }
  } else if (supplierQuotation == 'FCA') {
    if (quotation != 'EXW' && quotation != 'FCA') {
      return 0.2;
    }
  } else if (supplierQuotation == 'FAS') {
    if (quotation != 'EXW' && quotation != 'FCA' && quotation != 'FAS') {
      return 0.2;
    }
  } else if (supplierQuotation == 'FOB') {
    if (quotation != 'EXW' && quotation != 'FCA' && quotation != 'FAS' && quotation != 'FOB') {
      return 0.2;
    }
  } else if (supplierQuotation == 'CFR') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR') {
      return 0.15;
    }
  } else if (supplierQuotation == 'CIF') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR' && quotation != 'CIF') {
      return 0.1;
    }
  } else if (supplierQuotation == 'CPT') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR' && quotation != 'CIF' &&
      quotation != 'CPT') {
      return 0.1;
    }
  } else if (supplierQuotation == 'CIP') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR' && quotation != 'CIF' &&
      quotation != 'CPT' && quotation != 'CIP') {
      return 0.1;
    }
  } else if (supplierQuotation == 'DAT') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR' && quotation != 'CIF' &&
      quotation != 'CPT' && quotation != 'CIP' && quotation != 'DAT') {
      return 0.1;
    }
  } else if (supplierQuotation == 'DAP') {
    if (quotation != 'EXW' && quotation != 'FCA' &&
      quotation != 'FAS' && quotation != 'FOB' && quotation != 'CFR' && quotation != 'CIF' &&
      quotation != 'CPT' && quotation != 'CIP' && quotation != 'DAT' && quotation != 'DAP') {
      return 0.1;
    }
  }

  return 1;
}

////////////////////////////////////////////////////////////////////////

async function cvRate(supplierQuotation, quotation, res) {

  if (quotation == supplierQuotation) {
    return 1;
  }
  query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='` + supplierQuotation + `'
        && To_Currency='` + quotation + `'`;
  connection.query(query, (err, rows, fields) => {
    if (err) {
      res.status(500).json(err);
    } else {
      if (rows[0]) {
        return rows[0].Multiplier;
      } else {

        query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='` + quotation + `'
        && To_Currency='` + supplierQuotation + `'`;
        connection.query(query, (err, rows, fields) => {
          if (err) {
            res.status(500).json(err);
          } else {
            if (rows[0]) {
              return 1 / rows[0].Multiplier;
            } else {
              return 1
            }
          }
        });
      }
    }
  });
}

/////////////////////////////////////////////////////////////////////////////////////////

async function quotationCost(quotationsInfos, quotationCurrency, quotationIncoterm, i, res, ref, margin, SEdiscount, connection) {

  query = '';
  var itemUnitCost = 0;
  var itemTotalCost = 0;
  var itemUnitSelling = 0;
  var itemTotalSelling = 0;
  //////////////////////////  Getting the cvRate//////////////////////////////////////////
  if (quotationCurrency == quotationsInfos[i].Supplier_Quotation_Currency) {
    conv = 1;
    ///////////////// calculating the total cost and selling////////////////////////////
    itemUnitCost = (quotationsInfos[i].Item_Unit_Cost * (1 + getINCF(quotationsInfos[i].Supplier_Quotation_Incoterm, quotationIncoterm)) * conv);
    itemTotalCost = itemUnitCost * quotationsInfos[i].Item_Qty;
    itemUnitSelling = itemUnitCost * (1 + margin + 0.2 - SEdiscount);
    itemTotalSelling = itemUnitSelling * quotationsInfos[i].Item_Qty;
    query = ` update ` + '`sales-quot-items-details`' + ` set
      Item_Unit_Cost=` + itemUnitCost.toFixed(3) + `,
      Item_Total_Cost=` + itemTotalCost.toFixed(3) + `,
      Item_Unit_Selling=` + itemUnitSelling.toFixed(3) + `,
      Item_Total_Selling=` + itemTotalSelling.toFixed(3) + `
      where No=` + quotationsInfos[i].No + ';';
    connection.query(query, (err, rows, fields) => {
      if (err) {
        res.status(500).json(err);
        console.log(err);
      } else {
        if (i + 1 < quotationsInfos.length) {
          quotationCost(quotationsInfos, quotationCurrency, quotationIncoterm, i + 1, res, ref, margin, SEdiscount, connection)
        } else {
          query = `select distinct(SUPQUOT_Ref)
                from ` + '`sales-quot-items-details`' + `
                where QUOT_Ref='` + ref + `'`;
          connection.query(query, (err, rows, fields) => {
            if (err) {
              res.status(500).json(err);
            } else {
              supplierQuotationTotalAmount(res, ref, rows, 0, connection);
            }
          })
        }
      }
    });
  }
  query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='` + quotationsInfos[i].Supplier_Quotation_Currency + `'
        && To_Currency='` + quotationCurrency + `'`;
  connection.query(query, (err, rows, fields) => {
    if (err) {
      res.status(500).json(err);
    } else {
      if (rows[0]) {

        conv = rows[0].Multiplier;

        ///////////////// calculating the total cost and selling////////////////////////////
        itemUnitCost = (quotationsInfos[i].Item_Unit_Cost * (1 + getINCF(quotationsInfos[i].Supplier_Quotation_Incoterm, quotationIncoterm)) * conv);

        itemTotalCost = itemUnitCost * quotationsInfos[i].Item_Qty;
        itemUnitSelling = itemUnitCost * (1 + margin + 0.2 - SEdiscount);
        itemTotalSelling = itemUnitSelling * quotationsInfos[i].Item_Qty;
        query = ` update ` + '`sales-quot-items-details`' + ` set
          Item_Unit_Cost=` + itemUnitCost.toFixed(3) + `,
          Item_Total_Cost=` + itemTotalCost.toFixed(3) + `,
          Item_Unit_Selling=` + itemUnitSelling.toFixed(3) + `,
          Item_Total_Selling=` + itemTotalSelling.toFixed(3) + `
          where No=` + quotationsInfos[i].No + ';';
        connection.query(query, (err, rows, fields) => {
          if (err) {
            res.status(500).json(err);
            console.log(err);
          } else {
            if (i + 1 < quotationsInfos.length) {
              quotationCost(quotationsInfos, quotationCurrency, quotationIncoterm, i + 1, res, ref, margin, SEdiscount, connection)
            } else {
              query = `select distinct(SUPQUOT_Ref)
                    from ` + '`sales-quot-items-details`' + `
                    where QUOT_Ref='` + ref + `'`;
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json(err);
                } else {
                  supplierQuotationTotalAmount(res, ref, rows, 0, connection);
                }
              })
            }
          }
        });
      } else {

        query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='` + quotationCurrency + `'
        && To_Currency='` + quotationsInfos[i].Supplier_Quotation_Currency + `'`;
        connection.query(query, (err, rows, fields) => {
          if (err) {
            res.status(500).json(err);
          } else {
            if (rows[0]) {
              conv = 1 / rows[0].Multiplier;
              ///////////////// calculating the total cost and selling////////////////////////////
              itemUnitCost = (quotationsInfos[i].Item_Unit_Cost * (1 +
                getINCF(quotationsInfos[i].Supplier_Quotation_Incoterm, quotationIncoterm)) * conv);
              itemTotalCost = itemUnitCost * quotationsInfos[i].Item_Qty;
              itemUnitSelling = itemUnitCost * (1 + margin + 0.2 - SEdiscount);
              itemTotalSelling = itemUnitSelling * quotationsInfos[i].Item_Qty;
              query = ` update ` + '`sales-quot-items-details`' + ` set
                Item_Unit_Cost=` + itemUnitCost.toFixed(3) + `,
                Item_Total_Cost=` + itemTotalCost.toFixed(3) + `,
                Item_Unit_Selling=` + itemUnitSelling.toFixed(3) + `,
                Item_Total_Selling=` + itemTotalSelling.toFixed(3) + `
                where No=` + quotationsInfos[i].No + ';';
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json(err);
                  console.log(err);
                } else {
                  if (i + 1 < quotationsInfos.length) {
                    quotationCost(quotationsInfos, quotationCurrency, quotationIncoterm, i + 1, res, ref, margin, SEdiscount, connection)
                  } else {
                    query = `select distinct(SUPQUOT_Ref)
                          from ` + '`sales-quot-items-details`' + `
                          where QUOT_Ref='` + ref + `'`;

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        res.status(500).json(err);
                      } else {
                        supplierQuotationTotalAmount(res, ref, rows, 0, connection);
                      }
                    })
                  }
                }
              });
            } else {
              conv = 1;
              ///////////////// calculating the total cost and selling////////////////////////////
              itemUnitCost = (quotationsInfos[i].Item_Unit_Cost * (1 +
                getINCF(quotationsInfos[i].Supplier_Quotation_Incoterm, quotationIncoterm)) * conv);
              itemTotalCost = itemUnitCost * quotationsInfos[i].Item_Qty;
              itemUnitSelling = itemUnitCost * (1 + margin + 0.2 - SEdiscount);
              itemTotalSelling = itemUnitSelling * quotationsInfos[i].Item_Qty;
              query = ` update ` + '`sales-quot-items-details`' + ` set
                Item_Unit_Cost=` + itemUnitCost.toFixed(3) + `,
                Item_Total_Cost=` + itemTotalCost.toFixed(3) + `,
                Item_Unit_Selling=` + itemUnitSelling.toFixed(3) + `,
                Item_Total_Selling=` + itemTotalSelling.toFixed(3) + `
                where No=` + quotationsInfos[i].No + ';';
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  res.status(500).json(err);
                  console.log(err);
                } else {
                  if (i + 1 < quotationsInfos.length) {
                    quotationCost(quotationsInfos, quotationCurrency, quotationIncoterm, i + 1, res, ref, margin, SEdiscount, connection)
                  } else {
                    query = `select distinct(SUPQUOT_Ref)
                          from ` + '`sales-quot-items-details`' + `
                          where QUOT_Ref='` + ref + `'`;
                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        res.status(500).json(err);
                      } else {
                        supplierQuotationTotalAmount(res, ref, rows, 0, connection);
                      }
                    })
                  }
                }
              });
            }
          }
        });
      }
    }
  });
  /////////////////////////////////////////////////////////////////


}

//////////////////////////////////////////////////////////////////////////////

function supplierQuotationTotalAmount(res, ref, sqRefTable, i, connection) {
  if (i < sqRefTable.length) {
    query = `update   sales_supquot_main_table set
        TotalAmount =Round((select SUM(Item_Total_Cost)
                    from sales_supquot_item_details
                    where SUPQUOT_Ref='` + sqRefTable[i].SUPQUOT_Ref + `'),3)
        where Ref ='` + sqRefTable[i].SUPQUOT_Ref + `';`
    connection.query(query, (err, rows, fields) => {
      if (err) {
        res.status(500).json(err);
      } else {
        supplierQuotationTotalAmount(res, ref, sqRefTable, i + 1, connection)
      }
    })
  } else {
    quotationTotalAmount(res, ref, connection);
  }

}

/////////////////////////////////////////////////////////////////////////////

async function quotationTotalAmount(res, ref, connection) {

  query = `update gnrl_sales_file_quotation set
        QUOT_Cost_USD=(select Round(SUM(Item_Total_Cost),3)
                      FROM ` + '`sales-quot-items-details`' + `
                      where QUOT_Ref='` + ref + `'),

        QUOT_Total_Amount_USD=(select Round(SUM(Item_Total_Selling),3)
                              FROM ` + '`sales-quot-items-details`' + `
                              where QUOT_Ref='` + ref + `')
        where QUOT_Ref='` + ref + `'`;

  connection.query(query, (err, rows, fields) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      query = `select QUOT_Total_Amount_USD,QUOT_Currency
            from gnrl_sales_file_quotation
            where QUOT_Ref='` + ref + `'`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err);
        } else {

          quotationTotalAmountUSD(rows, res, connection, ref);

        }
      })
    }
  });
}
////////////////////////////////////////////////////////////////////////////////////

async function quotationTotalAmountUSD(quotation, res, connection, ref) {

  QuotationTotalAmount = quotation[0].QUOT_Total_Amount_USD;
  conv = 1;
  ///////////////////////////////////////////////////////////////////////////////////
  /////////CVRATE

  if (quotation[0].QUOT_Currency == 'USD') {
    conv = 1;
    totalAmountComparison(QuotationTotalAmount.toFixed(3), res, ref, connection)
  }
  query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='` + quotation[0].QUOT_Currency + `'
        && To_Currency='USD'`;
  connection.query(query, (err, rows, fields) => {
    if (err) {
      res.status(500).json(err);
    } else {
      if (rows[0]) {
        conv = rows[0].Multiplier;
        QuotationTotalAmount *= conv;
        totalAmountComparison(QuotationTotalAmount.toFixed(3), res, ref, connection)
      } else {

        query = `select Multiplier
        from gnrl_currency_convert
        where From_Currency='USD'
        && To_Currency='` + quotation[0].QUOT_Currency + `'`;
        connection.query(query, (err, rows, fields) => {
          if (err) {
            res.status(500).json(err);
          } else {
            if (rows[0]) {
              conv = 1 / rows[0].Multiplier;
              QuotationTotalAmount *= conv;
              totalAmountComparison(QuotationTotalAmount.toFixed(3), res, ref, connection)
            } else {
              conv = 1
              QuotationTotalAmount *= conv;
              totalAmountComparison(QuotationTotalAmount.toFixed(3), res, ref, connection)
            }
          }
        });
      }
    }
  });
  /////////////////////////////////////////////
}

function totalAmountComparison(QuotationTotalAmount, res, ref, connection) {
  if (QuotationTotalAmount >= 275000) {

    query = `update gnrl_sales_file_quotation set
          QUOT_Type='Q3',
          QUOT_Status='Required SM & SD Approval',
          QUOT_Sales_Manager_Approval='Required',
          QUOT_Sales_Director_Approval='Required',
          QUOT_Expected_Margin=QUOT_Total_Amount_USD-QUOT_Cost_USD

          where QUOT_Ref='` + ref + `'`;
  } else if (QuotationTotalAmount < 275000 && QuotationTotalAmount >= 140000) {
    query = `update gnrl_sales_file_quotation set
          QUOT_Type='Q2',
          QUOT_Status='Required SM Approval',
          QUOT_Sales_Manager_Approval='Required',
          QUOT_Sales_Director_Approval='Not Required',
          QUOT_Expected_Margin=QUOT_Total_Amount_USD-QUOT_Cost_USD
          where QUOT_Ref='` + ref + `'`;
  } else {
    query = `update gnrl_sales_file_quotation set
          QUOT_Type='Q1',
          QUOT_Status='Ready',
          QUOT_Sales_Manager_Approval='Not Required',
          QUOT_Sales_Director_Approval='Not Required',
          QUOT_Expected_Margin=QUOT_Total_Amount_USD-QUOT_Cost_USD

          where QUOT_Ref='` + ref + `'`;
  }
  connection.query(query, (err, rows, fields) => {
    if (err) {
      res.status(500).json(err);
    } else {
      var mailOptions = {
        from: 'notification@kgtc.net',
        to: 'c.benslama2012@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'There is a new quotation created, Please check your Task-Dashboard.'
      }


      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent ' + info.response);
          if (QuotationTotalAmount < 140000) {
            query = `INSERT INTO act_dashboard
            (Action_Type, File_Type, File_Ref,
              Required_Action, Responsible_Code, Responsible_Name,
              Responsible_Position, Responsible_Department, Responsible_Division,
              Action_Status, Action_Closed_On, Action_Deadline,
              Action_Delay)
              VALUES
              ('Workflow', 'DSF', (select QUOT_DSF_Reference
                                  from gnrl_sales_file_quotation
                                  where QUOT_Ref='` + ref + `'),
              'Send the Quotation Ref.` + ref + ` to the Client', (select DSF_Incharge_Code
                                                              from sales_dsf_main_table
                                                              where DSF_Reference=(select QUOT_DSF_Reference
                                                                                  from gnrl_sales_file_quotation
                                                                                  where QUOT_Ref='` + ref + `')
                                                              && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                from sales_dsf_main_table
                                                                                where DSF_Reference=(select QUOT_DSF_Reference
                                                                                                      from gnrl_sales_file_quotation
                                                                                                      where QUOT_Ref='` + ref + `'))), (select DSF_Incharge_Name
                                                                from sales_dsf_main_table
                                                                where DSF_Reference=(select QUOT_DSF_Reference
                                                                                    from gnrl_sales_file_quotation
                                                                                    where QUOT_Ref='` + ref + `')
                                                                && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                                                    from sales_dsf_main_table
                                                                                    where DSF_Reference=(select QUOT_DSF_Reference
                                                                                      from gnrl_sales_file_quotation
                                                                                      where QUOT_Ref='` + ref + `'))
                                                              ),
              (select DSF_Incharge_Position
              from sales_dsf_main_table
              where DSF_Reference=(select QUOT_DSF_Reference
                                  from gnrl_sales_file_quotation
                                  where QUOT_Ref='` + ref + `')
              && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                from sales_dsf_main_table
                                where DSF_Reference=(select QUOT_DSF_Reference
                                                      from gnrl_sales_file_quotation
                                                      where QUOT_Ref='` + ref + `'))
                    ),(select Department
                      from hr_emp_gnd
                      where Employee_Code=(select DSF_Incharge_Code
                        from sales_dsf_main_table
                        where DSF_Reference=(select QUOT_DSF_Reference
                                            from gnrl_sales_file_quotation
                                            where QUOT_Ref='` + ref + `')
                        && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                          from sales_dsf_main_table
                                          where DSF_Reference=(select QUOT_DSF_Reference
                                                                from gnrl_sales_file_quotation
                                                                where QUOT_Ref='` + ref + `'))
                      )),(select Division
                        from hr_emp_gnd
                        where Employee_Code=(select DSF_Incharge_Code
                          from sales_dsf_main_table
                          where DSF_Reference=(select QUOT_DSF_Reference
                                              from gnrl_sales_file_quotation
                                              where QUOT_Ref='` + ref + `')
                          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                          from sales_dsf_main_table
                          where DSF_Reference=(select QUOT_DSF_Reference
                                                from gnrl_sales_file_quotation
                                                where QUOT_Ref='` + ref + `'))
                        )),
               'On Going', '2000-01-01 00:00:00.000000', (select DSF_Deadline
                                                          from sales_dsf_main_table
                                                          where DSF_Reference=(select QUOT_DSF_Reference
                                                                              from gnrl_sales_file_quotation
                                                                              where QUOT_Ref='` + ref + `'
                                                                              )
                                                          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                          from sales_dsf_main_table
                                                          where DSF_Reference=(select QUOT_DSF_Reference
                                                                                from gnrl_sales_file_quotation
                                                                                where QUOT_Ref='` + ref + `'))
                                                          ),
              (SELECT DATEDIFF(Current_TimeStamp, (select DSF_Deadline
                                                  from sales_dsf_main_table
                                                  where DSF_Reference=(select QUOT_DSF_Reference
                                                                      from gnrl_sales_file_quotation
                                                                      where QUOT_Ref='` + ref + `'
                                                                      )
                                                  && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                            from sales_dsf_main_table
                                                            where DSF_Reference=(select QUOT_DSF_Reference
                                                                                  from gnrl_sales_file_quotation
                                                                                  where QUOT_Ref='` + ref + `'))
                                                  )) AS days));`
          } else {
            query = `INSERT INTO act_dashboard
            (Action_Type, File_Type, File_Ref,
              Required_Action, Responsible_Code, Responsible_Name,
              Responsible_Position, Responsible_Department, Responsible_Division,
              Action_Status, Action_Closed_On, Action_Deadline,
              Action_Delay)
              VALUES
              ('Workflow', 'DSF', (select QUOT_DSF_Reference
                                  from gnrl_sales_file_quotation
                                  where QUOT_Ref='` + ref + `'),
              'Approval of the Quotation Ref.` + ref + ` ', (select Employee_Code
                                                        from  hr_emp_gnd
                                                        where Position='Sales Manager'
                                                        ),(select concat_ws(' ',Employee_First_Name,Employee_Last_Name)
                                                          from  hr_emp_gnd
                                                          where Position='Sales Manager'
                                                          ),
              'Sales Manager','FM & MEP Trading','FM & MEP Trading',
               'On Going', '2000-01-01 00:00:00.000000', (select DSF_Deadline
                                                          from sales_dsf_main_table
                                                          where DSF_Reference=(select QUOT_DSF_Reference
                                                                              from gnrl_sales_file_quotation
                                                                              where QUOT_Ref='` + ref + `'
                                                                              )
                                                          && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                            from sales_dsf_main_table
                                                            where DSF_Reference=(select QUOT_DSF_Reference
                                                                                  from gnrl_sales_file_quotation
                                                                                  where QUOT_Ref='` + ref + `'))
                                                          ),
              (SELECT DATEDIFF(Current_TimeStamp, (select DSF_Deadline
                                                  from sales_dsf_main_table
                                                  where DSF_Reference=(select QUOT_DSF_Reference
                                                                      from gnrl_sales_file_quotation
                                                                      where QUOT_Ref='` + ref + `'
                                                                      )
                                                  && DSF_Added_on = (select max(DSF_Added_on) as DSF_Added_on
                                                            from sales_dsf_main_table
                                                            where DSF_Reference=(select QUOT_DSF_Reference
                                                                                  from gnrl_sales_file_quotation
                                                                                  where QUOT_Ref='` + ref + `'))
                                                  )) AS days));`
          }
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              res.status(200).json({
                added: true
              });
              connection.release();
            }
          })
        }
      })

    }
  });
}

////////////////////////////////////////////////////////////////////////////////////

app.post("/sales/salesfiles/directsalesfile/quotations/savemainquotation", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `update gnrl_sales_file_quotation set
      Payment1_Percentage='` + parseInt(req.body.percentage1).toFixed(3) + `',
      Payment1_Description='` + req.body.description1 + `',
      Payment2_Percentage='` + parseInt(req.body.percentage2).toFixed(3) + `',
      Payment2_Description='` + req.body.description2 + `',
      QUOT_Discount_By_SE='` + parseInt(req.body.discount).toFixed(3) + `',
      QUOT_Discount_By_SM='0',
      QUOT_Discount_By_SD='0',
      QUOT_Incoterms='` + req.body.incoterms + `',
      QUOT_Additional_Margin='` + parseInt(req.body.margin).toFixed(3) + `',
      QUOT_Currency='` + req.body.currency + `'

      where QUOT_Ref='` + req.query.ref + `';`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          res.status(500).json(err)
        } else {
          query = `select QUOT_Currency,QUOT_Incoterms,QUOT_Additional_Margin,QUOT_Discount_By_SE
          from  gnrl_sales_file_quotation
          where QUOT_Ref='` + req.query.ref + `'`

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              var quotationCurrency = rows[0].QUOT_Currency;
              var quotationIncoterm = rows[0].QUOT_Incoterms;
              var margin = rows[0].QUOT_Additional_Margin;
              var SEdiscount = rows[0].QUOT_Discount_By_SE;

              query = `select No,Item_Qty,Item_Unit_Cost,Supplier_Quotation_Incoterm,Supplier_Quotation_Currency
                    from ` + '`sales-quot-items-details`' + `
                    where QUOT_Ref='` + req.query.ref + `'`;
              connection.query(query, async (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  quotationCost(rows, quotationCurrency, quotationIncoterm, 0, res, req.query.ref, margin, SEdiscount, connection);
                }
              });
            }
          });
        }
      });
    }
  })
});


app.post("/sales/salesfiles/directsalesfile/quotations/savemainquotation/existanceofiteminquotation", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select No
        from ` + '`sales-quot-items-details`' + `
        where SUPQUOT_Ref='` + req.body.sqRef + `'
        && Item_Ref='` + req.body.itemRef + `'
        && Item_Description='` + req.body.itemDescription + `'
        `
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err)
          res.status(500).json(err);
        } else {
          if (rows[0]) {
            connection.release();
            res.status(200).json({
              exist: true
            });
          } else {
            connection.release();
            res.status(200).json({
              exist: false
            });
          }
        }
      });
    }

  })
});
app.get("/getPool", (req, res) => {
  res.json({
    limit: pool.config.connectionLimit,
    freeConnection: pool._freeConnections.length,
    allConnections: pool._allConnections.length,
    aquiringConnection: pool._acquiringConnections.length
  })
})
/***********************************************************************
 * ***********************Map
 */
app.get("/map/mapinfos", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select 	DSF_Title,DSF_Reference,lat,lng
          from sales_dsf_main_table`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/ClientConsultantList', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(ConsultantID),ConsultantName from consultant_main_table
    `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/salesmeetingUpdate/BuildingType', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Building_Type_ID),Building_Type from general_building_type
    `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/salesmeetingUpdate/ACSystems', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(AC_System_ID ),AC_System from general_ac_system
    `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/salesmeetingUpdate/Competitor', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select Competitor_ID,Brand_Name from general_competitor
    `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/ContactList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(ContactPersonID),ContactPersonName from client_contact_person
      where ClientID=${req.query.ClientID} `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/QuotationRefList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Quotation_ID),Quotation_Type from sales_quotation_main_table `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/ComplainRefList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Complain_ID),Complain_Type from client_complain_table `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/clientclientList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(ClientID),ClientName from client_main_table `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/getMCSelectionList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Selection_Criteria_ID  ),Selection_Criteria from general_client_selection_criteria `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/ClientListContacted', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err)
      res.status(500).json(err)
    } else {

      query = `select distinct(ContactPersonID),ConsultantID,ContactPersonName from consultant_contact_person
      where ConsultantID=${req.query.ConsultantID}

    `;





      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});

app.get('/sales/salesfiles/salesmeeting/addnewsalesmeeting/CustomerPotentialTypeList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Selection_Potential_Type_ID),Selection_Potential_Type from general_client_potential_type`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
////////////////////////////////////////////////////Project List //////////////////////////////////////
app.get('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/ProjectList', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select JIH_ID,Project_Title,Project_Type,Project_Consultant,Consultant_Status,Expected_Budget_USD from sales_meeting_jih
      where  Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
////////////////////////////////////////////////////Delete Sales Meeting //////////////////////////////////////
app.delete('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/DeleteSalesMeeting', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `delete from sales_meeting_selection_criteria_vendor_list
      where General_Selection_Criteria_ID in (select General_Selection_Criteria_ID  from sales_meeting_selection_criteria
        where Sales_Meeting_ID=${req.query.Sales_Meeting_ID} )`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          query = `delete from sales_meeting_selection_criteria_country
          where GSC_ID in (select General_Selection_Criteria_ID  from sales_meeting_selection_criteria
            where Sales_Meeting_ID=${req.query.Sales_Meeting_ID} )`;




          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {

              query = `delete from sales_meeting_selection_criteria
      where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;




              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {


                  query = `delete from sales_meeting_update
                      where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      query = `delete from sales_meeting_result_will_send_inquiry
                          where Meeting_Result_ID = ( select Meeting_Result_ID from sales_meeting_result
                             where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {

                          query = `delete from sales_meeting_result12
                          where Meeting_Result_ID = ( select Meeting_Result_ID from sales_meeting_result
                             where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                          connection.query(query, (err, rows, fields) => {
                            if (err) {
                              console.log(err);
                              res.status(500).json(err);
                            } else {
                              query = `delete from sales_meeting_result
                              where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  console.log(err);
                                  res.status(500).json(err);
                                } else {
                                  query = `delete from sales_meeting_jih_ac_system
                                  where JIH_ID in
                                  (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                                  connection.query(query, (err, rows, fields) => {
                                    if (err) {
                                      console.log(err);
                                      res.status(500).json(err);
                                    } else {
                                      query = `delete from sales_meeting_jih_building_type
                                      where JIH_ID in
                                      (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                                      connection.query(query, (err, rows, fields) => {
                                        if (err) {
                                          console.log(err);
                                          res.status(500).json(err);
                                        } else {
                                          query = `delete from sales_meeting_jih_competitor
                                          where JIH_ID in
                                          (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                                          connection.query(query, (err, rows, fields) => {
                                            if (err) {
                                              console.log(err);
                                              res.status(500).json(err);
                                            } else {
                                              query = `delete from sales_meeting_jih_project_location
                                              where JIH_ID in
                                              (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                                              connection.query(query, (err, rows, fields) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.status(500).json(err);
                                                } else {
                                                  query = `delete from sales_meeting_jih_selection_criteria_country
                                                  where JIH_SC_ID in
                                                  ( select JIH_Selection_Criteria_ID from sales_meeting_jih_selection_criteria where
                                                    JIH_ID in (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}))`;

                                                  connection.query(query, (err, rows, fields) => {
                                                    if (err) {
                                                      console.log(err);
                                                      res.status(500).json(err);
                                                    } else {
                                                      query = `delete from sales_meeting_jih_selection_criteria
                                                          where JIH_ID in
                                                                   (select JIH_ID from sales_meeting_jih where Sales_Meeting_ID=${req.query.Sales_Meeting_ID})`;

                                                      connection.query(query, (err, rows, fields) => {
                                                        if (err) {
                                                          console.log(err);
                                                          res.status(500).json(err);
                                                        } else {
                                                          query = `delete from sales_meeting_jih
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                          connection.query(query, (err, rows, fields) => {
                                                            if (err) {
                                                              console.log(err);
                                                              res.status(500).json(err);
                                                            } else {
                                                              query = `delete from sales_meeting_schedule
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                              connection.query(query, (err, rows, fields) => {
                                                                if (err) {
                                                                  console.log(err);
                                                                  res.status(500).json(err);
                                                                } else {

                                                                  query = `delete from sales_meeting_quotation
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                  connection.query(query, (err, rows, fields) => {
                                                                    if (err) {
                                                                      console.log(err);
                                                                      res.status(500).json(err);
                                                                    } else {


                                                                      query = `delete from sales_meeting_potential_type
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                      connection.query(query, (err, rows, fields) => {
                                                                        if (err) {
                                                                          console.log(err);
                                                                          res.status(500).json(err);
                                                                        } else {

                                                                          query = `delete from sales_meeting_other_reason
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                          connection.query(query, (err, rows, fields) => {
                                                                            if (err) {
                                                                              console.log(err);
                                                                              res.status(500).json(err);
                                                                            } else {
                                                                              query = `delete from sales_meeting_held_on
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                              connection.query(query, (err, rows, fields) => {
                                                                                if (err) {
                                                                                  console.log(err);
                                                                                  res.status(500).json(err);
                                                                                } else {

                                                                                  query = `delete from sales_meeting_contact_person
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                                  connection.query(query, (err, rows, fields) => {
                                                                                    if (err) {
                                                                                      console.log(err);
                                                                                      res.status(500).json(err);
                                                                                    } else {
                                                                                      query = `delete from sales_meeting_complain
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                                      connection.query(query, (err, rows, fields) => {
                                                                                        if (err) {
                                                                                          console.log(err);
                                                                                          res.status(500).json(err);
                                                                                        } else {

                                                                                          query = `delete from sales_meeting_main_table
                                                          where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                                                                                          connection.query(query, (err, rows, fields) => {
                                                                                            if (err) {
                                                                                              console.log(err);
                                                                                              res.status(500).json(err);
                                                                                            } else {

                                                                                              connection.release();
                                                                                              res.status(200).json({
                                                                                                deleted: true
                                                                                              });
                                                                                            }
                                                                                          });
                                                                                        }
                                                                                      });
                                                                                    }
                                                                                  });
                                                                                }
                                                                              });
                                                                            }
                                                                          });
                                                                        }
                                                                      });
                                                                    }
                                                                  });
                                                                }
                                                              });
                                                            }
                                                          });
                                                        }
                                                      });
                                                    }
                                                  });
                                                }
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});
////////////////////////////////////////////////////delete selection criteria //////////////////////////////////////
app.delete('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/DeleteSC', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `delete from sales_meeting_selection_criteria_vendor_list
      where General_Selection_Criteria_ID=${req.query.SC_ID}`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          query = `delete from sales_meeting_selection_criteria_country
          where GSC_ID=${req.query.SC_ID}`;




          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {

              query = `delete from sales_meeting_selection_criteria
      where Sales_Meeting_ID=${req.query.Sales_Meeting_ID} &&
      General_Selection_Criteria_ID =${req.query.SC_ID}`;




              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {

                  connection.release();
                  res.status(200).json({
                    deleted: true
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});
////////////////////////////////////////////////////Project Delete /////////////////////////////////////////////
app.delete('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/DeleteProject', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `delete from sales_meeting_jih_ac_system
      where JIH_ID=${req.query.Project_ID}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          query = `delete from sales_meeting_jih_building_type
      where JIH_ID=${req.query.Project_ID}`;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              query = `delete from sales_meeting_jih_competitor
      where JIH_ID=${req.query.Project_ID}`;

              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {

                  query = `delete from sales_meeting_jih_project_location
      where JIH_ID=${req.query.Project_ID}`;

                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      query = `delete from sales_meeting_jih_selection_criteria
      where JIH_ID=${req.query.Project_ID}`;

                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {
                          query = `delete from sales_meeting_jih_selection_criteria_country
      where JIH_SC_ID=(select JIH_Selection_Criteria_ID from sales_meeting_jih_selection_criteria where JIH_ID=${req.query.Project_ID})`;

                          connection.query(query, (err, rows, fields) => {
                            if (err) {
                              console.log(err);
                              res.status(500).json(err);
                            } else {
                              query = `delete from sales_meeting_jih
      where Sales_Meeting_ID=${req.query.Sales_Meeting_ID} &&
      JIH_ID=${req.query.Project_ID}`;

                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  console.log(err);
                                  res.status(500).json(err);
                                } else {

                                  connection.release();
                                  res.status(200).json({
                                    deleted: true
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

  });
});
////////////////////////////////////////////////////Country of Origin List //////////////////////////////////////
app.get('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/CountryOfOrigin', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select COF_ID,Country_Of_Origin from general_country_of_origin`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Meeting Resullt //////////////////////////////////////
app.get('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/MeetingResult', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Selection_SM_Result_ID),Selection_SM_Result from general_sales_meeting_result`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
////////////////////////////////////////////////////Meeting Resullt //////////////////////////////////////
app.get('/sales/salesfiles/Directsales/Quotation/QuotAmount', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select QUOT_Status,SUM(QUOT_Total_Amount_USD*3.64) as QUOTSUM from gnrl_sales_file_quotation`




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Meeting Resullt //////////////////////////////////////
app.get('/sales/salesfiles/Directsales/Quotation/QuotWon', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `SELECT COUNT(QUOT_Status) AS won  FROM gnrl_sales_file_quotation WHERE QUOT_Status='Won'`




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Meeting Resullt //////////////////////////////////////
app.get('/sales/salesfiles/Directsales/Quotation/QuotLoss', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `SELECT COUNT(QUOT_Status) AS Loss  FROM gnrl_sales_file_quotation WHERE QUOT_Status='Loss'`




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Meeting Resullt //////////////////////////////////////
app.get('/sales/salesfiles/Directsales/Quotation/QuotOnGoing', ensureToken, (req, res) => {
  console.log("teeeeeeeeeeeeeeeeeeeest")
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `SELECT COUNT(QUOT_Status) AS OnGoing  FROM gnrl_sales_file_quotation WHERE QUOT_Status='On Going'`




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////Meeting Resullt Main Reason //////////////////////////////////////
app.get('/sales/salesfiles/salesmeeting/UpdateSalesMeeting/MeetingRMainREason', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select distinct(Selection_PO_Reason_ID),Selection_PO_Reason from general_po_reason`;




      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/sales/salesfiles/salesmeeting/addnewsalesmeeting', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)


    } else {

      var email = jwt.decode(req.query.authentification).data;
      query = `INSERT INTO sales_meeting_main_table (SM_Added_By,Meeting_Way,Meeting_Location,Customer_Type,Company_ref,Meeting_Purpose) VALUES

      ((select EmployeeID
      from hr_employee_general_data
      where ProfessionalMail='` + email + `'),'` + req.body.ContactedBy + `','` + req.body.MeetingLocation + `','` + req.body.CustomerType + `'`
      if (req.body.ContactPersonType == 1) {
        query += `,` + req.body.clientConsultant
      }
      if (req.body.ContactPersonType == 2) {
        query += `,` + req.body.clientClient
      }
      if (req.body.PresKGTC) {
        query += ",'PresKGTC"
        if (req.body.DiscussComplain) {
          query += ",DiscussComplain"
        }
        if (req.body.DiscussCurrentQuot) {
          query += ",DiscussCurrentQuot"
        }
        if (req.body.TechnicalSupp) {
          query += ",TechnicalSupp"
        }

      }
      if (req.body.DiscussComplain && !req.body.PresKGTC) {
        query += ",'DiscussComplain"
        if (req.body.DiscussCurrentQuot) {
          query += ",DiscussCurrentQuot"
        }
        if (req.body.TechnicalSupp) {
          query += ",TechnicalSupp"
        }

      }
      if (req.body.DiscussCurrentQuot && !req.body.DiscussComplain && !req.body.PresKGTC) {
        query += ",'DiscussCurrentQuot"
        if (req.body.TechnicalSupp) {
          query += ",TechnicalSupp"
        }
      }
      if (req.body.TechnicalSupp && !req.body.DiscussCurrentQuot && !req.body.DiscussComplain && !req.body.PresKGTC) {
        query += ",'TechnicalSupp"
      }
      if (req.body.Others) {
        query += ",'Others"

      }

      query += "');";


      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);

        } else {

          id = rows.insertId;
          if (req.body.DiscussCurrentQuot) {
            query = ` INSERT INTO sales_meeting_quotation (Sales_Meeting_ID,Quotation_ID) VALUES
          ('${id}','` + req.body.QuotationRef + `')`

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);

              } else {
                query = ` INSERT INTO sales_meeting_schedule (Sales_Meeting_ID,Scheduled_Date) VALUES
            ('${id}','` + req.body.MeetingDate + `')`
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);

                  } else {
                    if (req.body.ContactPersonType == 2) {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
                ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }
                    } else {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
                    ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }

                    }
                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);

                      } else {
                        query = ` INSERT INTO sales_meeting_potential_type (Sales_Meeting_ID,Potential_Type_ID) VALUES
                ('${id}','` + req.body.CustomerPotentialType + `')`

                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);

                          } else {
                            if (req.body.DiscussComplain) {
                              query = ` INSERT INTO sales_meeting_complain (Sales_Meeting_ID,Complain_ID) VALUES
                                 ('${id}','` + req.body.ComplainRef + `')`

                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  console.log(err);

                                } else {
                                  connection.release();
                                  res.status(200).json({
                                    created: true
                                  });
                                }
                              })
                            } else {
                              connection.release();
                              res.status(200).json({
                                created: true
                              });
                            }
                          }

                        })


                      }
                    })


                  }
                })
              } ///////////////////////

            })
          }
          ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          if (req.body.DiscussComplain && !req.body.DiscussCurrentQuot) {
            query = ` INSERT INTO sales_meeting_complain (Sales_Meeting_ID,Complain_ID) VALUES
                     ('${id}','` + req.body.ComplainRef + `')`

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);

              } else {
                query = ` INSERT INTO sales_meeting_schedule (Sales_Meeting_ID,Scheduled_Date) VALUES
      ('${id}','` + req.body.MeetingDate + `')`
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);

                  } else {
                    if (req.body.ContactPersonType == 2) {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
          ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }
                    } else {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
              ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }

                    }
                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);

                      } else {
                        query = ` INSERT INTO sales_meeting_potential_type (Sales_Meeting_ID,Potential_Type_ID) VALUES
          ('${id}','` + req.body.CustomerPotentialType + `')`

                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);

                          } else {


                            connection.release();
                            res.status(200).json({
                              created: true
                            });


                          }

                        })


                      }
                    })


                  }
                })
              } ///////////////////////

            })
          }
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
          if (req.body.Others) {
            query = ` INSERT INTO sales_meeting_other_reason (Sales_Meeting_ID,Reason) VALUES
                        ('${id}','` + req.body.SpecifyAll[0].Specify + `')`
            for (var i = 1; i < req.body.SpecifyAll.length; i++) {
              query += `,('${id}','` + req.body.SpecifyAll[i].Specify + `')`
            }

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);

              } else {
                query = ` INSERT INTO sales_meeting_schedule (Sales_Meeting_ID,Scheduled_Date) VALUES
      ('${id}','` + req.body.MeetingDate + `')`
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);

                  } else {
                    if (req.body.ContactPersonType == 2) {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
          ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }
                    } else {
                      query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
              ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                      for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                        query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                      }

                    }
                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);

                      } else {
                        query = ` INSERT INTO sales_meeting_potential_type (Sales_Meeting_ID,Potential_Type_ID) VALUES
          ('${id}','` + req.body.CustomerPotentialType + `')`

                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);

                          } else {


                            connection.release();
                            res.status(200).json({
                              created: true
                            });


                          }

                        })


                      }
                    })


                  }
                })
              } ///////////////////////

            })
          }
          if (!req.body.Others && !req.body.DiscussComplain && !req.body.DiscussCurrentQuot) {
            query = ` INSERT INTO sales_meeting_schedule (Sales_Meeting_ID,Scheduled_Date) VALUES
            ('${id}','` + req.body.MeetingDate + `')`
            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);

              } else {
                if (req.body.ContactPersonType == 2) {
                  query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
                ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                  for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                    query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                  }
                } else {
                  query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
                    ('${id}','` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                  for (var i = 1; i < req.body.contactClientPersons.length; i++) {
                    query += `,('${id}','` + req.body.contactClientPersons[i].ContactClient + `','` + req.body.ContactPersonType + `')`
                  }

                }
                connection.query(query, (err, rows, fields) => {
                  if (err) {
                    console.log(err);

                  } else {
                    query = ` INSERT INTO sales_meeting_potential_type (Sales_Meeting_ID,Potential_Type_ID) VALUES
                    ('${id}','` + req.body.CustomerPotentialType + `')`


                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);

                      } else {

                        connection.release();
                        res.status(200).json({
                          created: true
                        });
                      }
                    })


                    /////
                  }
                })


              }
            })

          }

        } ////
      });
    }
  });
});
// //////////////////////////////////////////////////////List Sales Meeting /////////////////////////////////////////////////////////////////
app.get("/sales/salesfiles/salesmeeting/salesmeetingdahboard/salesmeetinglist", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select sales_meeting_main_table.Sales_Meeting_ID,SM_Added_On,SM_Added_By,Meeting_Location,Closing_Date,Customer_Type,Meeting_Purpose,ConsultantName as Company_Ref,Scheduled_Date
      from sales_meeting_main_table,sales_meeting_schedule,consultant_main_table
      where sales_meeting_main_table.Sales_Meeting_ID=sales_meeting_schedule.Sales_Meeting_ID
      && ConsultantID =sales_meeting_main_table.Company_Ref
      && (select distinct(Contact_Person_Type) from sales_meeting_contact_person where
            sales_meeting_contact_person.Sales_Meeting_ID=sales_meeting_main_table.Sales_Meeting_ID)=1`
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          let list = rows;
          query = `select sales_meeting_main_table.Sales_Meeting_ID,SM_Added_On,SM_Added_By,Meeting_Location,Closing_Date,Customer_Type,Meeting_Purpose,ClientName as Company_Ref,Scheduled_Date
            from sales_meeting_main_table,sales_meeting_schedule,client_main_table
            where sales_meeting_main_table.Sales_Meeting_ID=sales_meeting_schedule.Sales_Meeting_ID
            && ClientID =sales_meeting_main_table.Company_Ref
            && (select distinct(Contact_Person_Type) from sales_meeting_contact_person where
            sales_meeting_contact_person.Sales_Meeting_ID=sales_meeting_main_table.Sales_Meeting_ID)=2`
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json({
                get: false
              });
            } else {
              list = [...list, ...rows]

              connection.release();
              res.status(200).json(list);
            }
          });
        }
      });
    }
  })
});
/////////////////////////////////////////////////////Send Project Sales Meeting/////////////////////////////////
app.get('/sales/salesfiles/SalesMeeting/SalesMeetingDeshboard/ShowSalesMeeting', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `select sales_meeting_main_table.Sales_Meeting_ID ,SM_Added_On,SM_Added_By,Meeting_Way,
                  Meeting_Location,Closing_Date,Comment,Customer_Type,Meeting_Purpose,Company_Ref,Scheduled_Date,Contact_Person_Type
          from sales_meeting_main_table,sales_meeting_schedule,sales_meeting_contact_person
            where sales_meeting_main_table.Sales_Meeting_ID='` + req.query.Sales_Meeting_ID + `' &&
            sales_meeting_schedule.Sales_Meeting_ID='` + req.query.Sales_Meeting_ID + `' &&
            sales_meeting_contact_person.Sales_Meeting_ID='` + req.query.Sales_Meeting_ID + `'
            `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          var Sales = [];
          Sales[0] = rows;
          query = `select Quotation_Type
        from sales_quotation_main_table
        INNER JOIN sales_meeting_quotation ON sales_quotation_main_table.Quotation_ID=sales_meeting_quotation.Quotation_ID
         WHERE sales_meeting_quotation.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}


            `;
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
              Sales[1] = rows;
              //   connection.release();
              // res.status(200).json(Sales);
              //  query=`select Selection_Potential_Type
              //     from general_client_potential_type,sales_meeting_potential_type
              //     where
              //       sales_meeting_potential_type.Sales_Meeting_ID=${req.query.Sales_Meeting_ID} &&
              //       sales_meeting_potential_type.Potential_Type_ID=general_client_potential_type.Selection_Potential_Type_ID
              //       `;
              query = `select Potential_Type_ID
           from sales_meeting_potential_type
           where
             sales_meeting_potential_type.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}

            `;
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {
                  Sales[2] = rows;


                  query = `
              select Contact_Person_ID,Contact_Person_Type
        from sales_meeting_contact_person

         WHERE sales_meeting_contact_person.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}

            `;
                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      Sales[3] = rows;

                      query = `
              select Contact_Person_ID
        from sales_meeting_contact_person
         WHERE sales_meeting_contact_person.Sales_Meeting_ID=${req.query.Sales_Meeting_ID} && Contact_Person_Type=2

            `;
                      connection.query(query, (err, rows, fields) => {
                        if (err) {
                          console.log(err);
                          res.status(500).json(err);
                        } else {
                          Sales[4] = rows;
                          query = `
        select Reason
        from sales_meeting_other_reason
         WHERE sales_meeting_other_reason.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
            `;
                          connection.query(query, (err, rows, fields) => {
                            if (err) {
                              console.log(err);
                              res.status(500).json(err);
                            } else {
                              Sales[5] = rows;
                              query = `
              select Complain_Type
        from client_complain_table
        INNER JOIN sales_meeting_complain ON client_complain_table.Complain_ID=sales_meeting_complain.Complain_ID
         WHERE sales_meeting_complain.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}

            `;
                              connection.query(query, (err, rows, fields) => {
                                if (err) {
                                  console.log(err);
                                  res.status(500).json(err);
                                } else {
                                  Sales[6] = rows;

                                  query = `
              select Selection_Criteria_ID
        from sales_meeting_selection_criteria
         WHERE sales_meeting_selection_criteria.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}

            `;
                                  connection.query(query, (err, rows, fields) => {
                                    if (err) {
                                      console.log(err);
                                      res.status(500).json(err);
                                    } else {
                                      Sales[7] = rows;

                                      query = `
                                                select Brand_Name
                                          from sales_meeting_selection_criteria_vendor_list
                                           WHERE sales_meeting_selection_criteria_vendor_list.General_Selection_Criteria_ID
                                           =(select Selection_Criteria_ID from sales_meeting_selection_criteria where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
                                            && Selection_Criteria_ID=2 )

                                              `;
                                      connection.query(query, (err, rows, fields) => {
                                        if (err) {
                                          console.log(err);
                                          res.status(500).json(err);
                                        } else {

                                          Sales[8] = rows;
                                          query = `
                                                select Country_ID
                                          from sales_meeting_selection_criteria_country

                                           WHERE sales_meeting_selection_criteria_country.GSC_ID=(select Selection_Criteria_ID from sales_meeting_selection_criteria where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
                                            && Selection_Criteria_ID=4 )

                                              `;
                                          connection.query(query, (err, rows, fields) => {
                                            if (err) {
                                              console.log(err);
                                              res.status(500).json(err);
                                            } else {

                                              Sales[9] = rows;
                                              query = `
                                          select Result_ID
                                    from sales_meeting_result
                                     WHERE sales_meeting_result.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}

                                        `;
                                              connection.query(query, (err, rows, fields) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.status(500).json(err);
                                                } else {

                                                  Sales[10] = rows;

                                                  query = `
                                    select Reason_ID
                              from sales_meeting_result12
                               WHERE sales_meeting_result12.Meeting_Result_ID=(select Meeting_Result_ID from sales_meeting_result where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}  )

                                  `;
                                                  connection.query(query, (err, rows, fields) => {
                                                    if (err) {
                                                      console.log(err);
                                                      res.status(500).json(err);
                                                    } else {

                                                      Sales[11] = rows;


                                                      query = `
                              select Expected_Date
                        from sales_meeting_result_will_send_inquiry
                         WHERE sales_meeting_result_will_send_inquiry.Meeting_Result_ID=(select Meeting_Result_ID  from sales_meeting_result where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}  )

                            `;
                                                      connection.query(query, (err, rows, fields) => {
                                                        if (err) {
                                                          console.log(err);
                                                          res.status(500).json(err);
                                                        } else {

                                                          Sales[12] = rows;

                                                          query = `
                        select  max ( Held_On ) as max_date
                          from sales_meeting_held_on
                              WHERE sales_meeting_held_on.Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
                                 `;
                                                          connection.query(query, (err, rows, fields) => {
                                                            if (err) {
                                                              console.log(err);
                                                              res.status(500).json(err);
                                                            } else {

                                                              Sales[13] = rows;

                                                              query = `
                            select Selection_Potential_Type
                              from general_client_potential_type
                              INNER JOIN sales_meeting_potential_type ON general_client_potential_type.Selection_Potential_Type_ID=
                              (select Potential_Type_ID from sales_meeting_potential_type  WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID} )

                                     `;
                                                              connection.query(query, (err, rows, fields) => {
                                                                if (err) {
                                                                  console.log(err);
                                                                  res.status(500).json(err);
                                                                } else {

                                                                  Sales[14] = rows;

                                                                  query = `
                                select Selection_SM_Result
                                  from general_sales_meeting_result
                                  INNER JOIN sales_meeting_result ON general_sales_meeting_result.Selection_SM_Result_ID =
                                  (select Result_ID from sales_meeting_result  WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID} )

                                         `;
                                                                  connection.query(query, (err, rows, fields) => {
                                                                    if (err) {
                                                                      console.log(err);
                                                                      res.status(500).json(err);
                                                                    } else {

                                                                      Sales[15] = rows;

                                                                      query = `
                                    select Selection_PO_Reason
                                      from general_po_reason
                                      INNER JOIN sales_meeting_result12 ON general_po_reason.Selection_PO_Reason_ID =
                                      (select Reason_ID from sales_meeting_result12  WHERE Meeting_Result_ID = (select Meeting_Result_ID  from sales_meeting_result  WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID} ) )

                                             `;
                                                                      connection.query(query, (err, rows, fields) => {
                                                                        if (err) {
                                                                          console.log(err);
                                                                          res.status(500).json(err);
                                                                        } else {

                                                                          Sales[16] = rows;

                                                                          if (Sales[0][0].Contact_Person_Type == 1) {
                                                                            query = `
                                          select ConsultantName
                                            from consultant_main_table
                                            where ConsultantID in
                                            (select Contact_Person_ID from sales_meeting_contact_person WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID})
                                             `;
                                                                          } else {
                                                                            query = `
                                                    select ClientName
                                                      from client_main_table
                                                      where ClientID in
                                                      (select Contact_Person_ID from sales_meeting_contact_person WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID})
                                                       `;
                                                                          }


                                                                          connection.query(query, (err, rows, fields) => {
                                                                            if (err) {
                                                                              console.log(err);
                                                                              res.status(500).json(err);
                                                                            } else {

                                                                              Sales[17] = rows;
                                                                              query = `
                                            select EmployeeName
                                              from hr_employee_general_data
                                              where EmployeeID  =
                                              (select SM_Added_By from sales_meeting_main_table WHERE Sales_Meeting_ID=${req.query.Sales_Meeting_ID})
                                               `;




                                                                              connection.query(query, (err, rows, fields) => {
                                                                                if (err) {
                                                                                  console.log(err);
                                                                                  res.status(500).json(err);
                                                                                } else {

                                                                                  Sales[18] = rows;


                                                                                  connection.release();
                                                                                  res.status(200).json(Sales);

                                                                                }
                                                                              });

                                                                            }
                                                                          });

                                                                        }
                                                                      });

                                                                    }
                                                                  });

                                                                }
                                                              });

                                                            }
                                                          });


                                                        }
                                                      });

                                                    }
                                                  });

                                                }
                                              });

                                            }
                                          });
                                        }
                                      });

                                    }
                                  });

                                }
                              });


                            }
                          });




                        }
                      });

                    }
                  });


                }
              });

            }
          });

        }
      });
    }
  });
});
////////////////////////////////////////////////////////Update Sales Meeting////////////////////////////////////////////////
app.post("/sales/salesfiles/salesmeeting/salesmeetingdahboard/UpdateSalesMeeting", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `update sales_meeting_potential_type set
    Potential_Type_ID='` + req.body.CustomerPotentialType + `'
     WHERE sales_meeting_potential_type.Sales_Meeting_ID=${req.query.Sales_Meeting_ID} `,
        connection.query(query, (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.status(500).json({
              get: false
            });
          } else {


            query = `update sales_meeting_main_table set
      Meeting_Way='` + req.body.ContactedBy + `',
      Meeting_Location='` + req.body.MeetingLocation + `',
      Comment='` + req.body.Comments + `',
      Customer_Type='` + req.body.CustomerType + `',`
            if (req.body.CustomerType == 'curcust') {
              query += `Company_Ref=` + req.body.clientConsultant + ``
            }
            if (req.body.CustomerType == 'potcust') {
              query += `Company_Ref=` + req.body.clientClient + ``
            }

            query += ` WHERE sales_meeting_main_table.Sales_Meeting_ID=${req.query.Sales_Meeting_ID} `,

              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({
                    get: false
                  });
                } else {

                  query = `update sales_meeting_schedule set
      Scheduled_Date='` + req.body.MeetingDate + `'

     WHERE sales_meeting_schedule.Sales_Meeting_ID=${req.query.Sales_Meeting_ID} `,

                    connection.query(query, (err, rows, fields) => {
                      if (err) {
                        console.log(err);
                        res.status(500).json({
                          get: false
                        });
                      } else {

                        query = `delete from sales_meeting_contact_person
      where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json({
                              get: false
                            });
                          } else {

                            query = ` INSERT INTO sales_meeting_contact_person (Sales_Meeting_ID,Contact_Person_ID,Contact_Person_Type) VALUES
      (${req.query.Sales_Meeting_ID},'` + req.body.contactClientPersons[0].ContactClient + `','` + req.body.ContactPersonType + `')`
                            for (var k = 1; k < req.body.contactClientPersons.length; k++) {
                              query += `,(${req.query.Sales_Meeting_ID},'` + req.body.contactClientPersons[k].ContactClient + `','` + req.body.ContactPersonType + `')`
                            }




                            connection.query(query, (err, rows, fields) => {
                              if (err) {
                                console.log(err);
                                res.status(500).json({
                                  get: false
                                });
                              } else {

                                query = ` INSERT INTO sales_meeting_update (Sales_Meeting_ID,Update_On,Update_By) VALUES
                                (${req.query.Sales_Meeting_ID},current_timestamp,(select SM_Added_By from sales_meeting_main_table where Sales_Meeting_ID =${req.query.Sales_Meeting_ID}))`




                                connection.query(query, (err, rows, fields) => {
                                  if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                      get: false
                                    });
                                  } else {
                                    query = `delete from sales_meeting_held_on
                                where Sales_Meeting_ID=0`;



                                    connection.query(query, (err, rows, fields) => {
                                      if (err) {
                                        console.log(err);
                                        res.status(500).json({
                                          get: false
                                        });
                                      } else {
                                        if (req.body.NextMeeting == 'Yes') {
                                          query = ` INSERT INTO sales_meeting_held_on (Sales_Meeting_ID,Held_On) VALUES
                                  (${req.query.Sales_Meeting_ID},'` + req.body.NextMeetingSchedule + `')`;



                                          connection.query(query, (err, rows, fields) => {
                                            if (err) {
                                              console.log(err);
                                              res.status(500).json({
                                                get: false
                                              });
                                            } else {
                                              connection.release();
                                              res.status(200).json({
                                                modified: true
                                              });

                                            }
                                          });
                                        } else {
                                          if (req.body.MeetingClosed == 'Yes') {
                                            if (req.body.MeetingResult == 4 || req.body.MeetingResult == 5) {
                                              query = ` INSERT INTO sales_meeting_result (Sales_Meeting_ID,Result_ID) VALUES
                                (${req.query.Sales_Meeting_ID},'` + req.body.MeetingResult + `')`




                                              connection.query(query, (err, rows, fields) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    get: false
                                                  });
                                                } else {

                                                  query = ` update sales_meeting_main_table set
                                Closing_Date=current_timestamp
                                where Sales_Meeting_ID =${req.query.Sales_Meeting_ID}`




                                                  connection.query(query, (err, rows, fields) => {
                                                    if (err) {
                                                      console.log(err);
                                                      res.status(500).json({
                                                        get: false
                                                      });
                                                    } else {

                                                      connection.release();
                                                      res.status(200).json({
                                                        modified: true
                                                      });


                                                    }
                                                  });



                                                }
                                              });
                                            }
                                            if (req.body.MeetingResult == 1 || req.body.MeetingResult == 2) {
                                              query = ` INSERT INTO sales_meeting_result (Sales_Meeting_ID,Result_ID) VALUES
                            (${req.query.Sales_Meeting_ID},'` + req.body.MeetingResult + `')`




                                              connection.query(query, (err, rows, fields) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    get: false
                                                  });
                                                } else {
                                                  id = rows.insertId;
                                                  query = ` INSERT INTO sales_meeting_result12 (Meeting_Result_ID,Reason_ID) VALUES
                            (${id},'` + req.body.MeetingResultMainReason + `')`




                                                  connection.query(query, (err, rows, fields) => {
                                                    if (err) {
                                                      console.log(err);
                                                      res.status(500).json({
                                                        get: false
                                                      });
                                                    } else {
                                                      query = ` update sales_meeting_main_table set
                            Closing_Date=current_timestamp
                            where Sales_Meeting_ID =${req.query.Sales_Meeting_ID}`




                                                      connection.query(query, (err, rows, fields) => {
                                                        if (err) {
                                                          console.log(err);
                                                          res.status(500).json({
                                                            get: false
                                                          });
                                                        } else {

                                                          connection.release();
                                                          res.status(200).json({
                                                            modified: true
                                                          });


                                                        }
                                                      });


                                                    }
                                                  });

                                                }
                                              });

                                            }
                                            if (req.body.MeetingResult == 3) {
                                              query = ` INSERT INTO sales_meeting_result (Sales_Meeting_ID,Result_ID) VALUES
                            (${req.query.Sales_Meeting_ID},'` + req.body.MeetingResult + `')`




                                              connection.query(query, (err, rows, fields) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.status(500).json({
                                                    get: false
                                                  });
                                                } else {
                                                  id = rows.insertId;
                                                  query = ` INSERT INTO sales_meeting_result_will_send_inquiry (Meeting_Result_ID,Expected_Date) VALUES
                            (${id},'` + req.body.ExpectedDate + `')`




                                                  connection.query(query, (err, rows, fields) => {
                                                    if (err) {
                                                      console.log(err);
                                                      res.status(500).json({
                                                        get: false
                                                      });
                                                    } else {

                                                      query = ` update sales_meeting_main_table set
                            Closing_Date=current_timestamp
                            where Sales_Meeting_ID =${req.query.Sales_Meeting_ID}`




                                                      connection.query(query, (err, rows, fields) => {
                                                        if (err) {
                                                          console.log(err);
                                                          res.status(500).json({
                                                            get: false
                                                          });
                                                        } else {

                                                          connection.release();
                                                          res.status(200).json({
                                                            modified: true
                                                          });


                                                        }
                                                      });


                                                    }
                                                  });

                                                }
                                              });


                                            }

                                          } else {

                                            connection.release();
                                            res.status(200).json({
                                              modified: true
                                            });
                                          }

                                        }

                                      }
                                    });

                                  }
                                });

                              }
                            });
                          }
                        });

                      }
                    });

                }
              });

          }
        });
    }
  })
});
///////////////////////////////////////////////////////////////MS Criteria dashboard/////////////////////////////////////////////////////////////
app.get('/sales/salesfiles/salesmeeting/updatesalesmeeting/mscriteriadashboard', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select General_Selection_Criteria_ID,sales_meeting_selection_criteria.Selection_Criteria_ID,Selection_Criteria
      from sales_meeting_selection_criteria,general_client_selection_criteria
       where general_client_selection_criteria.Selection_Criteria_ID =sales_meeting_selection_criteria.Selection_Criteria_ID  &&
      Sales_Meeting_ID=${req.query.Sales_Meeting_ID}`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          let critereaList = []

          recursionLoop(0, rows, critereaList, req, res, connection);


        }
      });
    }
  });
});

function recursionLoop(i, rows, critereaList, req, res, connection) {

  if (i == rows.length) {
    res.status(200).json(critereaList);
  } else {
    if (rows[i].Selection_Criteria_ID == 1 || rows[i].Selection_Criteria_ID == 3) {

      critereaList.push({
        critera: rows[i].Selection_Criteria,
        criteraID: rows[i].General_Selection_Criteria_ID,
        competitors: "-",
        country: "-"
      })
      recursionLoop(i + 1, rows, critereaList, req, res, connection)
    }

    if (rows[i].Selection_Criteria_ID == 4) {
      query = `select GSC_ID,sales_meeting_selection_criteria_country.Country_ID,Country_Of_Origin
      from sales_meeting_selection_criteria_country,general_country_of_origin
      where general_country_of_origin.COF_ID=sales_meeting_selection_criteria_country.Country_ID &&
      GSC_ID=(select General_Selection_Criteria_ID  from sales_meeting_selection_criteria where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
        &&  Selection_Criteria_ID=4 )
      `;

      connection.query(query, (err, countryIdresult, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {


          critereaList.push({
            critera: rows[i].Selection_Criteria,
            criteraID: rows[i].General_Selection_Criteria_ID,
            competitors: "-",
            country: countryIdresult[0].Country_Of_Origin
          })

          recursionLoop(i + 1, rows, critereaList, req, res, connection)
        }
      });


    }
    if (rows[i].Selection_Criteria_ID == 2) {
      query = `select Brand_Name as Competitor
              from sales_meeting_selection_criteria_vendor_list
              where General_Selection_Criteria_ID=(select General_Selection_Criteria_ID
                                                  from sales_meeting_selection_criteria
                                                  where Sales_Meeting_ID=${req.query.Sales_Meeting_ID}
                                                  &&  Selection_Criteria_ID=2)`;

      connection.query(query, (err, competitorsList, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          critereaList.push({
            critera: rows[i].Selection_Criteria,
            criteraID: rows[i].General_Selection_Criteria_ID,
            competitors: competitorsList,
            country: "-"
          })
          recursionLoop(i + 1, rows, critereaList, req, res, connection)
        }
      });


    }
  }
}
///////////////////////////////////////////////////////////////MS Criteria dashboard/////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////Add Criteria /////////////////////////////////////////////////////////////
app.post('/sales/salesfiles/salesmeeting/salesmeetingUpdate/addCriteria', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `insert into sales_meeting_selection_criteria
              (Sales_Meeting_ID,Selection_Criteria_ID)
              VALUES
              (${req.query.Sales_Meeting_ID},${req.body.critera})`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          ids = rows.insertId;
          if (req.body.critera == 1 || req.body.critera == 3) {

            res.status(200).json(true);


          }

          if (req.body.critera == 2) {
            query = ` INSERT INTO sales_meeting_selection_criteria_vendor_list (General_Selection_Criteria_ID,Brand_Name) VALUES
            ('${ids}','` + req.body.competitors[0].Competitor + `')`
            for (var z = 1; z < req.body.competitors.length; z++) {
              query += `,('${ids}','` + req.body.competitors[z].Competitor + `')`
            }

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {

                res.status(200).json(true);


              }
            });


          }
          if (req.body.critera == 4) {
            query = `insert into sales_meeting_selection_criteria_country
            (GSC_ID,Country_ID)
            VALUES
            (${ids},${req.body.country})`;

            connection.query(query, (err, rows, fields) => {
              if (err) {
                console.log(err);
                res.status(500).json(err);
              } else {

                res.status(200).json(true);


              }
            });



          }
        }
      });
    }
  });
});


/////////////////////////////////// Add New Project ////////////////////////////////////////////////////////////////////////////
app.post('/sales/salesfiles/salesmeeting/salesmeetingdahboard/AddNewProject', ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = ` INSERT INTO sales_meeting_jih (Sales_Meeting_ID,Project_Title,Project_Type,Project_Consultant,Expected_Budget_USD) VALUES
      (${req.query.Sales_Meeting_ID},'` + req.body.ProjectTitle + `','` + req.body.ProjectType + `','` + req.body.ProjectConsultant + `','` + req.body.ExpectedBudget + `')`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          id = rows.insertId;
          query = ` INSERT INTO sales_meeting_jih_ac_system (JIH_ID,AC_System_ID) VALUES
      ('${id}','` + req.body.ACSystems + `')`

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {

              query = ` INSERT INTO sales_meeting_jih_building_type (JIH_ID,Buidling_Type_ID) VALUES
            ('${id}','` + req.body.BuildingTypeAll[0].BuildingType + `')`
              for (var j = 1; j < req.body.BuildingTypeAll.length; j++) {
                query += `,('${id}','` + req.body.BuildingTypeAll[j].BuildingType + `')`
              }

              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json(err);
                } else {


                  query = ` INSERT INTO sales_meeting_jih_selection_criteria (JIH_ID,Selection_Criteria_ID) VALUES
            ('${id}','` + req.body.MCSelection + `')`


                  connection.query(query, (err, rows, fields) => {
                    if (err) {
                      console.log(err);
                      res.status(500).json(err);
                    } else {
                      ids = rows.insertId;
                      if (req.body.MCSelection == 4) {
                        query = ` INSERT INTO sales_meeting_jih_selection_criteria_country (JIH_SC_ID,Country_ID) VALUES
            ('${ids}','` + req.body.CountryOfOrigin + `')`


                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json(err);
                          } else {
                            query = ` INSERT INTO sales_meeting_jih_project_location (JIH_ID,Project_Location) VALUES
            ('${id}','` + req.body.map + `')`


                            connection.query(query, (err, rows, fields) => {
                              if (err) {
                                console.log(err);
                                res.status(500).json(err);
                              } else {
                                res.status(200).json({
                                  created: true
                                });

                              }
                            });

                          }
                        });
                      }
                      if (req.body.MCSelection == 2) {

                        query = ` INSERT INTO sales_meeting_jih_competitor (JIH_ID,Competitor) VALUES
  ('${ids}','` + req.body.CompetitorAll[0].Competitor + `')`
                        for (var z = 1; z < req.body.CompetitorAll.length; z++) {
                          query += `,('${ids}','` + req.body.CompetitorAll[z].Competitor + `')`
                        }


                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json(err);
                          } else {


                            query = ` INSERT INTO sales_meeting_jih_project_location (JIH_ID,Project_Location) VALUES
            ('${id}','` + req.body.map + `')`


                            connection.query(query, (err, rows, fields) => {
                              if (err) {
                                console.log(err);
                                res.status(500).json(err);
                              } else {
                                res.status(200).json({
                                  created: true
                                });

                              }
                            });


                          }
                        });

                      }
                      if (req.body.MCSelection == 1 || req.body.MCSelection == 3) {
                        query = ` INSERT INTO sales_meeting_jih_project_location (JIH_ID,Project_Location) VALUES
  ('${id}','` + req.body.map + `')`


                        connection.query(query, (err, rows, fields) => {
                          if (err) {
                            console.log(err);
                            res.status(500).json(err);
                          } else {
                            res.status(200).json({
                              created: true
                            });

                          }
                        });

                      }
                    }
                  });
                }
              });

            }
          });
        }
      });
    }
  });
});

/*************************************************************************************************
 ************************************************* Request For Quotation (RFQ)
 **************************************************************************************************/

// Sales File Queries

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/sfTypeList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select * from general_file_type_sales`;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
// Get Sales Files Refs
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/sfRefList", ensureToken, (req, res) => {

  pool.getConnection(async function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      switch (req.query.sfType) {
        case '1':
          query = `select DSF_ID,DSF_Reference
          from dsf_main_table
          `;
          break;
        case '2':
          query = `select PSF_ID,PSF_Reference
          from psf_main_table
          `;
          break;
        case '3':
          query = `select SSF_ID,SSF_Reference
          from ssf_main_table
          `;
          break;
        case 'other':
          // query = `select SSF_ID,distinct(SSF_Reference)
          // from SSF_Main_Table
          // `;
          break;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
//  Get SF ref base on provided SF_ID
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/sfRefData", ensureToken, (req, res) => {

  pool.getConnection(async function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // console.log(req.query)
      switch (req.query.sfType) {
        case '1':
          query = `select DSF_Reference
          from dsf_main_table
          where DSF_ID = ${req.query.SF_ID}
          `;
          break;
        case '2':
          query = `select PSF_Reference
          from psf_main_table
          where PSF_ID = ${req.query.SF_ID}
          `;
          break;
        case '3':
          query = `select SSF_Reference
          from ssf_main_table
          where SSF_ID = ${req.query.SF_ID}
          `;
          break;
        case 'other':
          // query = `select SSF_ID,distinct(SSF_Reference)
          // from SSF_Main_Table
          // `;
          break;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          // console.log(rows);
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Rfq Queries

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/rfqRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select RFQ_Reference
      from rfq_sf_main_table
      where Product_Type_ID = ${req.query.sfType}`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
// Cancel and Update an RFQ
// get an old Rfq Data
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/rfqRefData", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
        from rfq_sf_main_table
        where RFQ_Reference = ${connection.escape(req.query.rfqRef)}
        `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
// get Rfq Product Data for a certain RFQ
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/rfqRefProductData", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      // console.log(req.query.Supplier_Type)
      if (req.query.suppType == 'OurSupp') {
        query = `select *
        from our_suppliers_product
        where OS_Product_ID = ${req.query.prodId}`;
      } else if (req.query.suppType == 'OthersSupp') {
        query = `select *
        from other_suppliers_product
        where OS_Product_ID = ${req.query.prodId}`;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
// get Rfq Product Data(for All RFQs)
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/rfqList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `select *
        from rfq_sf_main_table
        `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
// get Rfq Supplier Data(FOR All RFQS)
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/rfqRefSuppplier", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      query = `select Supplier_Type,Supplier_ID
        from rfq_sf_suppliers
        `;

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Supplier Queries

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/suppRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {

      // console.log(req.query.Supplier_Type)
      if (req.query.Supplier_Type == 'OurSupp') {
        query = `select Our_Supplier_ID,Our_Supplier_Name
        from our_suppliers_list`;
      } else if (req.query.Supplier_Type == 'OthersSupp') {
        query = `select Other_Supplier_ID,Other_Supplier_Name
        from other_suppliers_list`;
      }
      // console.log('productCatList works')
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/cpRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      if (req.query.Supplier_Type == 'OurSupp') {
        // console.log(req.query)
        query = `select OSCP_ID,OS_Contact_Person_Name
        from our_suppliers_contact_person
        where OSCP_ID=${req.query.Supplier_ID}`;
      } else if (req.query.Supplier_Type == 'OthersSupp') {
        query = `select OSCP_ID,OS_Contact_Person_Name
        from other_suppliers_contact_person
        where OSCP_ID=${req.query.Supplier_ID}`;
      }
      // console.log(req.query);

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Input File Queries

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/schedualRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // console.log(req.query.sfType)
      // Input_Data_Type_ID for Schedual of equipment = 15

      // switch(req.query.sfType){
      // case '1':
      //   query = `select Input_Data_ID,Title
      //     from rfq_sf_input_data
      //     where DSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 15`
      //     break;
      // case '2':
      //   query = `select Input_Data_ID,Title
      //     from psf_input_data_history
      //     where PSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 15`
      // break;
      // case '3':
      //   query = `select Input_Data_ID,Title
      //     from dsf_input_data_history
      //     where SSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 15`
      // break;
      // }

      query = `select Input_Data_ID,Title
        from rfq_sf_input_data
        where RFQ_SF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 15`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/specsRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // Input_Data_Type_ID for Technical specs = 1
      // console.log(req.query.sfType)
      // switch (req.query.sfType) {
      //   case '1':
      //     query = `select Input_Data_ID,Title
      //       from dsf_input_data_history
      //       where DSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 1`
      //     break;
      //   case '2':
      //     query = `select Input_Data_ID,Title
      //       from psf_input_data_history
      //       where PSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 1`
      //     break;
      //   case '3':
      //     query = `select Input_Data_ID,Title
      //       from ssf_input_data_history
      //       where SSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 1`
      //     break;
      // }

      query = `select Input_Data_ID,Title
      from rfq_sf_input_data
      where RFQ_SF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 1`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});
app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/drawingRefList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // Input_Data_Type_ID for Drawing Testing = 2
      // console.log(req.query.sfType)
      // switch (req.query.sfType) {
      //   case '1':
      //     query = `select Input_Data_ID,Title
      //       from dsf_input_data_history
      //       where DSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 2`
      //     break;
      //   case '2':
      //     query = `select Input_Data_ID,Title
      //       from psf_input_data_history
      //       where PSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 2`
      //     break;
      //   case '3':
      //     query = `select Input_Data_ID,Title
      //       from dsf_input_data_history
      //       where SSF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 2`
      //     break;
      // }
      query = `select Input_Data_ID,Title
      from rfq_sf_input_data
      where RFQ_SF_ID = ${req.query.sfType} AND Input_Data_Type_ID = 2`

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Product Queries

// Product Category

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/productCatList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // console.log(req.query.suppType)
      if (req.query.suppType == 'OurSupp') {
        query = `select Product_Category
          from our_suppliers_product
          `;
      } else if (req.query.suppType == 'OthersSupp') {
        query = `select Product_Category
          from other_suppliers_product
          `;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Product Sub-category

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/productSubList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      if (req.query.suppType == 'OurSupp') {
        query = `select Product_Sub_Category
          from our_suppliers_product
          where Product_Category = ${req.query.prodCat}
          `;
      } else if (req.query.suppType == 'OthersSupp') {
        query = `select Product_Sub_Category
          from other_suppliers_product
          where Product_Category = ${req.query.prodCat}
          `;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// Product Type List

app.get("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/productTypeList", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      // console.log(req.query.suppType);
      if (req.query.suppType == 'OurSupp') {
        query = `select OS_Product_ID,Product_Title
          from our_suppliers_product
          where Product_Sub_Category = ${req.query.prodSub}
          `;
      } else if (req.query.suppType == 'OthersSupp') {
        query = `select OS_Product_ID,Product_Title
          from other_suppliers_product
          where Product_Sub_Category = ${req.query.prodSub}
          `;
      }

      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          connection.release();
          res.status(200).json(rows);
        }
      });
    }
  })
});

// form submission query

app.post("/sales/salesfiles/directsalesfile/rfqsuppquotation/newrfqquotation/createrfq", ensureToken, (req, res) => {

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      let now = new Date();
      // console.log(req.body['form']['rfqType']);
      let rev = 0;
      let newId = 0;
      if (req.body['form']['rfqType'] == 'cancelRFQ') {
        // get the string for the select query: searching for an rfq ref where RFQ_Reference matches
        let arr = req.body['form']['rfqRef'].split('-');
        arr.pop();
        // console.log(arr.join('-')+'-%');
        query = `select RFQ_Reference from rfq_sf_main_table Where RFQ_Reference LIKE ${connection.escape(arr.join('-')+"-%")} ORDER BY RFQ_Reference DESC LIMIT 1`;
      } else {
        query = 'select RFQ_Reference from rfq_sf_main_table ORDER BY RFQ_Reference DESC LIMIT 1';
      }
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            get: false
          });
        } else {
          let arr = rows[0].RFQ_Reference.split('-');
          newId = Number(arr[arr.length - 2]) + 1;
          // console.log(newId)

          if (req.body['form']['rfqType'] == 'cancelRFQ') {
            rev = Number(arr[arr.length - 1]) + 1;
            // console.log(arr,rev);
          }
          query = `INSERT INTO rfq_sf_main_table
          (RFQ_Revision, RFQ_On, RFQ_By, RFQ_Reference, File_Type_ID, File_ID, Reply_Target_Date, RFQ_Status, Product_Type_ID)
           VALUES (${connection.escape(rev)}, CURRENT_TIMESTAMP, ${connection.escape(req.body['user']['email'])} , '-', ${connection.escape(req.body['form']['sfType'])}, ${connection.escape(req.body['form']['sfType'])}, ${connection.escape(req.body['form']['deadline'])}, 'On going', ${connection.escape(req.body['form']['prodRef'])})
          ;`
          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json({
                get: false
              });
            } else {
              id = rows.insertId;
              if (req.body['form']['rfqType'] == 'cancelRFQ') {
                arr = req.body['form']['rfqRef'].split('-');
                newId = arr[arr.length - 2];
              }

              // console.log(id)
              query = `

              UPDATE rfq_sf_main_table SET RFQ_Reference = concat_ws('-',
                                                                        'RFQ',
                                                                        'SF',
                                                                        Year(current_timestamp),
                                                                        Month(current_timestamp),
                                                                        ${newId},
                                                                        ${rev}
                                                                        )
                                                                        where RFQ_ID = ${id}
                                                                               ;`
              // console.log(query);
              connection.query(query, (err, rows, fields) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({
                    get: false
                  });
                } else {
                  connection.release();
                  res.status(200).json(true);
                }
              });

            }
          });
        }
      });
    }
  })
});
///////////// RFQ Dashboard ////////////////
app.get('/sales/salesfiles/directsalesfile/rfqsuppquotation/scheduleofequipementdashboard/showrfq', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
        from rfq_sf_main_table
        where RFQ_ID='${req.query.rfqID}'`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows[0]);

        }
      });
    }
  });
});

////////////////////// Supplier Quotation ///////////////

// Get Supplier Quotation ref List
app.get('/pages/supplier-pages/add-quotation/SuppQuotRefList', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select RFQ_ID
        from rfq_sf_suppliers
        where RFQ_to_ID = ${connection.escape(req.query.suppID)}`;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {

          query = `select *
          from rfq_sf_main_table
          where RFQ_ID = ${connection.escape(rows[0].RFQ_ID)}` ;

          connection.query(query, (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500).json(err);
            } else {
            connection.release();
            res.status(200).json(rows);
            }
          });
        }
      });
    }
  });
});
// Get Intercoms Ref List
app.get('/pages/supplier-pages/add-quotation/IcotermsRefList', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
        from general_incoterms
        `;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);


        }
      });
    }
  });
});
// Get Currency Ref List
app.get('/pages/supplier-pages/add-quotation/CurrencyRefList', ensureToken, (req, res) => {


  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err)
    } else {
      query = `select *
        from general_currency
        `;
      connection.query(query, (err, rows, fields) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else {
          connection.release();
          res.status(200).json(rows);

        }
      });
    }
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var credentials = {key: privateKey, cert: certificate};
var server = https.createServer( /*credentials,*/ app);

server.listen(PORT);
