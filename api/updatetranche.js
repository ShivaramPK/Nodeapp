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

var updatetranches = {

    updatetranchestatus: function (req, res) {
        if (!req.body.trancheid || !req.body.approvestatus) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var TrancheEmitter = new EventEmitter();
            var difference = 0;
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
                winlog.info(`Making a call to InvestmentAndCommit contract at address ${contractAddress}`);
                const data = await incrementer.methods
                    .getTrancheByTrancheId(req.body.trancheid)
                    .call({ from: address });
                var response = { "result": JSON.stringify(data) };
                var finalresponse = JSON.parse(response.result);
                var key = ["trancheId", "dealId", "trancheName", "creditEnhancement", "pricipalBalance", "interestRate", "investedAmount", "status", "deployedaddress", "closingdate", "currentcommitments", "availablecommitments", "approvestatus"];
                winlog.info("before tranche save:::::::::::: " + JSON.stringify(finalresponse))
                finalresponse[12] = req.body.approvestatus
                winlog.info("after tranche save:::::::::::: " + JSON.stringify(finalresponse))
                TrancheEmitter.emit('updatetranche', [finalresponse])
            };
            get1();


            TrancheEmitter.on('updatetranche', (tranchedetails) => {
                const contractAddress = '0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d';
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

                const encoded = incrementer.methods.updateTrancheArray(tranchedetails).encodeABI();
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
                    
                    res.send({ "success": true, "message": "tranche Update Status Success" });
                    // resolve("pool update  success")
                }; increment();
            })

        }
    }
}
module.exports = updatetranches