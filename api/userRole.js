const fs = require('fs');
const path = require('path');

const uuidv4 = require('uuid/v4');
var EventEmitter = require("events").EventEmitter;

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const contractAddress = '0xc681e3bb1C6Fa7C248327553E6caDB3c4A77E342'; // deployed contract address( can be taken from remix or index.js)
const contractPath = path.resolve(__dirname, 'contracts', 'UserRole.sol');
const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const winlog = require("../log/winstonlog");

const input = {
    language: 'Solidity',
    sources: {
        'UserRole.sol': {
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
const contractFile = tempFile.contracts['UserRole.sol']['UserRole'];
//winlog.info(contractFile)

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

const incrementer = new web3.eth.Contract(abi, contractAddress);

var UserRole = {


  createUserRole: function (req, res, next) {

    if (!req.body.UserRoleName) {
      res.send({ token: -1 });
    } else {
      var UserRoleID = uuidv4().toString();
      var UserRoleName = req.body.UserRoleName.toString();
     
      const inputData = [];
      inputData.push(UserRoleID);
      inputData.push(UserRoleName);
     // var a = ["1","2","3","4","5"]
      winlog.info(JSON.stringify(req.body) + " :::::::::::::::::::::::::::");

        winlog.info(JSON.stringify(inputData) + "    ::::::::");
       //passing array of string value
       const encoded = incrementer.methods.createUserRole(inputData).encodeABI(); // update is a function which accepts string array
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
         var r = {"message": "User Role created Successfully","transactionHash" : createReceipt.transactionHash , "status" : createReceipt.status}
         res.send(r);
       }; increment();

    } // end of else

  }, 
  //    GetAllUserRoles

  GetAllUserRoles : function( req, res, next){
      
    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      const data = await incrementer.methods
          .getAllUserRoles()
          .call({ from: address });
      winlog.info(`The current string is: ${data}`);

      winlog.info("data:: " + JSON.stringify(data));

      var arr1 = JSON.parse(JSON.stringify(data));
      var resData = [];
      for (var i = 0; i < arr1.length; i++) {
         // var resp = arr1[i].split("#");
          var c = {
              "UserRoleID": arr1[i][0],
              "UserRoleName": arr1[i][1]
          };
          resData.push(c);

          if (i + 1 == arr1.length) {
              res.send(resData);
          }

      }
      res.send([])
  };

  get1();
  }

}

module.exports = UserRole;