var express = require('express');
var app = express();
var request1 = require('request');
const uuidv4 = require('uuid/v4');
var EventEmitter = require('events').EventEmitter;
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var path = require("path");
var fs = require('fs');
var multer = require('multer');
var timeout = require('connect-timeout');
const http = require('http')
var https = require('https');

var mv = require('mv');
const NodeRSA = require('node-rsa');
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE"
}
app.use(cors(corsOptions));
const nosniff = require('dont-sniff-mimetype')
app.use(nosniff())
//---------------------------------VAPT-------------------------------------------

const helmet = require('helmet');
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));
app.use(helmet())


const { expressCspHeader, NONCE } = require('express-csp-header');

app.use(expressCspHeader({
  directives: {
    'script-src': [NONCE]
  }
}));

app.disable('x-powered-by');
app.use(function (req, res, next) {
  // res.removeHeader("x-powered-by");
  res.setHeader("x-powered-by", "My Server");
  // res.setHeader("X-Content-Type-Options", "nosniff");
  // res.header('X-Frame-Options', 'SAMEORIGIN');

  res.removeHeader('server');
  next();
});




//-------------------------------------------------------------------------------
// app.use(function (req, res, next) {
//   winlog.info("in use 1")
// //   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin',  '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   next();
// })


// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });
var winlog = require("./log/winstonlog");

var UA_route1 = require('./api/web3js/index');
var userSiginUp = require('./api/userSignUp');
var userRole = require('./api/userRole')

var UA_route3 = require('./api/useraccounts')
var UA_loans = require('./api/loans')
var UA_pools = require('./api/pools')
var UA_contract = require('./api/web3js/index');
var UA_excel = require('./api/createexcel')

var ERC20_transfer = require('./api/ERC20/MyToken')

var Attribute = require('./api/addAttributes.js');

var IPFSadd = require('./api/IPFS.js');
var BC_getallpools = require('./api/BCpools');

var updatedeal = require('./api/updatedeal');


var dealOnbording = require('./api/dealOnbording.js');
var dealdoc = require('./api/DealDocument')

var TrancheCommit = require('./api/TrancheInvestCommit')

var loantapecols = require('./api/loantapecolumns.js');
var loansave = require('./api/LoanSaveTest.js')

var paymentsettings = require('./api/InvestorWallet')

var lazerzero = require('./api/LayeZero')
var tranche = require('./api/updatetranche')

var GetTransactionDetails = require('./api/GetUserTransactionDetails')
var SaveUserTransactions = require('./api/SaveTransactionDetails')


// Request methods you wish to allow
// res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

// Request headers you wish to allow
//res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

// Set to true if you need the website to include cookies in the requests sent
// to the API (e.g. in case you use sessions)
//res.setHeader('Access-Control-Allow-Credentials', true);

const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI('104.42.155.78', '5001', { protocol: 'http' });

var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
// ------------------------- BC connection ---------------------

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const contractAddress = '0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4'; // deployed contract address( can be taken from remix or index.js)
const contractPath = path.resolve(__dirname, 'api', 'contracts', 'User.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';

const input = {
  language: 'Solidity',
  sources: {
    'User.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
//winlog.info(tempFile)
const contractFile = tempFile.contracts['User.sol']['User'];
//winlog.info(contractFile)

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

const incrementer = new web3.eth.Contract(abi, contractAddress);

// ---------------------------------------BC connection end-------
var privateKey = fs.readFileSync('tls.key', 'utf8');
var certificate = fs.readFileSync('tls.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

//---------------- circle api connection

const MessageValidator = require('sns-validator')
const circleArn =
  /^arn:aws:sns:.*:908968368384:(sandbox|prod)_platform-notifications-topic$/

const validator = new MessageValidator()
app.use(function (request, response, next) {
  if (request.url == '/') {

    if (request.method === 'HEAD') {
      response.writeHead(200, {
        'Content-Type': 'text/html',
      })
      response.end(`HEAD request for ${request.url}`)
      winlog.info('Received HEAD request')
      return
    }
    if (request.method === 'POST') {
      let body = ''
      request.on('data', (data) => {
        body += data
      })
      request.on('end', () => {
        winlog.info(`POST request, \nPath: ${request.url}`)
        winlog.info('Headers: ')
        console.dir(request.headers)
        winlog.info(`Body: ${body}`)

        response.writeHead(200, {
          'Content-Type': 'text/html',
        })
        response.end(`POST request for ${request.url}`)
        handleBody(body)
      })
    }
    else {
      winlog.info(request.url)
      const msg = `${request.method} method not supported`
      winlog.info(msg)
      response.writeHead(400, {
        'Content-Type': 'text/html',
      })
      response.end(msg)
      return
    }

    const handleBody = (body) => {
      const envelope = JSON.parse(body)
      validator.validate(envelope, (err) => {
        if (err) {
          console.error(err)
        } else {
          switch (envelope.Type) {
            case 'SubscriptionConfirmation': {
              if (!circleArn.test(envelope.TopicArn)) {
                console.error(
                  `\nUnable to confirm the subscription as the topic arn is not expected ${envelope.TopicArn}. Valid topic arn must match ${circleArn}.`
                )
                break
              }
              request1(envelope.SubscribeURL, (err) => {
                if (err) {
                  console.error('Subscription NOT confirmed.', err)
                } else {
                  winlog.info('Subscription confirmed.')
                }
              })
              break
            }
            case 'Notification': {
              var message = JSON.parse(envelope.Message)
              if (String(message.notificationType) == "payments") {

                winlog.info("Received message for payments: " + JSON.stringify(message))
                winlog.info("message.payment.source.id :  " + message.payment.source.id)
                let resp = paymentsettings.transferUSDC(message, request, response, function (err, body) {
                  if (err)
                    winlog.info(err)
                  winlog.info(body);
                });
              }
              else if (String(message.notificationType) == "transfers" && String(message.transfer.status) == "complete") {

                winlog.info("Received message for transfers: " + JSON.stringify(message))
                winlog.info("USDC minted in investor account successfully")
                return ({
                  "success": true,
                  "message": "USDC minted success"
                })
              }
              else {
                winlog.info("Received message: " + JSON.stringify(message))
                break
              }
            }
            default: {
              console.error(`Message of type ${body.Type} not supported`)
            }
          }
        }
      })
    }
  }
  else {
    winlog.info("Not a circle api !")
    winlog.info("url: " + request.url + "   " + request.method)
    return next();
  }
})


//--------- circle api connection end

var storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tempfolder');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload2 = multer({ storage: storage2 }).single('filename');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'servicerUploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');
//--------------------  JWT  ---------------------------------------------------------------------

//set secret variable
app.set('secret', 'thisismysecret');

app.use(expressJWT({
  secret: 'thisismysecret', algorithms: ['HS256']
}).unless({
  path: ['/login', '/createnewaccount', '/signUp', '/forgotPassword', '/resetPassword', '/upload','/createUserRole']
}));
app.use(bearerToken());

app.use(function (req, res, next) {
  winlog.info(' ------>>>>>> new request for %s', req.originalUrl);
  if (req.originalUrl.indexOf('/login') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/createnewaccount') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/signUp') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/forgotPassword') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/resetPassword') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/upload') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/createUserRole') >= 0) {
    return next();
  }
  var token = req.token;
  winlog.info(token + "::::token");
  jwt.verify(token, app.get('secret'), function (err, decoded) {
    if (err) {
      res.send({
        success: false,
        message: 'Failed to authenticate token. Make sure to include the ' +
          'token returned from /login call in the authorization header ' +
          ' as a Bearer token'
      });
      return;
    } else {
      // add the decoded user name and org name to the request object
      // for the downstream code to use
      req.emailid = decoded.emailid;
      req.password = decoded.password;
      //  winlog.info(util.format('Decoded from JWT token: emailid - %s, password - %s', decoded.emailid, decoded.password));
      return next();
    }
  });
});


function getErrorMessage(field) {
  var response = {
    success: false,
    message: field + ' field is missing or Invalid in the request'
  };
  return response;
}


// Register and enroll user
app.post('/login', jsonParser, async function (req, res) {

  //--------------------------------


  var EmailId = req.body.EmailId;
  var Password = req.body.Password;

  if (!EmailId) {
    res.json(getErrorMessage('\'EmailId\''));
    return;
  }
  if (!Password) {
    res.json(getErrorMessage('\'Password\''));
    return;
  }
  const get1 = async () => {
    winlog.info(`Making a call to contract at address ${contractAddress}`);
    var status = 'Active'
    const data = await incrementer.methods
      .getUserByEmailAndStatus(EmailId, status)
      .call({ from: address });
    winlog.info(`The current string is: ${data}`);
    winlog.info("data:: " + JSON.stringify(data));

    var arr1 = JSON.parse(JSON.stringify(data));
    var resData = [];
    //for (var i = 0; i < arr1.length; i++) {
    // var resp = arr1[i].split("#");
    winlog.info(arr1.length);
    if (arr1.length > 0) {

      var c = {
        "UserId": arr1[0][0],
        "EmailAddress": arr1[0][1],
        "UserHash": arr1[0][2],
        "UserSatus": arr1[0][3],
        "UserAccAddress": arr1[0][4],
        "UserRole": arr1[0][5],
        "UserName": arr1[0][6]

      };
      var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),  // 1 hr
        EmailId: EmailId,
        Password: Password
      }, app.get('secret'));
      //  let response =  helper.getRegisteredUser(emailid, password, true);


      ipfs.files.get(arr1[0][2], function (err, files) {
        files.forEach((file) => {
          winlog.info(file.path)
          winlog.info(file.content.toString('utf8'))
          var ipfsData = JSON.parse(file.content.toString('utf8'));
          ipfsData.UserId = arr1[0][0];
          // ipfsData.UserSatus = arr1[0][3];
          ipfsData.UserAccAddress = arr1[0][4];

          if (ipfsData.EmailAddress == EmailId && ipfsData.Password == Password) {
            winlog.info("login sucess");
            delete ipfsData["Password"];
            var r = { "message": "User Authentication Successful", "data": ipfsData, "token": token }
            res.send(r);
          } else {
            var r = { "message": "Passwor is incorrect" }
            res.status(204).send(r);
          }
          //  res.send(file.content.toString('utf8'));

        })
      })


    } // end of if 
    else {
      var r = { "message": "Username is incorrect" }
      res.status(204).send(r);
    }

  };

  get1();
  //--------------------------

});

// ---------------------------------------------------------------------------------------------------



var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/KYC/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);

  }
});
var upload1 = multer({ storage: storage1 });

//----------------


var storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tempfolder');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload2 = multer({ storage: storage2 }).single('filename');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'servicerUploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');
//--------------------


app.post('/upload', upload1.any(), function (req, res, next) {
  winlog.info(req.files);
  res.send(req.files);
});


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');

app.post('/createnewaccount', jsonParser, function (req, res) {

  let response = UA_route3.createuser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/getprivatekey', jsonParser, function (req, res) {

  let response = UA_route3.GetPrivateKey(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/deploy', jsonParser, function (req, res) {

  let response = UA_route1.deploycontract(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


// const ipfsAPI = require('ipfs-api');

// const ipfs = ipfsAPI('104.42.155.78', '5001', { protocol: 'http' })


app.post('/createUserRole', jsonParser, function (req, res) {

  let response = userRole.createUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/GetAllUserRoles', jsonParser, function (req, res) {

  let response = userRole.GetAllUserRoles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


//Addfile router for adding file a local file to the IPFS network without any local node
app.post('/signUp', jsonParser, function (req, res) {

  let response = userSiginUp.signUp(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

// app.post('/login', jsonParser, function (req, res) {

//   let response = userSiginUp.login(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

app.get('/forgotPassword', jsonParser, function (req, res) {

  let response = userSiginUp.forgotPassword(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})


app.post('/resetPassword', jsonParser, function (req, res) {

  let response = userSiginUp.resetPassword(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

//Getting the uploaded file via hash code.
app.get('/getfile', function (req, res) {

  //This hash is returned hash of addFile router.
  const validCID = 'QmTdihZUGi2GwuHdiMHidGehKHd8zaekNBSwjWeCiVkboq'

  ipfs.files.get(validCID, function (err, files) {
    files.forEach((file) => {
      winlog.info(file.path)
      winlog.info(file.content.toString('utf8'))
    })
  })

})

//loans onboard

app.post('/uploadloanlms', function (req, res) {
  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })
});

app.post('/onboardloans', jsonParser, function (req, res) {

  let response = UA_loans.onboardloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})


app.get('/getallloans', jsonParser, function (req, res) {

  let response = UA_loans.getallloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.get('/getloansbyarayofloanhashes', jsonParser, function (req, res) {

  let response = UA_loans.getloansbyarayofloanhashes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})


app.get('/updateLoanStatus', jsonParser, function (req, res) {

  let response = UA_loans.updateLoanStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/updatedatas', jsonParser, function (req, res) {

  let response = UA_loans.updatedata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/exportexcel', jsonParser, function (req, res) {

  let response = UA_excel.createexcel(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/deploycontract', jsonParser, async function (req, res) {

  var contractname = "CreatePool";
  let response = await UA_contract.deploycontract(req, res, contractname, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

//poolcreation
// app.post('/createpool', jsonParser, async function (req, res) {

//    let response1 = UA_pools.createpool(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
//   // }
// });

app.post('/createpool', jsonParser, function (req, res) {

  // fs.access("pooluploads", function (error) {
  //   if (error) {
  //     res.status(404).send('Directory Does Not exist!');
  //     winlog.info("Directory Does Not exist!");
  //   }
  //   else {
  // upload(req, res, function (err) {
  //   if (err) {
  //     return res.end("Error upoolploading file.");
  //   }
  //   winlog.info("__dirname::: " + __dirname);
  //   winlog.info(req.file);

  //   const folderName = __dirname + "/pooluploads/" + req.body.poolname;
  //   winlog.info("folder name::::" + folderName);

  //   try {
  //     if (!fs.existsSync(folderName)) {
  //       fs.mkdirSync(folderName);
  //       winlog.info("pool folder created::::::::::::" + req.body.poolname)
  //     } else {
  //       winlog.info("Folder already exist")
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  //   if (String(req.file) != "undefined") {

  //     var uploadpath = __dirname + '/uploads/' + req.file.filename;
  //     //filenamearr.push(uploadpath);
  //     winlog.info(uploadpath);

  //     var ext = path.extname(req.file.originalname);
  //     winlog.info("extension :::" + ext);
  //     var filename = req.file.originalname;
  //     winlog.info("file uploaded in upload directory:::::::::");

  //     //copy file from upload to pooluploads
  //     fs.copyFileSync(uploadpath, folderName + "/" + req.file.filename);
  //     winlog.info(uploadpath + " " + folderName + "/" + req.file.filename);
  let response1 = UA_pools.createpool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

  //   } else {

  //     winlog.info("no files uploaded:::::::::::::::::::")
  //     let response1 = UA_pools.createpool(req, res, function (err, body) {
  //       if (err)
  //         res.send(err);
  //       res.send(body);
  //     });

  //   }

  // });
  //}
  //})
});

app.get('/getallpools', jsonParser, function (req, res) {

  let response = UA_pools.getallpools(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getbypoolid', jsonParser, function (req, res) {

  let response = UA_pools.getbypoolid(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})



app.get('/getallpoolsbyIssuerId', jsonParser, function (req, res) {

  let response = UA_pools.getallpoolsbyIssuerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getallpoolsbyVAId', jsonParser, function (req, res) {

  let response = UA_pools.getallpoolsbyVAId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.get('/updatePoolStatus', jsonParser, function (req, res) {

  let response = UA_pools.updatePoolStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/updateLoanAndPoolStatus', jsonParser, function (req, res) {

  let response = UA_pools.updateLoanAndPoolStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/GetAllUsersByUserRole', jsonParser, function (req, res) {
  winlog.info("DF")
  let response = userSiginUp.GetAllUserByUserRole(req, res, function (err, body) {
    winlog.info("d")
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/filterloans', jsonParser, function (req, res) {

  let response = UA_loans.filterloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updateArrayofLoanStatus', jsonParser, function (req, res) {

  let response = UA_loans.updateArrayofLoanStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/mappoolstoloans', jsonParser, function (req, res) {

  let response = UA_pools.mappoolstoloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/ERC20', jsonParser, function (req, res) {

  let response = ERC20_transfer.transfer(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/NFTmint', jsonParser, function (req, res) {

  let response = IPFSadd.Poolcreate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.post('/addAttribute', jsonParser, function (req, res) {

  let response = Attribute.addAttribute(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getAllAttributes', jsonParser, function (req, res) {

  let response = Attribute.getAllAttributes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getallpoolsfrombc', jsonParser, function (req, res) {

  let response = BC_getallpools.querygetallpools(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
    //res.send(body);
  });
})

app.get('/getpoolsfrombcbyissuer', jsonParser, function (req, res) {

  let response = BC_getallpools.getallpoolsbyissuerid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})

app.get('/getpoolsfrombcbyunderwriter', jsonParser, function (req, res) {

  let response = BC_getallpools.getallpoolsbyunderwriterid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})

app.post('/updatepoolstatusbc', jsonParser, function (req, res) {

  let response = BC_getallpools.updatepoolstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})


app.post('/createDeal', jsonParser, function (req, res) {

  let response1 = dealOnbording.createDeal(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});

app.post('/updatedealstatus', jsonParser, function (req, res) {

  let response1 = dealOnbording.updatedealstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});


app.post('/updatedeal', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          let response1 = updatedeal.updateDeal(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });

        } else {
          res.sendStatus(204);
        }

      });
    }
  });
});

app.get('/getDealsByUnderwriterId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsByUnderwriterId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})


app.get('/getDealDetailsByDealId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealDetailsByDealId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});


app.post('/addDealDocuments', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          //var filename = req.file.originalname;

          // var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          let response1 = dealdoc.addDeal(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });

        } else {
          res.sendStatus(204);
        }

      });
    }
  })


});



app.post('/updateDealDocument', jsonParser, function (req, res) {
  let response1 = dealdoc.updatedeal(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/downloadDealTemplate', (req, res) => {

  var filepath = path.join(__dirname + '/uploads/demo_deal_template.xlsx');

  if (fs.existsSync(filepath)) {
    winlog.info("filepath in xlsx for download: " + filepath);

    res.download(filepath);
  }
  else {
    res.send({ "isSuccess": false, "message": "no file found" });
  }
});

app.get('/getInvestorDealDetailsByDealId', jsonParser, function (req, res) {

  let response = dealOnbording.getInvestorDealDetailsByDealId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.get('/getcommitmentdetails', jsonParser, function (req, res) {

  let response = TrancheCommit.GetTrancheCommitment(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.get('/getAllDeals', jsonParser, function (req, res) {

  let response = dealOnbording.getAllDeals(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.get('/getDealsbyServicerId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsbyServicerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.get('/getDealsbyPayingagentId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsbyPayingagentId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});


app.post('/InvesmentCommit', jsonParser, function (req, res) {
  let response1 = TrancheCommit.SaveCommit(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/EditCommit', jsonParser, function (req, res) {
  let response1 = TrancheCommit.EditCommit(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/Invest', jsonParser, function (req, res) {
  let response1 = TrancheCommit.Invest(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

// app.get('/getcommitmentdetails', jsonParser, function (req, res) {

//   let response = TrancheCommit.GetTrancheCommitment(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     winlog.info("in")
//     res.send(body);
//   });
// });

app.get('/DealDetailsRedirect', jsonParser, function (req, res) {

  let response = dealOnbording.getscreendetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.post('/uploadapproach', jsonParser, function (req, res) {
  let response1 = dealOnbording.uploadapproach(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/datequery', jsonParser, function (req, res) {
  let response1 = dealOnbording.datequery(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/dateanalyse', jsonParser, function (req, res) {
  let response1 = dealOnbording.dateanalyse(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/uploadservicerreport', function (req, res) {

  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload2(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          //rename the file
          var oldfilename = filename;
          if (parseInt(req.body.month) < 10) {
            var month = "0" + req.body.month;
          }
          else {
            var month = req.body.month;
          }
          winlog.info("req.body.dealid: " + req.body.dealid)

          var docname = req.body.dealid + "-" + month + "-" + req.body.year + ext;
          winlog.info("docname::: " + docname);
          winlog.info("oldfilename:: " + oldfilename);
          fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
            if (err) winlog.info('ERROR: ' + err);
          });

          //copying file from tempfolder to uploads
          mv(__dirname + '/tempfolder/' + docname, __dirname + '/servicerUploads/' + docname, function (err) {
            if (err) { throw err; }
            winlog.info('file moved successfully');
          });

          var output = { isSuccess: true, month: req.body.month, year: req.body.year, filename: docname, filetype: ext.toString(), result: "Document uploaded successfully!" };
          winlog.info("output: " + JSON.stringify(output))
          if (output.isSuccess) {
            let response = dealOnbording.datesave(req, res, function (err, body) {
              if (err)
                res.send(err);
              res.send(body);
            });
          }
          // res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })

});

app.get('/showcolumns', upload, function (req, res) {
  let response = loantapecols.displaycolumns1(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/savemapping', jsonParser, async function (req, res) {
  let response1 = await loantapecols.savemapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

  if (response1.success) {

    setTimeout(function () {
      winlog.info("inside loantape saving!!!!")
      // var testFolder = "/home/monisha/Downloads/rsakeystore/";
      var testFolder = path.join(__dirname + '/uploads/')
      var count = 0;
      filenames = fs.readdirSync(testFolder);
      filenames.forEach(file => {
        var extension = path.extname(file);
        var File = path.basename(file, extension);
        //winlog.info(File+" "+req.body.dealid)
        if (File == req.body.dealid + "-public-key") {
          winlog.info("user already exist::::::")
          count = 1;
        }
      });

      if (count == 0) {
        winlog.info("Creating new private and public key for the user::::::::::")
        var key1 = new NodeRSA({ b: 1024 });//1024
        var public_key = key1.exportKey('public');
        var private_key = key1.exportKey('private')
        // var testFolder = "/home/monisha/Downloads/rsakeystore/";
        var testFolder = path.join(__dirname + '/uploads/')
        //write private and public key
        fs.writeFileSync(testFolder + req.body.dealid + "-public-key.txt", public_key);
        fs.writeFileSync(testFolder + req.body.dealid + "-private-key.txt", private_key);
        winlog.info("done")
      }
      loansave.createDeal(req, res, (err, body) => {
        if (err)
          res.send(err)
        res.send(body)
      })
    }, 2000)
  }
  else {
    res.send({ "success": false, "message": "servicer aggregation already saved for this month/year" })
  }
});


app.get('/viewservicerdatadb', jsonParser, function (req, res) {
  let response1 = loansave.viewservicerdatadb(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/saveservicerdata', jsonParser, function (req, res) {
  let response1 = loansave.saveservicerdata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/saveDealDetailsbyDealIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.saveDealDetailsbyDealIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/getDealDetailsbyDealIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.getDealDetailsbyDealIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getPreviousDealDetails', jsonParser, function (req, res) {
  let response1 = dealOnbording.getPreviousDealDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getDealDetailsbyInvIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.getDealDetailsbyInvIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAllInvestmentsByInvId', jsonParser, function (req, res) {
  let response1 = dealOnbording.getAllInvestmentsByInvId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/SavePaymentSettings', jsonParser, async function (req, res) {
  let response = paymentsettings.AddDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getwiretransferdetails', jsonParser, async function (req, res) {
  let response = paymentsettings.GetWireTransferDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/transferUSDCtoInvestor', jsonParser, async function (req, res) {
  let response = paymentsettings.transferUSDC(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/layerzerosendmessage', jsonParser, async function (req, res) {
  let response = lazerzero.Sendmessage(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getDealsByIssuerId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsByIssuerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})

app.post('/updatetranchestatus', jsonParser, async function (req, res) {
  let response = tranche.updatetranchestatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

// app.get('/get', jsonParser, function (req, res) {
//   let response1 = dealOnbording.get(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });

// app.post('/save', jsonParser, function (req, res) {
//   let response1 = dealOnbording.save(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });

app.post('/updateDealreviewstatus', jsonParser, function (req, res) {

  let response1 = dealOnbording.updatereviewdealstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});

app.get('/getservicertransactiondetails', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.GetServicerTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/transferUSDCtoServicer', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.USDCMint(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/SaveTransactionDetails', jsonParser, function (req, res) {

  let response1 = SaveUserTransactions.SaveTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAllInvestorInvestmentsbyDealID', jsonParser, function (req, res) {

  let response1 = dealOnbording.getAllInvestorInvestmentsByDealID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getalltransactions', jsonParser, function (req, res) {

  let response1 = SaveUserTransactions.getAllTransactions(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getpayingagenttransactiondetails', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.GetPayingagentTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/testNFT', jsonParser, function (req, res) {

  let response = IPFSadd.addfile(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})



app.post('/updateUSDCtransferstatus', jsonParser, function (req, res) {

  let response = dealOnbording.updateUSDCtransferstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/servicerRedirect', jsonParser, function (req, res) {

  let response = dealOnbording.servicerRedirect(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getdealstatusbydealid', jsonParser, function (req, res) {
console.log("in")
  let response = dealOnbording.getdealstatusbydealid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})


app.get('/getAttributesByPoolName', jsonParser, function (req, res) {

  let response = Attribute.getAttributesByPoolName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(3005, () => console.log('server started on port 3005')).setTimeout(2000000000);

var listen = http.createServer(app).listen(4005, () => winlog.info('server started on port 4005'));
listen.setTimeout(2000000000);