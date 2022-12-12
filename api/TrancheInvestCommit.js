const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const { EventEmitter } = require('stream');
const { UUID } = require('bson');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const uuidv4 = require('uuid/v4');
const winlog = require("../log/winstonlog");

var commitments = {
    SaveCommit: function (req, res) {
        if (!req.body.dealid || !req.body.tranchename || !req.body.trancheid ||
            !req.body.investorid || !req.body.commitamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            const contractAddress = '0xc4D679505FC1d8fAF309a206c10BF9903cC19509';

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

            var CommitDetails = [[uuidv4().toString(), req.body.dealid, req.body.tranchename, req.body.trancheid, req.body.investorid, req.body.commitamount, "0"]]
            winlog.info(CommitDetails)
            const encoded = incrementer.methods.createInvestAndCommit(CommitDetails).encodeABI();
            const increment = async () => {

                winlog.info(
                    `Calling the update function in InvestmentAndCommit contract at address ${contractAddress}`
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
                winlog.info("Tranche commit save success")
                TrancheEmitter.emit('gettranche')
                // res.send({ "success": true, "message": "Deal Update Status Success" });
                // resolve("pool update  success")
            }; increment();

            TrancheEmitter.on('gettranche', () => {
                winlog.info("inside get tranche::: ")
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                const get1 = async () => {
                    winlog.info(`Making a call to deal tranche contract at address ${dealtrancheAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.body.trancheid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueid", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments"];

                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                    winlog.info(parseFloat(finalresponse[10]) + " " + parseFloat(req.body.commitamount))

                    finalresponse[10] = String(parseFloat(finalresponse[10]) + parseFloat(req.body.commitamount))
                    finalresponse[11] = String(parseFloat(finalresponse[4]) - parseFloat(finalresponse[10]))
                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('savetranche', [finalresponse])
                };
                get1();
            })

            TrancheEmitter.on('savetranche', (tranchedetails) => {
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: dealtrancheAddress,
                            data: encoded,
                            gasLimit: 6000000,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    res.send({ "success": true, "message": "Tranche Commit Success" });

                }; increment();

            })

        }
    },

    EditCommit: function (req, res) {
        if (!req.body.trancheid || !req.body.investorid || !req.body.commitamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
            const contractAddress = '0xc4D679505FC1d8fAF309a206c10BF9903cC19509';
            const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "InvestmentAndCommit";
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
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheDetailsByTrancheIdAndInvestorId(req.body.trancheid, req.body.investorid)
                    .call({ from: address });
                var response = { "result": JSON.stringify(data) };
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]

                winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                difference = parseFloat(req.body.commitamount) - parseFloat(finalresponse[5])
                finalresponse[5] = req.body.commitamount
                winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                TrancheEmitter.emit('updatecommit', [finalresponse])
            };
            get1();


            TrancheEmitter.on('updatecommit', (commitdetails) => {
                const contractAddress = '0xc4D679505FC1d8fAF309a206c10BF9903cC19509';
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

                const encoded = incrementer.methods.updateInvestment(commitdetails).encodeABI();
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  InvestmentAnd Commit contract at address ${contractAddress}`
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
                    winlog.info("Tranche commit save success")
                    TrancheEmitter.emit('gettranche')
                    // res.send({ "success": true, "message": "Deal Update Status Success" });
                    // resolve("pool update  success")
                }; increment();
            })

            TrancheEmitter.on('gettranche', () => {
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                const get1 = async () => {
                    winlog.info(`Making a call to deal Tranche contract at address ${dealtrancheAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.body.trancheid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                    winlog.info(parseFloat(finalresponse[10]) + " " + parseFloat(req.body.commitamount))

                    finalresponse[10] = String(parseFloat(finalresponse[10]) + parseFloat(difference))
                    finalresponse[11] = String(parseFloat(finalresponse[4]) - parseFloat(finalresponse[10]))

                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('UpdateTrancheArray', [finalresponse])
                };
                get1();
            })

            TrancheEmitter.on('UpdateTrancheArray', (tranchedetails) => {
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: dealtrancheAddress,
                            data: encoded,
                            gasLimit: 6000000,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    res.send({ "success": true, "message": "Commit Update  Success" });

                }; increment();

            })
        }

    },

    Invest: function (req, res) {
        if (!req.body.trancheid || !req.body.investorid || !req.body.investamount) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
            const contractAddress = '0xc4D679505FC1d8fAF309a206c10BF9903cC19509';
            const contractPath = path.join(process.cwd() + "/api/contracts/InvestmentAndCommit.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "InvestmentAndCommit";
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
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheDetailsByTrancheIdAndInvestorId(req.body.trancheid, req.body.investorid)
                    .call({ from: address });
                var response = { "result": JSON.stringify(data) };
                var finalresponse = JSON.parse(response.result);
                var key = ["uniqueid", "dealid", "tranchename", "trancheid", "investorid", "commitamount", "investamount"]

                winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                finalresponse[6] = req.body.investamount
                winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                TrancheEmitter.emit('updateinvest', [finalresponse])
            };
            get1();


            TrancheEmitter.on('updateinvest', (commitdetails) => {
                const contractAddress = '0xc4D679505FC1d8fAF309a206c10BF9903cC19509';
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

                const encoded = incrementer.methods.updateInvestment(commitdetails).encodeABI();
                const increment = async () => {

                    winlog.info(
                        `Calling the update function in  InvestmentAnd Commit contract at address ${contractAddress}`
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
                    winlog.info("Tranche invest save success")
                    TrancheEmitter.emit('gettranche')
                    // res.send({ "success": true, "message": "Deal Update Status Success" });
                    // resolve("pool update  success")
                }; increment();
            })

            TrancheEmitter.on('gettranche', () => {
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
                const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealTranche";
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

                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);
                const get1 = async () => {
                    winlog.info(`Making a call to deal Tranche contract at address ${dealtrancheAddress}`);
                    const data = await incrementer.methods
                        .getTrancheByTrancheId(req.body.trancheid)
                        .call({ from: address });
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
                    winlog.info("before commit:::::::::::: " + JSON.stringify(finalresponse))
                    winlog.info(parseFloat(finalresponse[6]) + " " + parseFloat(req.body.investamount))
                    if (finalresponse[6] != "NaN") {
                        finalresponse[6] = String(parseFloat(finalresponse[6]) + parseFloat(req.body.investamount))

                    } else {
                        finalresponse[6] = req.body.investamount
                    }

                    winlog.info("after commit:::::::::::: " + JSON.stringify(finalresponse))
                    TrancheEmitter.emit('UpdateDealTrancheArray', [finalresponse])
                };
                get1();
            })

            TrancheEmitter.on('UpdateDealTrancheArray', (tranchedetails) => {
                const dealtrancheAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
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
                const incrementer = new web3.eth.Contract(abi, dealtrancheAddress);

                const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the save tranche function in deal tranche contract at address ${dealtrancheAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: dealtrancheAddress,
                            data: encoded,
                            gasLimit: 6000000,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    res.send({ "success": true, "message": "Invest Success" });

                }; increment();

            })
        }

    },

    GetTrancheCommitment: function (req, res) {
        const contractAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';

        const contractPath = path.join(process.cwd() + "/api/contracts/DealTranche.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealTranche";
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
            winlog.info(`Making a call to deal Tranche contract at address ${contractAddress}`);
            const data = await incrementer.methods
                .getTrancheByTrancheId(req.query.trancheid)
                .call({ from: address });
            //  winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            var response = { "result": JSON.stringify(data) };
            winlog.info(response)
            var finalresponse = JSON.parse(response.result);
            var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "currentcommitments", "availablecommitments"];
            winlog.info(finalresponse[0] + " " + finalresponse[10] + " " + finalresponse[11])
            if (finalresponse.length > 0) {
              /*  var date1 = new Date();
                var date2 = new Date(req.query.closingdate);
                var currentdate = new Date(date1.getMonth() + 1 + "-" + date1.getDate() + "-" + date1.getFullYear());
                // To calculate the time difference of two dates
                var Difference_In_Time = date2.getTime() - currentdate.getTime();
                // To calculate the no. of days between two dates
                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                winlog.info("Difference in days  :"+Difference_In_Days)
                if(Difference_In_Days>0 && Difference_In_Days <=10){
                    finalresponse[11] = "0";
                }*/
                res.send({
                    "trancheid": finalresponse[0],
                    "currentcommitments": finalresponse[10],
                    "availablecommitments": finalresponse[11]
                })
            } else {
                res.send({});
            }

        };
        get1();
    }

}
module.exports = commitments