const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const days360 = require('days360');
const uuidv4 = require('uuid/v4');
const { resolve } = require('dns');
const { resetPassword } = require('./userSignUp');
const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC"; // deployed contract address( can be taken from remix or index.js)
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
// var url = "mongodb://127.0.0.1:27017/";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
var request = require('request');
const winlog = require("../log/winstonlog");

var EventEmitter = require("events").EventEmitter;

var SaveTransaction = {

    SaveTransactionDetails: function (req, res) {
        const contractAddress = '0xeA6259655788900fA5B19131fC52995E65B2653c';
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "UserTransaction.sol");
        const contractname = "UserTransaction";
        const source = fs.readFileSync(contractPath, 'utf8');

        const input = {
            language: 'Solidity',
            sources: {
                [contractname + ".sol"]: {
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        //const bytecode = contractFile.evm.bytecode.object;
        const abi = contractFile.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        // prints date & time in YYYY-MM-DD format
        var currentdate = month + "-" + date + "-" + year;
        var finalarray = [[uuidv4().toString(), req.body.dealid, month.toString(), year.toString(), currentdate, req.body.senderid, req.body.receiverid, req.body.amountpaid, req.body.transactionHash,req.body.trancheid]];
        winlog.info(finalarray)
        const encoded = incrementer.methods.createUserTransaction(finalarray).encodeABI();
        const increment = async () => {
            winlog.info(
                `Calling the CreateUserTransaction function in  contract at address ${contractAddress}`
            );
            const createTransaction = await web3.eth.accounts.signTransaction(
                {
                    from: address,
                    to: contractAddress,
                    data: encoded,
                    gasLimit: 6000000,
                    chainId: "101122"
                },
                privKey
            ); const createReceipt = await web3.eth.sendSignedTransaction(
                createTransaction.rawTransaction
            );
            winlog.info(`save transaction successfull with hash: ${createReceipt.transactionHash}`);
            res.send({ "success": true, "message": "Transaction save success" });
        }; increment();

    },
    GetAllTransactions: function (req, res) {

        const contractAddress = '0xeA6259655788900fA5B19131fC52995E65B2653c';

        const contractPath = path.join(process.cwd() + "/api/contracts/UserTransaction.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "UserTransaction";
        const source = fs.readFileSync(contractPath, 'utf8');

        const input = {
            language: 'Solidity',
            sources: {
                [contractname + ".sol"]: {
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)
        const bytecode = contractFile.evm.bytecode.object;
        const abi = contractFile.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to payment settings contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getAllTransaction()
                .call({ from: address });

            var response = { "result": JSON.stringify(data) };
            winlog.info(response)
            var finalresponse = JSON.parse(response.result);
            var key = ["uniqueid", "dealid", "month", "year", "amountpaiddate", "senderid", "receiverid", "amountpaid", "transactionhash","trancheid"]
            var arr = [];
            for (var i = 0; i < finalresponse.length; ++i) {
                var json = {};
                for (var j = 0; j < key.length; ++j) {
                    json[key[j]] = finalresponse[i][j];
                }
                arr.push(json);

            }
            winlog.info(arr)

        }; get1();
    }
}
module.exports = SaveTransaction;