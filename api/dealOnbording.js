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

var query = {

    createDeal: function (req, res) {

        return new Promise((resolve, reject) => {


            var getPoolEmit = new EventEmitter();
            var dealOnboardEmit = new EventEmitter();

            let date = String(new Date().toJSON()).substring(0, 10);


            const poolCAddress = "0xa6d2003E3207A7dC9618e5d48A0Cf3771bC8E3d8";// Contract Call
            const poolcontractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
            const poolcontractname = "CreatePool";
            const poolsource = fs.readFileSync(poolcontractPath, 'utf8');

            const poolinput = {
                language: 'Solidity',
                sources: {
                    [poolcontractname + ".sol"]: {
                        content: poolsource,
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

            const tempFile1 = JSON.parse(solc.compile(JSON.stringify(poolinput)));
            //winlog.info(tempFile)
            const poolcontractFile = tempFile1.contracts[poolcontractname + ".sol"][poolcontractname];
            //winlog.info(contractFile)
            //const bytecode = contractFile.evm.bytecode.object;
            const abi1 = poolcontractFile.abi;
            const poolincrementer = new web3.eth.Contract(abi1, poolCAddress);

            var poolDetails = {};

            // dealOnboarding  : : 0x5B5fCE61bDBD3945D12b5b3FE75a59788c698885
            // dealTranching 	: : 0x4b6a36AFF20ca70Ebed8c49A7a32f88d870D459d
            // PaymentRules	: : 0x5C438f9e3d923063e9eAfCe79515b1119c8B8972

            //---------------------------------DealOnbordding solidity file configuration ------------------------------------------------------------------------
            const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
            const contractname = "DealOnboarding";
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
            //-------------------------------------------------------------------------------------------------------------

            const getPool = async () => {
                winlog.info(`Making a call to contract at address ${poolCAddress}`);
                const data = await poolincrementer.methods
                    .getPoolByPoolId(req.body.poolid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                //  winlog.info(JSON.stringify(data))
                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "poolid", "poolname", "issuerid", "assetclass", "assignverification",
                        "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
                        "status", "loanids", "typename", "filepath", "typepurpose", "attributes", "issuername", "assignpayingagent"];

                    // var arr = [];

                    //   for (var i = 0; i < finalresponse.length; ++i) {
                    var c = 0;
                    for (var j = 0; j < key.length; ++j) {
                        c++;
                        poolDetails[key[j]] = finalresponse[j];
                        if (c == key.length) {
                            dealOnboardEmit.emit('update');
                        }
                    }


                    //  }


                    winlog.info("final")
                } else {
                    res.send({
                        "isSuccess": false,
                        "message": "No Pool with poolid " + req.body.poolid
                    });
                }

            };

            getPool();

            dealOnboardEmit.on('update', function () {

                winlog.info("------------------------------------------------------");

                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency  20)dealSumary

                var dealDetails = [[poolDetails.uniqueID, poolDetails.poolid, poolDetails.poolname, poolDetails.assetclass,
                poolDetails.assignverification, poolDetails.assignservicer, poolDetails.issuerid, poolDetails.assignunderwriter,
                poolDetails.originalbalance, poolDetails.numberofloans, poolDetails.loanids, ' ', ' ', date, 'Created', ' ', ' ', ' ', ' ', ' ', ' ', poolDetails.assignpayingagent, "pending"]];




                const encoded = incrementer.methods.createDeal(dealDetails).encodeABI();
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
                    res.send({ "success": true, "message": "Deal Created Sucessfully" });
                    //resolve("pool save success")
                };

                increment();
            }); //end of dealonbaord emit




        });

    }, // end of create deal


    updatedealstatus: function (req, res) {

        return new Promise((resolve, reject) => {

            if (!req.body.dealid || !req.body.status) {
                res.status(400).send({ "message": "Missing Arguments!" })
            } else {

                winlog.info("get pool details:::::::::::")

                const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealOnboarding"
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
                        .getDealByDealId(req.body.dealid)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                        "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                        "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                        "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];
                    winlog.info(finalresponse[14])
                    finalresponse[14] = req.body.status
                    Updatedeal([finalresponse]);

                };

                get1();
            }
        });

        async function Updatedeal(dealdetails) {

            return new Promise((resolve, reject) => {

                winlog.info(dealdetails)
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
                const contractname = "DealOnboarding";
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

                const encoded = incrementer.methods.updateDeal(dealdetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the update function in deal onboarding contract at address ${contractAddress}`
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
                    res.send({ "success": true, "message": "Deal Update Status Success" });
                    resolve("pool update  success")
                }; increment();
            });
        }

    },

    updatereviewdealstatus: function (req, res) {

        return new Promise((resolve, reject) => {

            if (!req.body.dealid || !req.body.status) {
                res.status(400).send({ "message": "Missing Arguments!" })
            } else {

                winlog.info("get pool details:::::::::::")

                const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealOnboarding"
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
                        .getDealByDealId(req.body.dealid)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                        "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                        "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                        "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "approvestatus"];
                    winlog.info(finalresponse[22])
                    finalresponse[22] = req.body.status
                    Updatedeal([finalresponse]);

                };

                get1();
            }
        });

        async function Updatedeal(dealdetails) {

            return new Promise((resolve, reject) => {

                winlog.info(dealdetails)
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
                const contractname = "DealOnboarding";
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

                const encoded = incrementer.methods.updateDeal(dealdetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the update function in deal onboarding contract at address ${contractAddress}`
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
                    res.send({ "success": true, "message": "Deal Update Review Status Success" });
                    resolve("deal update  success")
                }; increment();
            });
        }

    },

    getDealsByUnderwriterId: function (req, res) {

        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
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

        const getDeal = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByUnderWriter(req.query.underwriterId)
                .call({ from: address });
            //  winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            //  winlog.info(JSON.stringify(data))
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];

                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {
                        json[key[j]] = finalresponse[i][j];
                    }
                    json["originalbalance"] = String((parseFloat(json["originalbalance"])).toFixed(2))
                    arr.push(json);
                }


                res.send(arr)
            } else {
                res.send([]);
            }

        };

        getDeal();

    },

    getscreendetails: function (req, res) {
        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
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

        const getDeal = async () => {
            winlog.info(`Making a call to DealOnboarding contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.query.dealid)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "closingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];

                var arr = [];
                var c1 = 0;
                let ts = Date.now();

                let date_ob = new Date(ts);
                let date = date_ob.getDate();
                let month = date_ob.getMonth() + 1;
                let year = date_ob.getFullYear();

                // prints date & time in YYYY-MM-DD format
                var currentdate = month + "-" + date + "-" + year;
                winlog.info("closing date and curret date:::::::" + finalresponse[15] + " " + currentdate)
                if (Date.parse(currentdate) > Date.parse(finalresponse[15])) {
                    winlog.info("Post closing::::::")
                    res.send({ "Dealdetails": "Post Closing" })
                } else {
                    winlog.info("pre closing:::::::")
                    res.send({ "Dealdetails": "Pre Closing" })

                }

            } else {
                res.send([])
            }

        }; getDeal();
    },

    getDealDetailsByDealId: function (req, res) {

        var dealData = {};
        var trancheData = [];
        var paymentRules = [];
        var dealDocuments = [];
        var loanData = [];

        var trancheDataEmiter = new EventEmitter();
        var paymentRulesEmiter = new EventEmitter();
        var dealdocEmiter = new EventEmitter();
        var loanDataEmiter = new EventEmitter();
        var UserEmitter = new EventEmitter();

        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
        const source = fs.readFileSync(contractPath, 'utf8');

        var month = "";
        var year = "";
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

        const getDeal = async () => {
            winlog.info(`Making a call to DealOnboarding contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.query.dealid)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            // winlog.info(JSON.stringify(data))
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "closingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "reviewstatus"];

                var arr = [];
                var c1 = 0;
                // for (var i = 0; i < finalresponse.length; ++i) {
                // var json = {};
                var date = finalresponse[17].split("-")
                if (date.length > 1) {
                    month = date[0];
                    year = date[2];
                }
                winlog.info(`month${month} year ${year} `)
                for (var j = 0; j < key.length; ++j) {
                    dealData[key[j]] = finalresponse[j];
                    c1++;

                    if (c1 == key.length) {
                        dealData["originalbalance"] = String((parseFloat(dealData["originalbalance"])).toFixed(2))
                        winlog.info(dealData)
                        UserEmitter.emit('getuserdetails');

                    }
                }

            } else {
                res.send(
                    {
                        "status": "true",
                        "dealData": dealData,
                        "trancheData": trancheData,
                        "paymentRules": paymentRules,
                        "dealDocuments": dealDocuments,
                        "loanData": loanData
                    })
            }

        }; getDeal();

        loanDataEmiter.on('getloans', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x217ED71D1b15e6ff20FA3559C1e4ad24f7011Fd0";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanContract.sol");
            const contractname = "LoanContract";
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

            const getloans = async () => {
                winlog.info(`Making a call to loan contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getLoansByPoolId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["DeployedContractAddress", "LoanID", "PoolID", "Remaining Loan Details"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};

                        // for (var j = 0; j < key.length; ++j) {
                        // json[key[j]] = finalresponse[i][j];
                        // }
                        c2++;
                        loanData.push(JSON.parse(finalresponse[i][3]));
                        if (c2 == finalresponse.length) {
                            trancheDataEmiter.emit('getranchedata')

                        }

                    }
                    // res.send(arr)
                } else {
                    trancheDataEmiter.emit('getranchedata')

                }

            }; getloans();

        }); // end of loan data emiter

        UserEmitter.on('getuserdetails', function () {
            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "User.sol");
            const contractname = "User";
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

            const getloans = async () => {
                winlog.info(`Making a call to user sol at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllUsers()
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole

                    var key = ["UserId", "EmailAddress", "UserHash", "UserSatus", "UserAccAddress", "userRole", "username"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        if (finalresponse[i][0] == req.query.userid) {
                            dealData["UserAccountAddress"] = finalresponse[i][4]
                        }
                        if (finalresponse[i][0] == dealData["vaId"]) {
                            dealData["VAUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["servicerId"]) {
                            dealData["ServicerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["issuerId"]) {
                            dealData["IssuerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["underwriterId"]) {
                            dealData["UnderWriterUserName"] = finalresponse[i][6]
                        }
                        c2++;

                        //   trancheData.push(json);
                        if (c2 == finalresponse.length) {

                            trancheDataEmiter.emit('getranchedata')
                        }

                    }


                    // res.send(arr)
                } else {
                    trancheDataEmiter.emit('getranchedata')
                }

            };

            getloans();
        })
        trancheDataEmiter.on('getranchedata', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
            const contractname = "DealTranche";
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

            const getloans = async () => {
                winlog.info(`Making a call to deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments", "approvestatus"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        c2++;
                        json["creditEnhancement"] = String((parseFloat(json["creditEnhancement"]) * 100).toFixed(3))
                        json["interestRate"] = String((parseFloat(json["interestRate"]) * 100).toFixed(3))
                        json["pricipalBalance"] = String((parseFloat(json["pricipalBalance"])).toFixed(2))
                        json["availablecommitments"] = String((parseFloat(json["availablecommitments"])).toFixed(2))
                        json["currentcommitments"] = String((parseFloat(json["currentcommitments"])).toFixed(2))
                        json["investedAmount"] = String((parseFloat(json["investedAmount"])).toFixed(2))

                        trancheData.push(json);
                        if (c2 == finalresponse.length) {
                            paymentRulesEmiter.emit('getpaymentrules')
                        }

                    }


                    // res.send(arr)
                } else {
                    paymentRulesEmiter.emit('getpaymentrules')

                }

            };

            getloans();

        }); // end of loan data emiter
        paymentRulesEmiter.on('getpaymentrules', function () {

            if (month != "" && year != "") {
                winlog.info("----------------------------------------------------------------");
                const contractAddress = "0x9D0774c0D43cBAA7e6D897cD4C98DE71775A9d4c";// Contract Call

                // winlog.info("inputdata:: " + loansave);
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentRules.sol");
                const contractname = "PaymentRules";
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

                const getloans = async () => {
                    winlog.info(`Making a call to payment rules at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getPaymentRulesByDealIdMonthAndYear(req.query.dealid, month, year)
                        .call({ from: address });
                    winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(JSON.stringify(data))
                    if (data.length > 0) {

                        var response = { "result": JSON.stringify(data) }
                        var finalresponse = JSON.parse(response.result)
                        var key = ["uniqueID", "dealId", "underwriterId", "paymentRule"];

                        // var arr = [];
                        var c2 = 0;
                        for (var i = 0; i < finalresponse.length; ++i) {
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                json[key[j]] = finalresponse[i][j];
                            }
                            c2++;
                            paymentRules.push(json);
                            if (c2 == finalresponse.length) {
                                dealdocEmiter.emit('getdealdoc')
                            }

                        }


                        // res.send(arr)
                    } else {
                        dealdocEmiter.emit('getdealdoc');
                    }

                };

                getloans();
            } else {
                dealdocEmiter.emit('getdealdoc');
            }

        }); //
        dealdocEmiter.on('getdealdoc', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x918e15De30d228DFdB741118f7683D920762B33e";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
            const contractname = "DealDocuments";
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

            const getloans = async () => {
                winlog.info(`Making a call to deal doc contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllDocumentsByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["documentid", "dealId", "documentname", "description", "privacymode", "documentpath", "underwriterid"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        c2++;
                        dealDocuments.push(json);
                        if (c2 == finalresponse.length) {
                            res.send(
                                {
                                    "status": "true",
                                    "dealData": dealData,
                                    "trancheData": trancheData,
                                    "paymentRules": paymentRules,
                                    "dealDocuments": dealDocuments,
                                    "loanData": loanData
                                })
                        }

                    }


                    // res.send(arr)
                } else {
                    res.send(
                        {
                            "status": "true",
                            "dealData": dealData,
                            "trancheData": trancheData,
                            "paymentRules": paymentRules,
                            "dealDocuments": dealDocuments,
                            "loanData": loanData
                        })
                }

            };

            getloans();

        }); // end of loan data emiter
    },

    getAllInvestorInvestmentsByDealID: function (req, res) {

        var UserNameEmitter = new EventEmitter();
        const contractAddress = "0xa2aa975858ef4C21e84EA1429936B887f19c889a";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
        const contractname = "MyInvestment";
        const source = fs.readFileSync(contractPath, 'utf8');
        var finaljson = []

        var month = "";
        var year = "";
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

        const getDeal = async () => {
            winlog.info(`Making a call to MyInvestment contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getTrancheByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                for (var i = 0; i < finalresponse.length; i++) {
                    var json = {
                        'trancheid': finalresponse[i][5],
                        'tranchename': finalresponse[i][6],
                        'investorid': finalresponse[i][4],
                        'totalpaid': parseFloat(finalresponse[i][11]).toFixed(2),
                        'USDCtransferstatus':finalresponse[i][17]
                    }
                    finaljson.push(json);
                }
                winlog.info(finaljson)
                UserNameEmitter.emit('getusernames')
                //  res.send(finaljson)
            } else {
                res.send([])
            }
        }; getDeal();
        UserNameEmitter.on('getusernames', () => {
            const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "User"
            var contractAddress = "0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4"
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
                    .getAllUsers()
                    .call({ from: address });
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse);
                winlog.info(finaljson)
                for (var i = 0; i < finaljson.length; i++) {
                    for (var j = 0; j < finalresponse.length; j++) {
                        winlog.info(finaljson[i]['investorid'] + " " + finalresponse[j][0])
                        if (finaljson[i]['investorid'] == finalresponse[j][0]) {
                            finaljson[i]['investorname'] = finalresponse[j][6]
                            break;
                        }
                    }
                }
                winlog.info(finaljson)
                res.send(finaljson)
            }; get1();

        })
    },
    getDealsByIssuerId: function (req, res) {
        winlog.info("getdetails by issuer id");
        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
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

        const getDeal = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByIssuerId(req.query.issuerid)
                .call({ from: address });
            //  winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            //  winlog.info(JSON.stringify(data))
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];

                var arr = [];
                for (var i = 0; i < finalresponse.length; ++i) {
                    var json = {};
                    for (var j = 0; j < key.length; ++j) {
                        json[key[j]] = finalresponse[i][j];
                    }
                    json["originalbalance"] = String((parseFloat(json["originalbalance"])).toFixed(2))
                    arr.push(json);
                }


                res.send(arr)
            } else {
                res.send([]);
            }

        };

        getDeal();

    },

    getInvestorDealDetailsByDealId: function (req, res) {

        var dealData = {};
        var trancheData = [];
        var paymentRules = [];
        var dealDocuments = [];
        var loanData = [];

        var trancheDataEmiter = new EventEmitter();
        var paymentRulesEmiter = new EventEmitter();
        var dealdocEmiter = new EventEmitter();
        var loanDataEmiter = new EventEmitter();
        var UserEmitter = new EventEmitter();

        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
        const source = fs.readFileSync(contractPath, 'utf8');

        var month = "";
        var year = "";
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

        const getDeal = async () => {
            winlog.info(`Making a call to DealOnboarding contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.query.dealid)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            // winlog.info(JSON.stringify(data))
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "closingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];
                var date = finalresponse[17].split("-")
                winlog.info("date ::" + date)
                if (date.length > 1) {
                    month = date[0];
                    year = date[2];
                }
                winlog.info(`month${month} year ${year} `)
                var arr = [];
                var c1 = 0;
                // for (var i = 0; i < finalresponse.length; ++i) {
                // var json = {};
                for (var j = 0; j < key.length; ++j) {
                    dealData[key[j]] = finalresponse[j];
                    c1++;

                    if (c1 == key.length) {
                        winlog.info(dealData)
                        UserEmitter.emit('getuserdetails');

                    }
                }

            } else {
                res.send(
                    {
                        "status": "true",
                        "dealData": dealData,
                        "trancheData": trancheData,
                        "paymentRules": paymentRules,
                        "dealDocuments": dealDocuments,
                        "loanData": loanData
                    })
            }

        }; getDeal();

        loanDataEmiter.on('getloans', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x217ED71D1b15e6ff20FA3559C1e4ad24f7011Fd0";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanContract.sol");
            const contractname = "LoanContract";
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

            const getloans = async () => {
                winlog.info(`Making a call to loan contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getLoansByPoolId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["DeployedContractAddress", "LoanID", "PoolID", "Remaining Loan Details"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};

                        // for (var j = 0; j < key.length; ++j) {
                        // json[key[j]] = finalresponse[i][j];
                        // }
                        c2++;
                        loanData.push(JSON.parse(finalresponse[i][3]));
                        if (c2 == finalresponse.length) {
                            trancheDataEmiter.emit('getranchedata')

                        }

                    }
                    // res.send(arr)
                } else {
                    trancheDataEmiter.emit('getranchedata')

                }

            }; getloans();

        }); // end of loan data emiter

        UserEmitter.on('getuserdetails', function () {
            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "User.sol");
            const contractname = "User";
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

            const getloans = async () => {
                winlog.info(`Making a call to user sol at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllUsers()
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole

                    var key = ["UserId", "EmailAddress", "UserHash", "UserSatus", "UserAccAddress", "userRole", "username"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        if (finalresponse[i][0] == dealData["vaId"]) {
                            dealData["VAUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["servicerId"]) {
                            dealData["ServicerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["issuerId"]) {
                            dealData["IssuerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["underwriterId"]) {
                            dealData["UnderWriterUserName"] = finalresponse[i][6]
                        }
                        c2++;

                        //   trancheData.push(json);
                        if (c2 == finalresponse.length) {

                            trancheDataEmiter.emit('getranchedata')
                        }

                    }


                    // res.send(arr)
                } else {
                    trancheDataEmiter.emit('getranchedata')
                }

            };

            getloans();
        })
        trancheDataEmiter.on('getranchedata', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
            const contractname = "DealTranche";
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

            const getloans = async () => {
                winlog.info(`Making a call to deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments"];


                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        c2++;
                        json["creditEnhancement"] = String((parseFloat(json["creditEnhancement"]) * 100).toFixed(3))
                        json["interestRate"] = String((parseFloat(json["interestRate"]) * 100).toFixed(3))
                        json["pricipalBalance"] = String((parseFloat(json["pricipalBalance"])).toFixed(2))
                        json["availablecommitments"] = String((parseFloat(json["availablecommitments"])).toFixed(2))
                        json["currentcommitments"] = String((parseFloat(json["currentcommitments"])).toFixed(2))
                        json["investedAmount"] = String((parseFloat(json["investedAmount"])).toFixed(2))

                        trancheData.push(json);
                        if (c2 == finalresponse.length) {
                            winlog.info("in")
                            trancheDataEmiter.emit('getinvestortranchedetails')
                        }

                    }


                    // res.send(arr)
                } else {
                    paymentRulesEmiter.emit('getpaymentrules')

                }

            };

            getloans();

        }); // end of loan data emiter

        trancheDataEmiter.on('getinvestortranchedetails', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0xc4D679505FC1d8fAF309a206c10BF9903cC19509";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
            const contractname = "InvestmentAndCommit";
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

            const getloans = async () => {
                winlog.info(`Making a call to deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheDetailsByInvestorIdAndDealId(req.query.investorid, req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["uniqueid", "dealId", "trancheName", "trancheid", "investorid", "commitAmount", "investAmount"];

                    // var arr = [];
                    var c2 = 0;

                    // winlog.info(finalresponse[i][3]+" "+finalresponse[i][5]+" "+finalresponse[i][6])
                    var counter = 0;
                    for (var j = 0; j < trancheData.length; ++j) {
                        counter = 0;
                        for (var i = 0; i < finalresponse.length; ++i) {
                            winlog.info(trancheData[j]['trancheId'] + " " + finalresponse[i][3])
                            if (trancheData[j]['trancheId'] == finalresponse[i][3]) {
                                winlog.info("inside")
                                trancheData[j]['investedAmount'] = String(parseFloat(finalresponse[i][6]).toFixed(2)); //investamont
                                trancheData[j]['currentcommitments'] = String(parseFloat(finalresponse[i][5]).toFixed(2)); //commit amount
                                counter++;
                                break;
                            }
                            c2++;
                        }
                        if (counter == 0) {
                            trancheData[j]['investedAmount'] = "0.00";
                            trancheData[j]['currentcommitments'] = "0.00";
                        }
                    }

                    winlog.info(c2 + " " + finalresponse.length);
                    paymentRulesEmiter.emit('getpaymentrules')

                    // res.send(arr)
                } else {
                    paymentRulesEmiter.emit('getpaymentrules')
                }

            };

            getloans();


        }); // end of loan data emiter

        paymentRulesEmiter.on('getpaymentrules', function () {
            if (year != "" && month != "") {
                winlog.info("----------------------------------------------------------------");
                const contractAddress = "0x9D0774c0D43cBAA7e6D897cD4C98DE71775A9d4c";// Contract Call

                // winlog.info("inputdata:: " + loansave);
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentRules.sol");
                const contractname = "PaymentRules";
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

                const getloans = async () => {
                    winlog.info(`Making a call to payment rules at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getPaymentRulesByDealIdMonthAndYear(req.query.dealid, month, year)
                        .call({ from: address });

                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(JSON.stringify(data))
                    if (data.length > 0) {
                        winlog.info("data:: " + JSON.stringify(data));
                        var response = { "result": JSON.stringify(data) }
                        var finalresponse = JSON.parse(response.result)
                        var key = ["uniqueID", "dealId", "underwriterId", "paymentRule"];

                        // var arr = [];
                        var c2 = 0;
                        for (var i = 0; i < finalresponse.length; ++i) {
                            var json = {};
                            for (var j = 0; j < key.length; ++j) {
                                json[key[j]] = finalresponse[i][j];
                            }
                            c2++;
                            paymentRules.push(json);
                            if (c2 == finalresponse.length) {
                                dealdocEmiter.emit('getdealdoc')
                            }

                        }


                        // res.send(arr)
                    } else {
                        dealdocEmiter.emit('getdealdoc');
                    }

                };

                getloans();
            } else {
                dealdocEmiter.emit('getdealdoc');

            }
        }); // end of loan data emiter

        dealdocEmiter.on('getdealdoc', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x918e15De30d228DFdB741118f7683D920762B33e";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
            const contractname = "DealDocuments";
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

            const getloans = async () => {
                winlog.info(`Making a call to deal doc contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllDocumentsByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["documentid", "dealId", "documentname", "description", "privacymode", "documentpath", "underwriterid"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        c2++;
                        dealDocuments.push(json);
                        if (c2 == finalresponse.length) {
                            res.send(
                                {
                                    "status": "true",
                                    "dealData": dealData,
                                    "trancheData": trancheData,
                                    "paymentRules": paymentRules,
                                    "dealDocuments": dealDocuments,
                                    "loanData": loanData
                                })
                        }

                    }


                    // res.send(arr)
                } else {
                    res.send(
                        {
                            "status": "true",
                            "dealData": dealData,
                            "trancheData": trancheData,
                            "paymentRules": paymentRules,
                            "dealDocuments": dealDocuments,
                            "loanData": loanData
                        })
                }

            };

            getloans();

        }); // end of loan data emiter
    },
    getAllDeals: function (req, res) {
        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
                    .getAllData()
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary"];

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

    getDealsbyServicerId: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
                    .getDealByServicer(req.query.servicerid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                winlog.info("data:: " + (req.query.servicerid));

                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary"];

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

    getDealsbyPayingagentId: function (req, res) {

        return new Promise((resolve, reject) => {
            //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
                    .getDealByPayingAgent(req.query.payingagentid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                winlog.info("data:: " + (req.query.servicerid));

                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary"];

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

    uploadapproach: function (req, res) {

        const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealOnboarding"
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

        const bytecode = contractFile.evm.bytecode.object;
        const abi = contractFile.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.body.dealid)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));

            if (data.length > 2) {
                // winlog.info(`The current string is: ` + data);
                var response = { "result": JSON.stringify(data) }
                // winlog.info(response)
                var finalresponse = JSON.parse(response.result)
                finalresponse[20] = req.body.uploadapproach
                winlog.info(finalresponse)

                winlog.info("final")
                Updatedeal([finalresponse]);
            }
            else {
                res.send({ "success": false, "message": "Deal upload approach save failed" });
            }

        };

        get1();


        async function Updatedeal(dealdetails) {

            return new Promise((resolve, reject) => {
                winlog.info(dealdetails)
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
                const contractname = "DealOnboarding";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.updateDeal(dealdetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the update function in deal onboarding contract at address ${contractAddress}`
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
                    res.send({ "success": true, "message": "Deal upload approach Success" });
                    resolve("Deal upload approach update success")
                };
                increment();
            });
        }
    },

    datequery: function (req, res) {

        const contractAddress = "0x1f30B339c4e3dE035261a24dC88B58C9782C726d"
        const contractPath = path.join(process.cwd() + "/api/contracts/Date.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "Date"
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

        const bytecode = contractFile.evm.bytecode.object;
        const abi = contractFile.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getByDealId(req.query.dealid)
                .call({ from: address });
            winlog.info("data:: " + JSON.stringify(data));

            if (data.length > 2) {
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var arr = [];
                var json = {
                    "month": finalresponse[4], "year": finalresponse[5], "previouspaymentdate": finalresponse[1],
                    "currentpaymentdate": finalresponse[2], "nextpaymentdate": finalresponse[3],
                    "confirmation": finalresponse[6], "assetclass": finalresponse[7]
                }
                arr.push(json)
                res.send(arr)
            }
            else {
                var arr = []
                res.send(arr)
            }

        };

        get1();

    },

    dateanalyse: function (req, res) {

        if ((req.body.input).length == 0) {

            winlog.info("sindie if")

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getDealByDealId(req.body.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));

                if (data.length > 2) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info("FPD: " + finalresponse[17])
                    if (String(finalresponse[17]).includes("-")) {
                        var a = String(finalresponse[17]).split("-")
                    }
                    else if (String(finalresponse[17]).includes("/")) {
                        var a = String(finalresponse[17]).split("/")
                    }
                    res.send({
                        "isSuccess": true, "month": a[0], "year": a[2], "confirmation": "No", "functiontodo": "save",
                        "previouspaymentdate": "", "currentpaymentdate": finalresponse[17], "nextpaymentdate": "", "assetclass": finalresponse[3]
                    })
                }
                else {
                    res.send({
                        "isSuccess": false,
                        "message": "no deal onboarded"
                    })
                }
            };

            get1();

        }
        else {

            winlog.info("sindie else")
            if (String((req.body.input[0]).confirmation).toLowerCase() == "yes") {
                if (parseInt((req.body.input[0]).month) == 12) {
                    var month = "1"
                    var year = parseInt((req.body.input[0]).year) + 1
                }
                else {
                    var month = parseInt((req.body.input[0]).month) + 1
                    var year = parseInt((req.body.input[0]).year)
                }
                res.send({
                    "isSuccess": true, "month": month, "year": year, "confirmation": "No", "functiontodo": "save",
                    "previouspaymentdate": req.body.input[0].previouspaymentdate, "currentpaymentdate": req.body.input[0].currentpaymentdate,
                    "nextpaymentdate": req.body.input[0].nextpaymentdate, "assetclass": req.body.input[0].assetclass
                })
            }
            else {
                res.send({
                    "isSuccess": true, "month": req.body.input[0].month, "year": req.body.input[0].year, "confirmation": "No",
                    "functiontodo": "update", "previouspaymentdate": req.body.input[0].previouspaymentdate, "currentpaymentdate": req.body.input[0].currentpaymentdate,
                    "nextpaymentdate": req.body.input[0].nextpaymentdate, "assetclass": req.body.input[0].assetclass
                })
            }
        }

    },

    datesave: function (req, res) {

        const contractAddress = "0x1f30B339c4e3dE035261a24dC88B58C9782C726d"
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "Date.sol");
        const contractname = "Date";
        const source = fs.readFileSync(contractPath, 'utf8');
        var c = -1

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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        const abi = contractFile.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);

        if (req.body.functiontodo != "save" && String(req.body.confirmation).toLowerCase() == "no") {
            c = -1;
            res.send({ "success": true, "message": "File upload Success for the same month/year" });
        }
        else {
            if (String(req.body.currentpaymentdate).includes("-")) {
                var a = String(req.body.currentpaymentdate).split("-")
                if (parseInt(a[0]) == 12) {
                    var nextpaymentdt = String("1-" + a[1] + "-" + (parseInt(a[2]) + 1))
                }
                else {
                    var nextpaymentdt = String((parseInt(a[0]) + 1) + "-" + a[1] + "-" + a[2])
                }
            }
            else if (String(req.body.currentpaymentdate).includes("/")) {
                var a = String(req.body.currentpaymentdate).split("/")
                if (parseInt(a[0]) == 12) {
                    var nextpaymentdt = String("1/" + a[1] + "/" + (parseInt(a[2]) + 1))
                }
                else {
                    var nextpaymentdt = String((parseInt(a[0]) + 1) + "/" + a[1] + "/" + a[2])
                }
            }

            if (req.body.functiontodo == "save") {
                var datedetails = [[req.body.dealid, "", req.body.currentpaymentdate, nextpaymentdt, req.body.month, req.body.year, req.body.confirmation, req.body.assetclass]]
                winlog.info("datedetails save: " + JSON.stringify(datedetails))
                c++;
                encoded1 = incrementer.methods.saveDate(datedetails).encodeABI();
            }
            else {
                c++;
                // winlog.info("res: "+(req.body.currentpaymentdate))    
                var datedetails = [req.body.currentpaymentdate, req.body.nextpaymentdate, nextpaymentdt, req.body.month, req.body.year, "No", req.body.assetclass]
                winlog.info("datedetails upd: " + JSON.stringify(datedetails))
                encoded1 = incrementer.methods.updateDate(req.body.dealid, datedetails).encodeABI();
            }

            if (c != -1) {
                const encoded = encoded1
                const increment = async () => {
                    winlog.info(
                        `Calling the update function in deal onboarding contract at address ${contractAddress}`
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
                    res.send({ "success": true, "message": "File upload Success" });
                }; increment();
            }
        }
    },


    saveDealDetailsbyDealIdPostClosing: function (req, res) {

        var dealData = {};
        var trancheData = [];
        var paymentRules = [];
        var paymentRulesarr = [];
        var dealDocuments = [];
        var loanData = [];
        var servicerdata = {};
        var poolcollections = {}
        var poolcurrentprinbal = "0.00"
        var importantdetails = {}
        var trancheres;
        var payment = 0;
        var firstpaymentdate = ""
        var dateinfo = []
        var dealonboarddata;
        var deal_name = ""
        var investorid = ""
        var mastertranche;

        var trancheDataEmiter = new EventEmitter();
        var paymentRulesEmiter = new EventEmitter();
        var dealdocEmiter = new EventEmitter();
        var loanDataEmiter = new EventEmitter();
        var servicerdataEmitter = new EventEmitter();
        var dateEmitter = new EventEmitter();
        var UserEmitter = new EventEmitter();

        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        const abi = contractFile.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);

        const getDeal = async () => {
            winlog.info(`Making a call to DealOnboarding contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.body.dealid)
                .call({ from: address });
            winlog.info("\n DealOnboarding data:: " + JSON.stringify(data));
            dealonboarddata = data;

            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "closingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary"];

                var arr = [];
                var c1 = 0;
                firstpaymentdate = finalresponse[17]
                deal_name = finalresponse[2]

                for (var j = 0; j < key.length; ++j) {
                    dealData[key[j]] = finalresponse[j];
                    c1++;

                    if (c1 == key.length) {
                        winlog.info(dealData)
                        UserEmitter.emit('getuserdetails')
                    }
                }

            } else {
                res.send({ "success": false, "message": "no deal onboarded" })
            }

        }; getDeal();

        loanDataEmiter.on('getloans', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x217ED71D1b15e6ff20FA3559C1e4ad24f7011Fd0";// Contract Call

            //    winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanContract.sol");
            const contractname = "LoanContract";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to loan contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getLoansByPoolId(req.body.dealid)
                    .call({ from: address });
                winlog.info("\n LoanContract data:: " + JSON.stringify(data));

                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["DeployedContractAddress", "LoanID", "PoolID", "Remaining Loan Details"];

                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};

                        c2++;
                        loanData.push(JSON.parse(finalresponse[i][3]));
                        if (c2 == finalresponse.length) {
                            dealdocEmiter.emit('getdealdoc')
                        }
                    }
                    // res.send(arr)
                } else {
                    dealdocEmiter.emit('getdealdoc')

                }

            }; getloans();

        }); // end of loan data emiter

        UserEmitter.on('getuserdetails', function () {
            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x406B4E6c6B050aFf6BfF6E06D60BD664fb657DB4";// Contract Call

            // winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "User.sol");
            const contractname = "User";
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

            const getloans = async () => {
                winlog.info(`Making a call to user sol at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllUsers()
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole

                    var key = ["UserId", "EmailAddress", "UserHash", "UserSatus", "UserAccAddress", "userRole", "username"];

                    // var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        if (finalresponse[i][0] == dealData["vaId"]) {
                            dealData["VAUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["servicerId"]) {
                            dealData["ServicerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["issuerId"]) {
                            dealData["IssuerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == dealData["underwriterId"]) {
                            dealData["UnderWriterUserName"] = finalresponse[i][6]
                        }
                        c2++;
                        if (c2 == finalresponse.length) {
                            dealdocEmiter.emit('getdealdoc')
                        }
                    }
                } else {
                    dealdocEmiter.emit('getdealdoc')
                }
            };
            getloans();
        })


        dealdocEmiter.on('getdealdoc', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x918e15De30d228DFdB741118f7683D920762B33e";// Contract Call

            //    winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
            const contractname = "DealDocuments";
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

            const getloans = async () => {
                winlog.info(`Making a call to loan contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getAllDocumentsByDealId(req.body.dealid)
                    .call({ from: address });
                winlog.info("\n DealDocuments data:: " + JSON.stringify(data));

                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    var key = ["documentid", "dealId", "documentname", "description", "privacymode", "documentpath", "underwriterid"];

                    //  var arr = [];
                    var c2 = 0;
                    for (var i = 0; i < finalresponse.length; ++i) {
                        var json = {};
                        for (var j = 0; j < key.length; ++j) {
                            json[key[j]] = finalresponse[i][j];
                        }
                        c2++;
                        dealDocuments.push(json);
                        if (c2 == finalresponse.length) {
                            servicerdataEmitter.emit('getservicerdata')
                        }
                    }
                } else {
                    servicerdataEmitter.emit('getservicerdata')
                }

            };

            getloans();

        }); // end of loan data emiter    

        servicerdataEmitter.on('getservicerdata', function () {

            const contractAddress = "0x1575174BdDC3D548455973010E5363b6B1a718F7";
            const contractPath = path.join(process.cwd() + "/api/contracts/ServicerData.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "ServicerData"
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
                    .getServicerDataByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                    .call({ from: address });

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info("\n Servicer data:: " + JSON.stringify(JSON.parse(finalresponse[0][4])));
                    // winlog.info("collections data:: " + JSON.stringify(JSON.parse(finalresponse[0][4]).collections));
                    servicerdata = JSON.parse(finalresponse[0][4])

                    var col = servicerdata.collections;
                    poolcollections = {
                        "InterestCollected": col[0].Balance,
                        "PrincipalCollected": col[1].Balance,
                        "TotalCollections": col[2].Balance
                    }
                    poolcurrentprinbal = servicerdata.collateral[servicerdata.collateral.length - 1].Balance;
                    winlog.info("\n poolcollections data:: " + JSON.stringify(poolcollections) +
                        "\n\n poolcurrentprinbal: " + poolcurrentprinbal);

                    dateEmitter.emit('getdate')
                }
                else {
                    dateEmitter.emit('getdate')
                }

            }; get1();
        });

        dateEmitter.on('getdate', function () {

            var fpd = firstpaymentdate.split("-")

            const contractAddress = "0x1f30B339c4e3dE035261a24dC88B58C9782C726d"
            const contractPath = path.join(process.cwd() + "/api/contracts/Date.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "Date"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getByDealId(req.body.dealid)
                    .call({ from: address });
                winlog.info("\n date info:: " + JSON.stringify(data));
                dateinfo = data;

                if (data.length > 2) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    importantdetails = {
                        "PoolCurrentPrincipalBalance": poolcurrentprinbal,
                        "PreviousPaymentDate": finalresponse[1],
                        "NextPaymentDate": finalresponse[3],
                        "AsOfDate": finalresponse[2]
                    }
                    winlog.info("\n important details data:: " + JSON.stringify(importantdetails))

                    if (parseInt(fpd[0]) == req.body.month && parseInt(fpd[2]) == req.body.year) {
                        trancheDataEmiter.emit('getmastertranchedata')
                    }
                    else {
                        trancheDataEmiter.emit('getranchedata')
                    }
                }
                else {
                    if (parseInt(fpd[0]) == req.body.month && parseInt(fpd[2]) == req.body.year) {
                        trancheDataEmiter.emit('getmastertranchedata')
                    }
                    else {
                        trancheDataEmiter.emit('getranchedata')
                    }
                }

            };
            get1();
        })

        trancheDataEmiter.on('getmastertranchedata', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
            const contractname = "DealTranche";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to master deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByDealId(req.body.dealid)
                    .call({ from: address });

                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    trancheres = JSON.parse(response.result)
                    // trancheres = [
                    //     ["4edd698e-2c31-413f-ba5f-60d949d88ea5", "222IMIR11", "Certificate A", "0.1930", "10000000", "0.0136", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"],
                    //     ["4edd698e-2c31-413f-ba5f-60d949d88ea6", "222IMIR11", "Certificate B", "0.00", "2391190.61", "Residual", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"]
                    // ]
                    winlog.info("master tranche date:: " + JSON.stringify(trancheres))

                    paymentRulesEmiter.emit('getpaymentrules')

                } else {
                    paymentRulesEmiter.emit('getpaymentrules')
                }
            };
            getloans();

        }); // end of loan data emiter


        trancheDataEmiter.on('getranchedata', function () {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x4CfDc0AD2cD908e900fc4D0E754396838b828beF";// Contract Call

            //    winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealCalcTranche.sol");
            const contractname = "DealCalcTranche";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to deal calc tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                    .call({ from: address });

                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    trancheres = JSON.parse(response.result)
                    // trancheres = [
                    //     ["4edd698e-2c31-413f-ba5f-60d949d88ea5", "222IMIR11", "Certificate A", "0.1930", "10000000", "0.0136", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"],
                    //     ["4edd698e-2c31-413f-ba5f-60d949d88ea6", "222IMIR11", "Certificate B", "0.00", "2391190.61", "Residual", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"]
                    // ]
                    winlog.info("monthly tranche date:: " + JSON.stringify(trancheres))

                    paymentRulesEmiter.emit('getpaymentrules')

                } else {
                    paymentRulesEmiter.emit('getpaymentrules')
                }
            };
            getloans();

        }); // end of loan data emiter

        paymentRulesEmiter.on('getpaymentrules', function () {

            if (payment == 1) {
                if (parseInt(req.body.month) == 1) {
                    var month = String(12);
                    var year = String(parseInt(req.body.year) - 1);
                }
                else {
                    var month = String(parseInt(req.body.month) - 1);
                    var year = req.body.year;
                }
            } else {
                var month = req.body.month;
                var year = req.body.year;
            }

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0x9D0774c0D43cBAA7e6D897cD4C98DE71775A9d4c";// Contract Call

            //    winlog.info("inputdata:: " + loansave);
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentRules.sol");
            const contractname = "PaymentRules";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to payment rules at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPaymentRulesByDealIdMonthAndYear(req.body.dealid, month, year)
                    .call({ from: address });

                // winlog.info("payment rules data: " + JSON.stringify(data))
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    paymentRules = JSON.parse(response.result)

                    // paymentRules = [
                    //     ["ab16a3ab-d096-436f-85ee-9635cc526c5b", "222IMIR11", "36bf3604-cea2-494f-9627-be347c5e4f0c", "Interest collected, first, to the payment of deal fees", "0", "10", "2021"],
                    //     ["483b9e70-5c93-43d2-ae1e-e8289ecc58b8", "222IMIR11", "36bf3604-cea2-494f-9627-be347c5e4f0c", "Interest collected, second, to the payment of interest to Certifcate A noteholders", "0", "10", "2021"],
                    //     ["be875712-610f-4fca-8fbe-ba44931812f3", "222IMIR11", "36bf3604-cea2-494f-9627-be347c5e4f0c", "Principal collected, first, to the payment of principal to Certficate A notehoders", "0", "10", "2021"],
                    //     ["be875712-610f-4fca-8fbe-ba44931812f1", "222IMIR11", "36bf3604-cea2-494f-9627-be347c5e4f0c", "Principal collected, first, to the payment of principal to Certficate A notehoders", "0", "10", "2021"],
                    //     ["be875712-610f-4fca-8fbe-ba44931812f2", "222IMIR11", "36bf3604-cea2-494f-9627-be347c5e4f0c", "Principal collected, first, to the payment of principal to Certficate A notehoders", "0", "10", "2021"],
                    // ]

                    winlog.info("payment rules data after :: " + JSON.stringify(paymentRules))

                    if (payment == 1) {

                        var check = 0;
                        for (var i = 0; i < paymentRules.length; i++) {
                            paymentRules[i][0] = uuidv4().toString()
                            paymentRules[i][4] = "0.00"
                            paymentRules[i][5] = String(month)
                            paymentRules[i][6] = String(year)
                            check++
                            if (check == paymentRules.length) {
                                paymentRulesEmiter.emit('paymenttranchecalc', payment)
                            }
                        }
                    }
                    else {

                        // var check = 0;
                        // for (var i = 0; i < paymentRules.length; i++) {
                        //     paymentRules[i][5] = String(month)
                        //     paymentRules[i][6] = String(year)
                        //     check++
                        //     if (check == paymentRules.length) {
                        paymentRulesEmiter.emit('paymenttranchecalc', payment)
                        //     }
                        // }
                    }

                } else {
                    payment++;
                    if (payment > 1) {
                        res.send({ "success": false, "message": "no payment rules found" })
                    }
                    else {
                        paymentRulesEmiter.emit('getpaymentrules')
                    }
                }
            };
            getloans();

        }); // end of loan data emiter

        paymentRulesEmiter.on('paymenttranchecalc', function (payment) {

            //paymentrules 
            var cldate = ""
            if (dateinfo[1] == "" || dateinfo[1] == null || String(dateinfo[1]) == "null") {
                cldate = dealonboarddata[15]
            }
            else {
                cldate = dateinfo[1]
            }
            var date1 = new Date(cldate);
            var date2 = new Date(dateinfo[2]);
            winlog.info("date1: " + cldate + "    date2: " + dateinfo[2])
            var diffDays = days360(new Date(date1), new Date(date2));
            // var diffDays = days360(new Date("8-13-2021"), new Date("10-25-2021"));
            winlog.info("no of diff days:" + diffDays);

            var intowed = parseFloat(trancheres[0][4]) * parseFloat(trancheres[0][5]) * diffDays / 360
            winlog.info("int owed: " + intowed)

            var Remainingarr = []
            var owedarr = [0, parseFloat(intowed), 999999999, parseFloat(trancheres[0][4]), parseFloat(trancheres[1][4])]
            Remainingarr.push(parseFloat(servicerdata.collections[0].Balance))
            // Remainingarr.push(48664.9)
            winlog.info("Remainingarr[0]:" + Remainingarr[0])
            paymentRules[0][4] = String(parseFloat(Math.min(owedarr[0], Remainingarr[0]).toFixed(2)))
            winlog.info("paymentRules[0][4]:  " + paymentRules[0][4])

            Remainingarr[1] = parseFloat(Remainingarr[0]) - parseFloat(paymentRules[0][4])
            winlog.info("Remainingarr[1]:" + Remainingarr[1])
            paymentRules[1][4] = String(parseFloat(Math.min(owedarr[1], Remainingarr[1]).toFixed(2)))
            winlog.info("paymentRules[1][4]:  " + paymentRules[1][4])

            Remainingarr[2] = parseFloat(Remainingarr[1]) - parseFloat(paymentRules[1][4])
            winlog.info("Remainingarr[2]:" + Remainingarr[2])
            paymentRules[2][4] = String(parseFloat(Math.min(owedarr[2], Remainingarr[2]).toFixed(2)))
            winlog.info("paymentRules[2][4]:  " + paymentRules[2][4])

            // Remainingarr.push(parseFloat(servicerdata.collections[1].Balance))
            Remainingarr.push(19390.33)
            winlog.info("Remainingarr[3]:" + Remainingarr[3])
            paymentRules[3][4] = String(parseFloat(Math.min(owedarr[3], Remainingarr[3]).toFixed(2)))
            winlog.info("paymentRules[3][4]:  " + paymentRules[3][4])

            Remainingarr[4] = parseFloat(Remainingarr[3]) - parseFloat(paymentRules[3][4])
            winlog.info("Remainingarr[4]:" + Remainingarr[4])
            paymentRules[4][4] = String(parseFloat(Math.min(owedarr[4], Remainingarr[4]).toFixed(2)))
            winlog.info("paymentRules[4][4]:  " + paymentRules[4][4])

            // winlog.info("\n \n paymentRules after updation: " + JSON.stringify(paymentRules))

            var key = ["uniqueID", "dealId", "underwriterId", "paymentRule", "amountPaid", "month", "year"];
            for (var i = 0; i < paymentRules.length; ++i) {
                var json = {};
                for (var j = 0; j < key.length; ++j) {
                    if (key[j] == "amountPaid") {
                        json[key[j]] = parseFloat(paymentRules[i][j]).toFixed(2);
                    }
                    else {
                        json[key[j]] = paymentRules[i][j];
                    }
                }
                paymentRulesarr.push(json);
            }
            winlog.info("\n \n paymentRulesarr after updation ordering: " + JSON.stringify(paymentRulesarr))


            for (var i = 0; i < trancheres.length; i++) {
                if (i == 0) {
                    var intowe = String(parseFloat(intowed).toFixed(2))
                    var intpaid = parseFloat(paymentRules[1][4]).toFixed(2)
                    var prinpaid = parseFloat(paymentRules[3][4]).toFixed(2)
                }
                else {
                    var intowe = trancheres[i][5]
                    var intpaid = parseFloat(paymentRules[2][4]).toFixed(2)
                    var prinpaid = parseFloat(paymentRules[4][4]).toFixed(2)
                }
                var totalpaid = (parseFloat(intpaid) + parseFloat(prinpaid)).toFixed(2)
                var endbal = String((parseFloat(trancheres[i][4]) - parseFloat(prinpaid)).toFixed(2))

                var json = {
                    "Tranche ID": trancheres[i][0],
                    "Tranche Name": trancheres[i][2],
                    "Beginning Balance": String(parseFloat(trancheres[i][4]).toFixed(2)),
                    "Interest Owed": intowe,
                    "Interest Paid": String(intpaid),
                    "Principal Paid": String(prinpaid),
                    "Total Paid": String(totalpaid),
                    "Ending Balance": endbal
                }
                trancheData.push(json)
            }
            winlog.info("\n Updated tranche arr: " + JSON.stringify(trancheData))

            setTimeout(() => {
                savedealdetails(payment);
            }, 1000);
        })

        async function savedealdetails(payment) {

            winlog.info("payment: " + payment)
            if (payment == 1) {
                var functiontodo = "createPaymentRule"
            }
            else {
                var functiontodo = "updatePaymentRule"
            }

            var saveupdatepaymentrule = await saveupdatepaymentrules(functiontodo);
            if (saveupdatepaymentrule.success) {
                var saveupdatetranch = await saveupdatetranche();
                if (saveupdatetranch.success) {

                    var json = {
                        "dealData": dealData,
                        "paymentRules": paymentRulesarr,
                        "dealDocuments": dealDocuments,
                        "trancheData": trancheData,
                        "servicerData": servicerdata,
                        "importantDetails": importantdetails,
                        "poolCollections": poolcollections,
                        "loanData": loanData
                    }
                    var postclosng = await postclosing(json);
                    if (postclosng.success) {
                        myinvestmentsave();
                    }
                    else {
                        res.send({ "success": false, "message": "post closing data save failed" })
                    }
                }
                else {
                    res.send({ "success": false, "message": "tranche data save failed" })
                }
            }
            else {
                res.send({ "success": false, "message": "payment data save failed" })
            }
        }


        function saveupdatepaymentrules(functiontodo) {

            return new Promise((resolve, reject) => {

                const contractAddress = "0x9D0774c0D43cBAA7e6D897cD4C98DE71775A9d4c"; // deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "PaymentRules.sol");
                const contractname = "PaymentRules";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);


                const encoded = incrementer.methods[functiontodo]([paymentRulesarr]).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the increment  function in PaymentRules contract at address ${contractAddress}`
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
                    resolve({ "success": true, "message": "payment data saved success" })
                }; increment();
            })
        }

        function saveupdatetranche() {

            return new Promise((resolve, reject) => {

                const contractAddress = "0x4CfDc0AD2cD908e900fc4D0E754396838b828beF"; // deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealCalcTranche.sol");
                const contractname = "DealCalcTranche";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                // winlog.info("Trancheee:::: " + [[uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, JSON.stringify(trancheData)]])

                const encoded = incrementer.methods.saveDealCalcTranche([[uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, JSON.stringify(trancheData)]]).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the increment  function in tranche contract at address ${contractAddress}`
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
                    resolve({ "success": true, "message": "tranche data saved success" })

                }; increment();
            })
        }

        function postclosing(data) {
            return new Promise((resolve, reject) => {

                const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25"; // deployed contract address( can be taken from remix or index.js)                    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "PostClosing.sol");
                const contractname = "PostClosing";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                var postclosingdata = [[uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, dateinfo[2], JSON.stringify(data), "pending"]]
                // winlog.info("postclosingdata : "+JSON.stringify(postclosingdata))
                const encoded = incrementer.methods.savePostClosing(postclosingdata).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the increment  function in postclosing contract at address ${contractAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: contractAddress,
                            data: encoded,
                            gasLimit: 8000000,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    resolve({ "success": true, "message": "post closing data saved success" })
                }; increment();
            })
        }

        function myinvestmentsave() {

            var trancheres;
            var investmentres;
            var event1 = new EventEmitter();

            winlog.info("myinvestmentsave: ")
            const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
            const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PostClosing"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to PostClosing contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPostClosingByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                    .call({ from: address });

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    finalresponse = JSON.parse(finalresponse[0][5])
                    // winlog.info("post closing data: " + JSON.stringify(finalresponse))

                    event1.emit("querymastertranche", finalresponse)
                }
                else {
                    res.sendStatus(204);
                }

            }; get1();


            event1.on("querymastertranche", function (finalresponse) {

                winlog.info("----------------------------------------------------------------");
                const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
                const contractname = "DealTranche";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const getloans = async () => {
                    winlog.info(`Making a call to master deal tranche at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByDealId(req.body.dealid)
                        .call({ from: address });

                    if (data.length > 0) {

                        var response = { "result": JSON.stringify(data) }
                        trancheres = JSON.parse(response.result)
                        // trancheres = [
                        //     ["4edd698e-2c31-413f-ba5f-60d949d88ea5", "222IMIR11", "Certificate A", "0.1930", "10000000", "0.0136", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"],
                        //     ["4edd698e-2c31-413f-ba5f-60d949d88ea6", "222IMIR11", "Certificate B", "0.00", "2391190.61", "Residual", "NaN", "active", "0xB8b36202Cf8705EE95D79c31b18a359d34f5ed85", "08-13-2021", "2500", "12404747"]
                        // ]
                        // winlog.info("master tranche date:: " + JSON.stringify(trancheres))
                        mastertranche = trancheres

                        event1.emit("InvestmentAndCommitquery", finalresponse, trancheres)

                    } else {
                        res.sendStatus(204);
                    }
                };
                getloans();

            })


            event1.on("InvestmentAndCommitquery", function (finalresponse, trancheres) {


                winlog.info("post closing data: " + JSON.stringify(finalresponse))
                winlog.info("master tranche date:: " + JSON.stringify(trancheres))

                winlog.info("----------------------------------------------------------------");
                const contractAddress = "0xc4D679505FC1d8fAF309a206c10BF9903cC19509";// Contract Call
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
                const contractname = "InvestmentAndCommit";
                const source = fs.readFileSync(contractPath, 'utf8');

                const input = {
                    language: 'Solidity',
                    sources: {
                        [contractname + ".sol"]: {
                            content: source,
                        },                        // event1.emit("InvestmentAndCommitquery", finalresponse, trancheres)

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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const getloans = async () => {
                    winlog.info(`Making a call to InvestmentAndCommit at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByDealId(req.body.dealid)
                        .call({ from: address });

                    if (data.length > 0) {

                        var response = { "result": JSON.stringify(data) }
                        investmentres = JSON.parse(response.result)
                        // investmentres = [["c3709831-2547-4bac-9614-244fa381e287", "222IMIR33", "Certificate A", "7fe632c6-45ec-4679-b25f-d42ddd82906b", "bac3021a-2333-49f6-b5a7-c818d4625663", "200", "200"]]

                        winlog.info("investmentres data::; " + JSON.stringify(investmentres))

                        if (investmentres.length > 0) {
                            myinvcalc(finalresponse, trancheres, investmentres)
                        }
                        else {
                            res.sendStatus(204);
                        }
                    } else {
                        res.send({ "success": true, "message": "No investments for this deal" })
                    }
                }; getloans();
            })


            async function myinvcalc(finalresponse, trancheres, investmentres) {

                var myinvarr = []
                var cum_intpaid = 0.00
                var cum_prinpaid = 0.00
                var c = 0

                winlog.info("finalresponse myinvcalc : " + JSON.stringify(finalresponse))

                for (var i = 0; i < investmentres.length; i++) {
                    for (var j = 0; j < finalresponse.trancheData.length; j++) {
                        if (investmentres[i][3] == finalresponse.trancheData[j]['Tranche ID']) {

                            c++;
                            var orgprin = parseFloat(trancheres[j][4])
                            var invamt = parseFloat(investmentres[i][6])
                            if (parseFloat(invamt).toFixed(2) == 0.00) {
                                winlog.info("invamt is zero----------")
                                break;
                            }
                            else {
                                var begbal = parseFloat(finalresponse.trancheData[j]['Beginning Balance']) * (invamt / orgprin)
                                var intpaid = parseFloat(finalresponse.trancheData[j]['Interest Paid']) * (invamt / orgprin)
                                var prinpaid = parseFloat(finalresponse.trancheData[j]['Principal Paid']) * (invamt / orgprin)
                                var totalpaid = parseFloat(finalresponse.trancheData[j]['Total Paid']) * (invamt / orgprin)
                                var endbal = parseFloat(finalresponse.trancheData[j]['Ending Balance']) * (invamt / orgprin)
                                var orgprinbal = parseFloat(orgprin) * (invamt / orgprin)

                                var res = await cumulativepaid(req.body.dealid, req.body.month, req.body.year, investmentres[i][4], finalresponse.trancheData[j]['Tranche ID'])
                                winlog.info("res: " + JSON.stringify(res))
                                cum_intpaid = intpaid + parseFloat(res.cumintpaid)
                                cum_prinpaid = prinpaid + parseFloat(res.cumprinpaid)
                                var cumtotal = parseFloat(cum_intpaid) + parseFloat(cum_prinpaid)

                                myinvarr.push([uuidv4().toString(), req.body.dealid, req.body.month, req.body.year, investmentres[i][4], finalresponse.trancheData[j]['Tranche ID'],
                                finalresponse.trancheData[j]['Tranche Name'], deal_name, String(begbal), String(intpaid), String(prinpaid),
                                String(totalpaid), String(endbal), String(orgprinbal), String(cum_intpaid), String(cum_prinpaid), String(cumtotal), "pending"])

                                break;
                            }
                        }
                    }
                }
                if (c == investmentres.length) {

                    winlog.info("myinvarr: " + JSON.stringify(myinvarr) + "     " + investmentres.length)
                    savemyinvesment(myinvarr)
                }
            }


            function cumulativepaid(dealid, t_month, t_year, inv_id, t_id) {

                return new Promise((resolve, reject) => {

                    if (parseInt(t_month) == 1) {
                        var month = String(12);
                        var year = String(parseInt(t_year) - 1);
                    }
                    else {
                        var month = String(parseInt(t_month) - 1);
                        var year = t_year;
                    }

                    winlog.info("----------------------------------------------------------------");
                    const contractAddress = "0xa2aa975858ef4C21e84EA1429936B887f19c889a";// Contract Call
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
                    const contractname = "MyInvestment";
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
                    const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                    const abi = contractFile.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    const getloans = async () => {
                        winlog.info(`Making a call to MyInvestment contract at address ${contractAddress}`);
                        const data = await incrementer.methods
                            .getByDealIdMonthYearInvestorIdAndTrancheId(dealid, month, year, inv_id, t_id)
                            .call({ from: address });

                        if (data.length > 0) {

                            var response = { "result": JSON.stringify(data) }
                            var myinvestmentres = JSON.parse(response.result)
                            investorid = inv_id;

                            resolve({ "cumintpaid": myinvestmentres[0][14], "cumprinpaid": myinvestmentres[0][15] })

                        } else {
                            resolve({ "cumintpaid": "0.00", "cumprinpaid": "0.00" })
                        }
                    };
                    getloans();
                })
            }

            function savemyinvesment(myinvarr) {

                const contractAddress = "0xa2aa975858ef4C21e84EA1429936B887f19c889a"; // deployed contract address( can be taken from remix or index.js)    
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
                const contractname = "MyInvestment";
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                winlog.info("\n myinvarr:    " + JSON.stringify(myinvarr))
                const encoded = incrementer.methods.createMyInvestment(myinvarr).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the increment  function in MyInvestment contract at address ${contractAddress}`
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
                    setTimeout(() => {
                        res.send({ "success": true, "message": "My investments and postclosing data saved success" })
                    }, 1000);

                }; increment();
                bdbfunction(myinvarr)

            }

            function bdbfunction(myinvarr) {

                var bdbarr = [];

                var c3 = 0;
                if (parseInt(req.body.month) < 10) {
                    var bdbmon = "0" + req.body.month;
                }
                else {
                    var bdbmon = req.body.month;
                }


                for (var i = 0; i < myinvarr.length; i++) {

                    for (var j = 0; j < mastertranche.length; j++) {

                        if (String(myinvarr[i][5]) == String(mastertranche[j][0])) {

                            var currentinv = parseFloat(myinvarr[i][8]) - parseFloat(myinvarr[i][15])

                            //09-21-2022"
                            //"AsOfDate":"10-25-2021
                            var date1 = new Date(importantdetails.AsOfDate);
                            var date2 = new Date(dealData.closingDate);
                            //winlog.info("date1: " + date1 + "    date2: " + date2)
                            var difftime = date1.getTime() - date2.getTime();
                            var diffDays = difftime / (1000 * 3600 * 24);
                            winlog.info("no of diff days:" + diffDays);
                            var seasoning = diffDays / 360

                            var adjustment = String(parseFloat(parseFloat(currentinv) / parseFloat(importantdetails.PoolCurrentPrincipalBalance)) * 100)

                            if (parseInt(req.body.month) < 10) {
                                var bdbmon = "0" + req.body.month;
                            }
                            else {
                                var bdbmon = req.body.month;
                            }
                            var bdbdate = req.body.year + "-" + bdbmon + "-01";

                            var json = {
                                "DealID": req.body.dealid,
                                "DealName": deal_name,
                                "TrancheID": myinvarr[i][5],
                                "TrancheName": myinvarr[i][6],
                                "OriginalInvestment": myinvarr[i][8],
                                "CurrentInvestment": String(currentinv),
                                "CreditEnhancement": mastertranche[j][3],
                                "Seasoning": String(seasoning),
                                "InterestRate": mastertranche[j][5],
                                "LoanDate": bdbdate,
                                "InvestorID": investorid,
                                "InterestPaid": myinvarr[i][9],
                                "CurrentPoolBalance": importantdetails.PoolCurrentPrincipalBalance,
                                "Adjustment": adjustment,
                                "AssetType": "Residential Real Estate",
                                "Month": bdbmon,
                                "Year": req.body.year,
                                "PrincipalPaid": myinvarr[i][10]
                            }

                            bdbarr.push(json)
                            c3++;
                        }
                    }
                }
                if (c3 == investmentres.length) {
                    bdbapi(bdbarr)
                    // winlog.info(" \n dealData:  " + JSON.stringify(dealData) + " \n trancheData: " + JSON.stringify(trancheData) +
                    // " \n servicerData:    " + JSON.stringify(servicerdata) + " \n importantdetails:  " + JSON.stringify(importantdetails))

                    function bdbapi(bdbarr) {
                        winlog.info("portfolio chart view bdbarr: " + JSON.stringify(bdbarr) + "      " + bdbarr.length)

                        request.post({
                            "headers": { "content-type": "application/json" },
                            "url": "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/pushdatatodbinvestment",
                            "body": JSON.stringify(bdbarr)
                        })

                    }//end of bdb fn

                }
            }
        }
    },

    getDealDetailsbyDealIdPostClosing: function (req, res) {

        var dealData = {};
        var trancheData = [];
        var paymentRules = [];
        var dealDocuments = [];
        var loanData = [];
        var servicerdata = {}
        var importantdetails = {}
        var poolcollections = {};
        var reviewstatus = ""
        var servicertransferstatus = ""

        var PostclosingEmitter = new EventEmitter();
        if (!req.query.dealid || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            winlog.info("get deal details:::::::::::")

            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
                    .getDealByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info(finalresponse)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach", "payingagentid", "approvestatus"];
                winlog.info(`deal review staus ${finalresponse[22]}`)
                reviewstatus = finalresponse[22]
                PostclosingEmitter.emit('getpostclosingdetails',)
            }; get1();
        }

        PostclosingEmitter.on('getpostclosingdetails', () => {

            const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
            const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PostClosing"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPostClosingByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                    .call({ from: address });

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    servicertransferstatus = finalresponse[0][6]
                    winlog.info("servicer reviewstatus: " + servicertransferstatus)
                    finalresponse = JSON.parse(finalresponse[0][5])
                    winlog.info("finalresponse: " + JSON.stringify(finalresponse))

                    res.send(
                        {
                            "status": "true",
                            "dealData": finalresponse.dealData,
                            "paymentRules": finalresponse.paymentRules,
                            "dealDocuments": finalresponse.dealDocuments,
                            "trancheData": finalresponse.trancheData,
                            "servicerData": finalresponse.servicerData,
                            "importantDetails": finalresponse.importantDetails,
                            "poolCollections": finalresponse.poolCollections,
                            "loanData": finalresponse.loanData,
                            "reviewstatus": reviewstatus,
                            "servicertransferstatus": servicertransferstatus
                        })
                }
                else {
                    res.send(
                        {
                            "status": "true",
                            "dealData": dealData,
                            "paymentRules": paymentRules,
                            "dealDocuments": dealDocuments,
                            "trancheData": trancheData,
                            "servicerData": servicerdata,
                            "importantDetails": importantdetails,
                            "poolCollections": poolcollections,
                            "loanData": loanData,
                            "reviewstatus": reviewstatus,
                            "servicertransferstatus": servicertransferstatus
                        })
                }

            }; get1();
        })
    },

    getPreviousDealDetails: function (req, res) {

        var datearr = [];

        const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
        const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "PostClosing"
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

        const bytecode = contractFile.evm.bytecode.object;
        const abi = contractFile.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getByDealId(req.query.dealid)
                .call({ from: address });

            if (data.length > 0) {
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info("finalresponse: " + JSON.stringify(finalresponse))
                for (var i = 0; i < finalresponse.length; i++) {
                    datearr.push(finalresponse[i][4])
                }
                winlog.info("datearr: " + JSON.stringify(datearr))
                res.send(datearr)
            }
            else {
                res.send(datearr)
            }
        }; get1();
    },


    getDealDetailsbyInvIdPostClosing: function (req, res) {

        var dealData = {};
        var trancheData = [];
        var paymentRules = [];
        var dealDocuments = [];
        var loanData = [];
        var servicerdata = {}
        var importantdetails = {}
        var poolcollections = {};
        var myinvarr = [];
        var myinvestmentres;

        winlog.info("----------------------------------------------------------------");
        const contractAddress = "0xa2aa975858ef4C21e84EA1429936B887f19c889a";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
        const contractname = "MyInvestment";
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        const abi = contractFile.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);

        const getloans = async () => {
            winlog.info(`Making a call to MyInvestment at address ${contractAddress}`);
            const data = await incrementer.methods
                .getTrancheByDealIdMonthYearAndInvestorId(req.query.dealid, req.query.month, req.query.year, req.query.investorid)
                .call({ from: address });

            winlog.info("data: " + data.length)
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                myinvestmentres = JSON.parse(response.result)

                winlog.info("myinvestmentres: " + JSON.stringify(myinvestmentres))
                for (var i = 0; i < myinvestmentres.length; i++) {

                    var json = {
                        "TrancheID": myinvestmentres[i][5],
                        "Tranche": myinvestmentres[i][6],
                        "BeginningBalance": String(parseFloat(myinvestmentres[i][8]).toFixed(2)),
                        "InterestPaid": String(parseFloat(myinvestmentres[i][9]).toFixed(2)),
                        "PrincipalPaid": String(parseFloat(myinvestmentres[i][10]).toFixed(2)),
                        "TotalPaid": String(parseFloat(myinvestmentres[i][11]).toFixed(2)),
                        "EndingBalance": String(parseFloat(myinvestmentres[i][12]).toFixed(2)),
                        "OrigPrinBal": String(parseFloat(myinvestmentres[i][13]).toFixed(2)),
                        "CumIntPaid": String(parseFloat(myinvestmentres[i][14]).toFixed(2)),
                        "CumPrinPaid": String(parseFloat(myinvestmentres[i][15]).toFixed(2)),
                        "CumTotalPaid": String(parseFloat(myinvestmentres[i][16]).toFixed(2))
                    }
                    myinvarr.push(json)
                }
                if (myinvarr.length == myinvestmentres.length) {
                    mastertranchequery(myinvarr)
                }
            } else {

                var json = {
                    "TrancheID": "",
                    "Tranche": "",
                    "BeginningBalance": "",
                    "InterestPaid": "",
                    "PrincipalPaid": "",
                    "TotalPaid": "",
                    "EndingBalance": "",
                    "OrigPrinBal": "",
                    "CumIntPaid": "",
                    "CumPrinPaid": "",
                    "CumTotalPaid": ""
                }
                myinvarr.push(json)
                mastertranchequery(myinvarr)
            }
        };
        getloans();

        function mastertranchequery(myinvarr) {

            winlog.info("----------------------------------------------------------------");
            const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call

            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
            const contractname = "DealTranche";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));

                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    trancheres = JSON.parse(response.result)
                    queryfn(myinvarr, trancheres)

                } else {
                    res.sendStatus(204)
                }
            }; getloans();
        }

        function queryfn(myinvarr, trancheres) {

            winlog.info("myinvarr: " + JSON.stringify(myinvarr))

            const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
            const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "PostClosing"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to PostClosing contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getPostClosingByDealIdMonthAndYear(req.query.dealid, req.query.month, req.query.year)
                    .call({ from: address });

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    finalresponse = JSON.parse(finalresponse[0][5])
                    winlog.info("post closing data: " + JSON.stringify(finalresponse))

                    var c = 0;
                    for (var i = 0; i < finalresponse.trancheData.length; i++) {
                        finalresponse.trancheData[i]["OrigPrinBal"] = String(parseFloat(trancheres[i][4]).toFixed(2));
                        c++
                    }

                    if (c == finalresponse.trancheData.length) {
                        res.send(
                            {
                                "status": "true",
                                "dealData": finalresponse.dealData,
                                "paymentRules": finalresponse.paymentRules,
                                "dealDocuments": finalresponse.dealDocuments,
                                "trancheData": finalresponse.trancheData,
                                "servicerData": finalresponse.servicerData,
                                "importantDetails": finalresponse.importantDetails,
                                "poolCollections": finalresponse.poolCollections,
                                "myInvestments": myinvarr,
                                "loanData": finalresponse.loanData
                            })
                    }

                }
                else {
                    res.send(
                        {
                            "status": "true",
                            "dealData": dealData,
                            "paymentRules": paymentRules,
                            "dealDocuments": dealDocuments,
                            "trancheData": trancheData,
                            "servicerData": servicerdata,
                            "importantDetails": importantdetails,
                            "poolCollections": poolcollections,
                            "myInvestments": myinvarr,
                            "loanData": loanData
                        })
                }

            }; get1();
        }
    },


    getAllInvestmentsByInvId: function (req, res) {

        var event1 = new EventEmitter();
        var dashboardarr = []
        var invcommit;
        var tranchearr = [];
        var dealarr = [];
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        var myinvestmentres = []

        winlog.info("----------------------------------------------------------------");
        const contractAddress = "0xc4D679505FC1d8fAF309a206c10BF9903cC19509";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "InvestmentAndCommit.sol");
        const contractname = "InvestmentAndCommit";
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
        const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        const abi = contractFile.abi;
        const incrementer = new web3.eth.Contract(abi, contractAddress);

        const getloans = async () => {
            winlog.info(`Making a call to InvestmentAndCommit at address ${contractAddress}`);
            const data = await incrementer.methods
                .getTrancheDetailsByInvestorId(req.query.investorid)
                .call({ from: address });

            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                invcommit = JSON.parse(response.result)
                // invcommit = [["b3709831-2547-4bac-9614-244fa381e287", "222IMIR600", "Certificate A", "3145bfb7-ccd4-48fe-8e1d-c338efa335cb", "bac3021a-2333-49f6-b5a7-c818d4625663", "200", "200"]]

                winlog.info("invcommit data::; " + JSON.stringify(invcommit) + "     " + invcommit.length)

                var c2 = 0;
                if (invcommit.length > 0) {

                    for (var i = 0; i < invcommit.length; i++) {

                        if (parseFloat(invcommit[i][6]) > 0) {
                            var json = {
                                "status": true,
                                "dealid": invcommit[i][1],
                                "dealname": "",
                                "tranchename": invcommit[i][2],
                                "originalinvestment": String(parseFloat(invcommit[i][6]).toFixed(2)),
                                "interestrate": "",
                                "interestpaid": "0.00",
                                "principalpaid": "0.00",
                                "outstandinginvestment": String(parseFloat(invcommit[i][6]).toFixed(2))
                            }
                            dashboardarr.push(json)
                            dealarr.push(invcommit[i][1])
                            tranchearr.push(invcommit[i][3])

                        }
                        else {
                            c2++;
                        }

                        if (invcommit.length == (dashboardarr.length + c2)) {
                            // winlog.info("dashboardarr len: " + dashboardarr.length + "   \n invcommit len: " + invcommit.length+"    c2:"+c2)
                            event1.emit("querydealname")
                        }
                    }
                }
                else {
                    var a = []
                    res.send(a)
                }
            } else {
                var a = []
                res.send(a)
                // res.send({ "success": true, "message": "No investment commit made for this deal" })
            }
        }; getloans();



        event1.on("querydealname", function () {

            var c = 0;
            winlog.info("\n\n dashboardarr: " + JSON.stringify(dashboardarr) + "      " + dashboardarr.length)
            winlog.info("\n\n tranchearr:   " + JSON.stringify(tranchearr) + "    " + tranchearr.length)

            winlog.info("\n\n dealarr:   " + JSON.stringify(dealarr) + "    " + dealarr.length)
            // for (var i = 0; i < dashboardarr.length; i++) {

            const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
            const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealOnboarding"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getDealByArrayOfDealIds(dealarr)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data)+" "+data.length);

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    dealonb = JSON.parse(response.result)

                    if (dealarr.length == dealonb.length) {
                        for (var d = 0; d < dealarr.length; d++) {

                            dashboardarr[d].dealname = dealonb[d][2]
                            c++;
                            if (c == dealarr.length) {
                                querymastertranche(tranchearr);
                            }
                        }
                    }
                    else {
                        // res.send([])
                        res.send(dashboardarr)
                    }
                }
                else {
                    // res.send([])
                    res.send(dashboardarr)
                }
            };
            get1();
            // }
        })


        function querymastertranche(tranchearr) {

            // winlog.info("tranchearr len: " + tranchearr.length +"    "+JSON.stringify(tranchearr)+ "    dashboardarr len:  " + dashboardarr.length+"     "+JSON.stringify(dashboardarr))
            var len = 0;
            var index = 0

            const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d";// Contract Call
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealTranche.sol");
            const contractname = "DealTranche";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to master deal tranche at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTranchesByArrayOfTrancheIds(tranchearr)
                    .call({ from: address });

                winlog.info("tranch data--------- " + JSON.stringify(data))
                if (data.length > 0) {

                    var response1 = { "result": JSON.stringify(data) }
                    trancheres = JSON.parse(response1.result)

                    if (tranchearr.length == trancheres.length) {

                        for (var t = 0; t < trancheres.length; t++) {
                            index++
                            if (/^[a-zA-Z]+$/.test(trancheres[t][5])) {
                                dashboardarr[t].interestrate = String(trancheres[t][5])    //Residual
                            }
                            else {
                                dashboardarr[t].interestrate = String((parseFloat(trancheres[t][5]) * 100).toFixed(1)) + "%"
                            }
                            if (index == tranchearr.length) {
                                datequery(dealarr)
                            }
                        }
                    }
                    else {
                        // res.send([])
                        res.send(dashboardarr)
                    }

                } else {
                    // res.send([])
                    res.send(dashboardarr)
                }
            };
            getloans();
            // }
        }


        function datequery(dealarr) {

            var index1 = 0;
            const contractAddress = "0x1f30B339c4e3dE035261a24dC88B58C9782C726d"
            const contractPath = path.join(process.cwd() + "/api/contracts/Date.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "Date"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to date contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getByArrayOfDealIds(dealarr)
                    .call({ from: address });
                winlog.info("date sol data:: " + JSON.stringify(data) + "    " + data.length);

                if (data.length > 0) {
                    var response = { "result": JSON.stringify(data) }
                    var res = JSON.parse(response.result)

                    // winlog.info("res[0]: " + res[0] + "   arr1: " + JSON.stringify(arr1))
                    for (var a = 0; a < res.length; a++) {
                        winlog.info("data each index: " + res[a].length)
                        if (!(arr1.includes(String(res[a][0]))) && res[a].length != 0) {
                            arr1.push(res[a][0])
                            arr2.push(res[a][4])
                            arr3.push(res[a][5])
                        }
                        index1++

                        if (index1 == res.length) {
                            getmyinvestment(arr1, arr2, arr3)
                        }
                    }

                }
                else {
                    res.send(dashboardarr)
                }
            };
            get1();
        }


        function getmyinvestment(arr1, arr2, arr3) {

            winlog.info("arr1 lem: " + arr1.length + "   " + JSON.stringify(arr1))
            winlog.info("arr2 lem: " + arr2.length + "   " + JSON.stringify(arr2))
            winlog.info("arr3 lem: " + arr3.length + "   " + JSON.stringify(arr3))

            const contractAddress = "0xa2aa975858ef4C21e84EA1429936B887f19c889a";// Contract Call
            const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
            const contractname = "MyInvestment";
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            const abi = contractFile.abi;
            const incrementer = new web3.eth.Contract(abi, contractAddress);

            const getloans = async () => {
                winlog.info(`Making a call to my investment at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheArrayByDealIdMonthYearAndInvestorId(arr1, arr2, arr3, req.query.investorid)
                    .call({ from: address });
                winlog.info("final res data:: " + JSON.stringify(data) + "   " + data.length);

                if (data.length > 0) {

                    var ind1 = 0;
                    for (var x = 0; x < data.length; x++) {
                        myinvestmentres.push(data[x])
                        ind1++;
                        if (ind1 == data.length) {
                            // winlog.info("myinv res: " + JSON.stringify(myinvestmentres) + "    " + myinvestmentres.length)
                            event1.emit("finalarrprep", myinvestmentres)
                        }
                    }

                } else {
                    res.send(dashboardarr)
                }
            };
            getloans();
        }


        event1.on("finalarrprep", function (myinvestmentres) {

            winlog.info("\n FINAL----- \n myinvestmentres arr: " + JSON.stringify(myinvestmentres) + "    " + myinvestmentres.length)
            winlog.info("\n dashboardarr before : " + JSON.stringify(dashboardarr) + "    " + dashboardarr.length)

            var ct = 0

            for (var i = 0; i < myinvestmentres.length; i++) {
                ct++;
                for (var j = 0; j < dashboardarr.length; j++) {

                    if ((myinvestmentres[i][1] == dashboardarr[j].dealid) && (myinvestmentres[i][6] == dashboardarr[j].tranchename)) {
                        dashboardarr[j].interestpaid = String(parseFloat(myinvestmentres[i][9]).toFixed(2))
                        dashboardarr[j].principalpaid = String(parseFloat(myinvestmentres[i][10]).toFixed(2))
                        dashboardarr[j].outstandinginvestment = String(parseFloat(myinvestmentres[i][12]).toFixed(2))

                        break;
                    }
                }

                if (ct == myinvestmentres.length) {
                    winlog.info("\n\n dashboardarr final: " + dashboardarr.length)
                    res.send(dashboardarr)
                }
            }

        })
    },

    updateUSDCtransferstatus: function (req, res) {
        if (!req.body.dealid || !req.body.transferUSDCstatus || !req.body.month || !req.body.year) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            if (req.body.trancheid) {
                winlog.info("inside USDC update in Paying agent:::::::::::")
                var TrancheEmitter = new EventEmitter();
                var difference = 0;
                const contractAddress = '0xa2aa975858ef4C21e84EA1429936B887f19c889a';
                const contractPath = path.join(process.cwd() + "/api/contracts/MyInvestment.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "MyInvestment";
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
                    winlog.info(`Making a call to Myinvestment contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByDealIdMonthYearAndInvestorId(req.body.dealid, req.body.month, req.body.year, req.body.investorid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var invesmentupdatearr = []
                    for (var i = 0; i < finalresponse.length; i++) {
                        winlog.info("before invesment save:::::::::::: " + JSON.stringify(finalresponse[i]))
                        if (finalresponse[i][5] == req.body.trancheid) {
                            finalresponse[i][17] = req.body.transferUSDCstatus
                            invesmentupdatearr.push(finalresponse[i])
                            winlog.info("after investment save:::::::::::: " + JSON.stringify(finalresponse))
                            break;
                        }
                    }
                    winlog.info("investment length :::" + invesmentupdatearr.length)
                    if (invesmentupdatearr.length > 0)
                       TrancheEmitter.emit('updateinvestment', invesmentupdatearr)
                    else {
                        winlog.info("investment for this tranche id not available" + req.body.trancheid)
                    }

                };
                get1();


                TrancheEmitter.on('updateinvestment', (invesmentupdatearr) => {
                    winlog.info('inside emitter ' + JSON.stringify(invesmentupdatearr))
                    const contractAddress = '0xa2aa975858ef4C21e84EA1429936B887f19c889a';
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "MyInvestment.sol");
                    const contractname = "MyInvestment";
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

                    const encoded = incrementer.methods.updateMyInvestment(invesmentupdatearr).encodeABI();
                    const increment = async () => {

                        winlog.info(
                            `Calling the update function in  master tranche contract at address ${contractAddress}`
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
                        winlog.info("Tranche update status success")

                        res.send({ "success": true, "message": "USDC transfer Status Update Success" });
                        // resolve("pool update  success")
                    }; increment();
                })

            } else {

                var updatepostclosing = new EventEmitter()

                winlog.info("inside USDC update in servicer:::::::::::")

                const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
                const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "PostClosing"
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

                const bytecode = contractFile.evm.bytecode.object;
                const abi = contractFile.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                const get1 = async () => {
                    winlog.info(`Making a call to PostClosing contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getPostClosingByDealIdMonthAndYear(req.body.dealid, req.body.month, req.body.year)
                        .call({ from: address });

                    winlog.info("data : " + data.length)

                    if (data.length > 0) {
                        var response = { "result": JSON.stringify(data) }
                        var finalresponse = JSON.parse(response.result)
                        finalresponse[0][6] = req.body.transferUSDCstatus;
                        updatepostclosing.emit("updatepostclosing", finalresponse)
                    }
                    else {
                        winlog.info("postclosing is not available for this deal id:" + req.body.dealid + "-" + req.body.month + "-" + req.body.year)
                    }
                }; get1();



                updatepostclosing.on("updatepostclosing", function (finalresponse) {

                    const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25"; // deployed contract address( can be taken from remix or index.js)                    
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "PostClosing.sol");
                    const contractname = "PostClosing";
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
                    const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                    const abi = contractFile.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    winlog.info("finalresponse: " + JSON.stringify(finalresponse))
                    const encoded = incrementer.methods.updatePostClosing(finalresponse).encodeABI();
                    const increment = async () => {
                        winlog.info(
                            `Calling the increment  function in postclosing contract at address ${contractAddress}`
                        );
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 8000000,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                        res.send({ "success": true, "message": "USDC transfer Status Update Success" });
                    }; increment();
                })
            }
        }
    },


    servicerRedirect: function (req, res) {

        if (!req.query.dealid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var month = ""
            var year = ""
            var redirect = new EventEmitter()

            const contractAddress = "0x1f30B339c4e3dE035261a24dC88B58C9782C726d"
            const contractPath = path.join(process.cwd() + "/api/contracts/Date.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "Date"
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
            const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

            const bytecode = contractFile.evm.bytecode.object;
            const abi = contractFile.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getByDealId(req.query.dealid)
                    .call({ from: address });
                winlog.info("data:: " + JSON.stringify(data));

                if (data.length > 2) {
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    month = finalresponse[4];
                    year = finalresponse[5]
                    winlog.info("month: " + month + "  year:  " + year)
                    redirect.emit('update');
                }
                else {
                    res.send({ "redirect": "preclosing" })
                }
            };
            get1();


            redirect.on('update', function () {
                const contractAddress = "0x9d000bA8e416Bbb3Cd0145a09f31626a6887EE25";
                const contractPath = path.join(process.cwd() + "/api/contracts/PostClosing.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "PostClosing"
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
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];

                const bytecode = contractFile.evm.bytecode.object;
                const abi = contractFile.abi;

                const incrementer = new web3.eth.Contract(abi, contractAddress);
                const get1 = async () => {
                    winlog.info(`Making a call to PostClosing contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getPostClosingByDealIdMonthAndYear(req.query.dealid, month, year)
                        .call({ from: address });

                    winlog.info("data : " + data.length)
                    if (data.length > 0) {
                        res.send({ "redirect": "postclosing" })
                    }
                    else {
                        res.send({ "redirect": "preclosing" })
                    }
                }; get1();

            })
        }
    },

    getdealstatusbydealid: function (req, res) {
        if (!req.query.dealid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
        winlog.info("getdetails by deal id");
        const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
        const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
        const contractname = "DealOnboarding";
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

        const getDeal = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getDealByDealId(req.query.dealid)
                .call({ from: address });
            //  winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            //  winlog.info(JSON.stringify(data))
            if (data.length > 0) {

                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                var key = ["uniqueID", "dealId", "dealName", "assetclass", "vaId", "servicerId",
                    "issuerId", "underwriterId", "originalbalance", "numberofloans", "loanIds",
                    "numberofTranches", "trancheIds", "createdDate", "status", "colsingDate", "maturityDate",
                    "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];

                var json = {
                    "dealId": finalresponse[1],
                    "status": finalresponse[14]
                }


                res.send(json)
            } else {
                res.send([]);
            }

        };

        getDeal();
    }
    }
    // get: function (req, res) {

    //     var event1 = new EventEmitter();
    //     var dashboardarr = []
    //     var invcommit;
    //     var tranchearr = [];
    //     var dealarr = [];
    //     var arr1 = [];
    //     var arr2 = [];
    //     var arr3 = [];
    //     var myinvestmentres = []

    //     winlog.info("----------------------------------------------------------------");
    //     const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC";// Contract Call
    //     const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
    //     const contractname = "DealOnboarding";
    //     const source = fs.readFileSync(contractPath, 'utf8');

    //     const input = {
    //         language: 'Solidity',
    //         sources: {
    //             [contractname + ".sol"]: {
    //                 content: source,
    //             },
    //         },
    //         settings: {
    //             outputSelection: {
    //                 '*': {
    //                     '*': ['*'],
    //                 },
    //             },
    //         },
    //     };

    //     const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //     const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //     const abi = contractFile.abi;
    //     const incrementer = new web3.eth.Contract(abi, contractAddress);

    //     const getloans = async () => {
    //         winlog.info(`Making a call to ${contractname} at address ${contractAddress}`);
    //         const data = await incrementer.methods
    //             .getAllData()
    //             .call({ from: address });

    //         if (data.length > 0) {

    //             var response = { "result": JSON.stringify(data) }
    //             var data1 = JSON.parse(response.result)
    //             winlog.info("data1: " + JSON.stringify(data1))
    //         }
    //         else {
    //             winlog.info("data else : " + JSON.stringify(data))
    //         }
    //     }; getloans();
    // },


    // save: function (req, res) {


    //     // var dataarr = []
    //     // for (var k = 0; k < req.body.input.length; k++) {
    //     //     // if (dataarr.length == 10) {
    //     //     // setTimeout(() => {
    //     //     savee(req.body.input[k], k)
    //     //     // }, 1000);
    //     //     // }
    //     //     // else {
    //     //     //     dataarr.push(req.body.input[k])
    //     //     // }
    //     // }


    //     // function savee(input1, k) {
    //     const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC"; // deployed contract address( can be taken from remix or index.js)    
    //     const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealOnboarding.sol");
    //     const contractname = "DealOnboarding";
    //     const source = fs.readFileSync(contractPath, 'utf8');

    //     const input = {
    //         language: 'Solidity',
    //         sources: {
    //             [contractname + ".sol"]: {
    //                 content: source,
    //             },
    //         },
    //         settings: {
    //             outputSelection: {
    //                 '*': {
    //                     '*': ['*'],
    //                 },
    //             },
    //         },
    //     };

    //     const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
    //     //winlog.info(tempFile)
    //     const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
    //     //winlog.info(contractFile)
    //     //const bytecode = contractFile.evm.bytecode.object;
    //     const abi = contractFile.abi;
    //     const incrementer = new web3.eth.Contract(abi, contractAddress);
    //     //inputs
    //     // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
    //     // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
    //     // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

    //     // winlog.info("ip:" + JSON.stringify([input1]) + "    " + input1.length + "    " + k)
    //     const encoded = incrementer.methods.createDeal(req.body.input).encodeABI();
    //     const increment = async () => {
    //         winlog.info(
    //             `Calling the i function in ${contractname} at address ${contractAddress}`
    //         );
    //         const createTransaction = await web3.eth.accounts.signTransaction(
    //             {
    //                 from: address,
    //                 to: contractAddress,
    //                 data: encoded,
    //                 gasLimit: 6000000,
    //                 chainId: "101122"
    //             },
    //             privKey
    //         ); const createReceipt = await web3.eth.sendSignedTransaction(
    //             createTransaction.rawTransaction
    //         );
    //         winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
    //         // dataarr = []

    //         res.send({ "success": true, "message": "data saved" });
    //         // resolve("tranche save success");

    //     }; increment();
    //     // }
    // }

}

module.exports = query;