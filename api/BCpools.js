const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const contractAddress = "0xa6d2003E3207A7dC9618e5d48A0Cf3771bC8E3d8"; // deployed contract address( can be taken from remix or index.js)
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const winlog = require("../log/winstonlog");

var query = {

    querygetallpools: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
            // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
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
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllPools()
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                    "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                    "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {
                        json[key[j]] = finalresponse[i][j];
                    }
                    arr.push(json);
                }

                winlog.info(arr)
                resolve("success")
                winlog.info("final")
                res.send(arr)
            };

            get1();
        });
    },

    getallpoolsbyissuerid: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
            // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
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
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                winlog.info(req.query.issuerid)
                const data = await incrementer.methods
                    .getPoolsByIssuer(req.query.issuerid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                    "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                    "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {

                        json[key[j]] = finalresponse[i][j];
                    }
                    arr.push(json);

                }

                winlog.info(arr)
                resolve("success")
                winlog.info("final")
                res.send(arr)
            };

            get1();
        });
    },

    getallpoolsbyunderwriterid: function (req, res) {

        return new Promise((resolve, reject) => {

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
            // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
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
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPoolsByUnderWriter(req.query.underwriterid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                    "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                    "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {
                        json[key[j]] = finalresponse[i][j];
                    }
                    arr.push(json);

                }

                winlog.info(arr)
                resolve("success")
                winlog.info("final")
                res.send(arr)
            };

            get1();
        });
    },

    updatepoolstatus: function (req, res) {

        return new Promise((resolve, reject) => {

            winlog.info("get pool details:::::::::::")

            const contractPath = path.join(process.cwd() + "/api/contracts/CreatePool.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "CreatePool"
            // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
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
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPoolByPoolId(req.body.poolid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                    "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                    "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername"];

                winlog.info(finalresponse[11])
                finalresponse[11] = req.body.status
                UpdatePool([finalresponse]);

            };

            get1();
        });

        async function UpdatePool(pooldetails) {

            return new Promise((resolve, reject) => {

                winlog.info(pooldetails)
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
                const contractname = "CreatePool";
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

                const encoded = incrementer.methods.updatePool(pooldetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
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
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    res.send({ "success": true, "message": "Pool Update Success" });
                    resolve("pool update  success")
                }; increment();
            });
        }

    }
}
module.exports = query;