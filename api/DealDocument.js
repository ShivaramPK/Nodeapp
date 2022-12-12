const reader = require('xlsx')
const xlsxFile = require('read-excel-file/node');
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
const contractAddress = "0x918e15De30d228DFdB741118f7683D920762B33e"; // deployed contract address( can be taken from remix or index.js)
const winlog = require("../log/winstonlog");

const uuidv4 = require('uuid/v4');

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('104.42.155.78', '5001', { protocol: 'http' });


var Document = {
    addDeal: function (req, res) {
        var dealEmitter = new EventEmitter();
        var final = path.resolve(__dirname + '/../uploads/' + req.file.filename);            //var testFile = fs.readFileSync("/home/pavithra/y/pool1/TWO24788.pdf");
        var testFile = fs.readFileSync(final);
        //Creating buffer for ipfs function to add file to the system
        var testBuffer = new Buffer(testFile);
        // var testFile = fs.readFileSync("PATH_OF_FILE");
        //Creating buffer for ipfs function to add file to the system
        var testBuffer = new Buffer(testFile);
        ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
                winlog.info(err);
            }
            winlog.info(file[0].hash)
            adddocument(file[0].hash)
            // loancontract.URI = "http://104.42.155.78:8080/ipfs/" + file[0].hash;


        })
        async function adddocument(docpath) {

            return new Promise((resolve, reject) => {
                winlog.info("add document::::::::::::")
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
                const source = fs.readFileSync(contractPath, 'utf8');
                const contractname = "DealDocuments";

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

                var documentarray = [[uuidv4(), req.body.dealid, req.body.docname, req.body.description, req.body.privacymode, docpath, req.body.underwriterid]]
                winlog.info(documentarray)
                const encoded = incrementer.methods.addDocuments(documentarray).encodeABI();
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
                    res.send({ "success": true, "message": "deal upload Update Success" });
                    try {
                       fs.unlinkSync(final)
                       winlog.info("local file removed:::::::::")
                      } catch(err) {
                        console.error(err)
                      }
                    resolve("upload  success")
                }; increment();
            });
        }
    },

    updatedeal: function (req, res) {
        const contractPath = path.join(process.cwd() + "/api/contracts/DealDocuments.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealDocuments"
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
                .getDocumentByDocumentId(req.body.documentid)
                .call({ from: address });
            //  winlog.info("data:: " + JSON.stringify(data));
            // winlog.info(`The current string is: ` + data);
            // var response ={ "result":JSON.stringify(data)}
            // winlog.info(response)
            var response = { "result": JSON.stringify(data) }
            var finalresponse = JSON.parse(response.result)
            winlog.info("final updated array::::::::::::::")
            winlog.info(finalresponse)
            var key = ["documentid", "dealId", "dealname", "description", "privacymode", "documentpath", "underwriterid"];

            finalresponse[2] = req.body.docname;
            finalresponse[3] = req.body.description;
            finalresponse[4] = req.body.privacymode;
            winlog.info([finalresponse])
            updatedealdocument([finalresponse]);

        }; get1();

        function updatedealdocument(finalresponse) {

            return new Promise((resolve, reject) => {

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

                const encoded = incrementer.methods.updateDocument(finalresponse).encodeABI();
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
                    res.send({ "success": true, "message": "deal document Update Success" });
                    resolve(" update  success")
                }; increment();
            });
        }
    },


}

module.exports = Document;