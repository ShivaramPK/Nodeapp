//Required modules
const ipfsAPI = require('ipfs-api');
const fs = require('fs');
const path = require('path');
let nodemailer = require("nodemailer");
const uuidv4 = require('uuid/v4');
var EventEmitter = require("events").EventEmitter;

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('104.42.155.78', '5001', { protocol: 'http' });

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const contractAddress = '0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4'; // deployed contract address( can be taken from remix or index.js)
const contractPath = path.resolve(__dirname, 'contracts', 'User.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const winlog = require("../log/winstonlog");

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

var userSignUp = {


  signUp: function (req, res, next) {

    if (!req.body.EmailAddress || !req.body.UserRole || !req.body.FirstName) {
      res.send({ token: -1 });
    } else {

      var inputEmit = new EventEmitter();
      var userId = uuidv4();
      // var accAddress = req.body.UserAccAddress;
      var accAddress = "";
      var emailid = req.body.EmailAddress;
      var fileHash = '';
      var UserSatus = "Active";
      var UserRole = req.body.UserRole
      var UserName = req.body.FirstName
      var inputData = [];
      // const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
      const incrementer = new web3.eth.Contract(abi, contractAddress);
      // var s = ["1", "dee@g.com", "sds22", "ok", "0X123"]  //passing array of string value

      //Reading file from computer
      let testFile = JSON.stringify(req.body)
      //Creating buffer for ipfs function to add file to the system
      let testBuffer = new Buffer(testFile);

      winlog.info(testBuffer + ":::");
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          winlog.info(err);
        }
        winlog.info(file)
        fileHash = file[0].hash;
        inputData.push(userId);
        inputData.push(emailid);
        inputData.push(fileHash);
        inputData.push(UserSatus);
        inputData.push(accAddress);
        inputData.push(UserRole);
        inputData.push(UserName)

        winlog.info(inputData);

        inputEmit.emit('save');
      })

      inputEmit.on('save', function () {
        //   const address = accAddress;

        //passing array of string value
        const encoded = incrementer.methods.saveUser(inputData).encodeABI(); // update is a function which accepts string array
        const increment = async () => {
          winlog.info(
            `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
          );
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 1883750,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          // winlog.info(createReceipt);
          var r = { "message": "User Registred Successfully", "transactionHash": createReceipt.transactionHash, "status": createReceipt.status }
          res.send(r);
        }; increment();

      }); // end of emit





    } // end of else

  },

  resetPassword: function (req, res, next) {


    var EmailId = req.body.EmailId;
    var Password = req.body.Password;
    var ipfsData = '';
    var inputData = [];
    var update = new EventEmitter();
    var updateHash = new EventEmitter();
    var userHash = '';
    var userData = '';
    const get1 = async () => {
      winlog.info(`Making a call to contract at address 11111111 ${contractAddress}`);
      var status = 'Active'
      const data = await incrementer.methods
        .getUserByEmailAndStatus(EmailId, status)
        .call({ from: address });
      winlog.info(`The current string is 22222222: ${data}`);
      winlog.info("data:: 3333" + JSON.stringify(data));

      var arr1 = JSON.parse(JSON.stringify(data));
      var resData = [];
      //for (var i = 0; i < arr1.length; i++) {
      // var resp = arr1[i].split("#");
      winlog.info(arr1.length + "444");
      if (arr1.length > 0) {
        userHash = arr1[0][2];
        userData = {
          "UserId": arr1[0][0],
          "EmailAddress": arr1[0][1],
          "UserHash": arr1[0][2],
          "UserSatus": arr1[0][3],
          "UserAccAddress": arr1[0][4],
          "UserRole": arr1[0][5],
          "UserName": arr1[0][6]
        };

        ipfs.files.get(arr1[0][2], function (err, files) {
          files.forEach((file) => {
            winlog.info(file.path + "555")
            winlog.info(file.content.toString('utf8') + "666")
            ipfsData = JSON.parse(file.content.toString('utf8'));

            ipfsData.Password = req.body.Password;
            update.emit('save');

            //  res.send(file.content.toString('utf8'));

          })
        })
        update.on('save', function () {

          winlog.info(ipfsData.Password + ":::7777");

          let testBuffer = new Buffer(JSON.stringify(ipfsData));


          ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
              winlog.info(err);
            } else {
              winlog.info(file)
              if (userHash == file[0].hash) {
                var r = { "message": "User password is updated sucessfully " }
                res.send(r);
              } else {

                inputData.push(userData.UserId);
                inputData.push(userData.EmailAddress);
                inputData.push(file[0].hash);
                inputData.push(userData.UserSatus);
                inputData.push(userData.UserAccAddress);
                inputData.push(userData.UserRole);
                inputData.push(userData.UserName);


                const encoded = incrementer.methods.saveUser(inputData).encodeABI(); // update is a function which accepts string array
                const increment = async () => {
                  winlog.info(
                    `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                  );
                  const createTransaction = await web3.eth.accounts.signTransaction(
                    {
                      from: address,
                      to: contractAddress,
                      data: encoded,
                      gasLimit: 1883750,
                      chainId: "101122"
                    },
                    privKey
                  ); const createReceipt = await web3.eth.sendSignedTransaction(
                    createTransaction.rawTransaction
                  );
                  winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                  // winlog.info(createReceipt);
                  var r = { "message": "User password is updated sucessfully " }
                  res.send(r);
                }; increment();

              }
            }
          });
        }); // end of emit

      } // end of if 
      else {
        var r = { "message": "Username is incorrect" }
        res.status(204).send(r);
      }

    };

    get1();

  },

  forgotPassword: function (req, res, next) {


    if (!req.query.EmailAddress) {
      res.send({ token: -1 });
    } else {
      var mailString = "You have requested to change the password. In order to change your password please click on the link : http://intainmarkets.intainabs.com/resetPassword?EmailAddress=" + req.query.EmailAddress;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "demo_emulya@intainft.com",
          pass: "welcome@12"
        }
      });
      // winlog.info("Value----"+JSON.stringify(obj.EmailID[i].EmailID));

      winlog.info("---------------------");
      winlog.info("Running Email Job");
      let mailOptions = {

        from: "demo_emulya@intainft.com",
        to: req.query.EmailAddress,
        subject: `Intain Platform Approval Status`,
        html: mailString
      };
      winlog.info("mailOptions::" + JSON.stringify(mailOptions));

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // throw error;
          winlog.info(error + "Email : " + req.query.EmailAddress);
          res.send(error + "Email : " + req.query.EmailAddress);

        } else {
          winlog.info("Email successfully sent!");
          res.send({ "message": "Email successfully sent!" });

        }
      });

    }
  },
  login: function (req, res, next) {



    var EmailId = req.body.EmailId;
    var Password = req.body.Password;


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
              var r = { "message": "User Authentication Successful", "data": ipfsData }
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
  },
  GetAllUserByUserRole: function (req, res, next) {

    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      const data = await incrementer.methods
        .getAllUsers()
        .call({ from: address });
      winlog.info(`The current string is: ${data}`);

      winlog.info("data:: " + JSON.stringify(data));

      var arr1 = JSON.parse(JSON.stringify(data));
      var resData = [];
      var objectWithGroupByName = {};
      for (var i = 0; i < arr1.length; i++) {
        // var resp = arr1[i].split("#");
        var c = {
          "UserRole": arr1[i][5],
          "UserName": arr1[i][6],
          "UserId": arr1[i][0]
        };
        if (!objectWithGroupByName[arr1[i][5]]) {
          objectWithGroupByName[arr1[i][5]] = [];
        }
        objectWithGroupByName[arr1[i][5]].push(c);
        if (i + 1 == arr1.length) {
          res.send(objectWithGroupByName);
        }

      }
      winlog.info(objectWithGroupByName)
    };
    get1();
  }

}

module.exports = userSignUp;