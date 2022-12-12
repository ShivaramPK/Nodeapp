
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
const uuidv4 = require('uuid/v4');
const DateAndTime = require('date-and-time');
const { resolve } = require('dns');
var request = require('request');
const winlog = require("../log/winstonlog");

var Deal = {

    updateDeal: function (req, res) {
        var dealEvent = new EventEmitter();
        var file1 = path.resolve(__dirname + '/../uploads/' + req.file.filename);
        winlog.info("inside update deal::::::::::::" + req.body.dealid);
        var dealSummary = '';
        var assetclass = '';
        var closingdate = '';
        var status = '';
        var originalprinbal = '';
        var firstpaymentdate = '';
        var paymentfrequency = '';
        var maturitydate = '';
        var trancheid = '';
        var finaldealarray;
        var tranchearr = [];
        var paymentarr = [];
        var IssuerID = ''
        var dealName = ''
        var bdbjson ={};
        xlsxFile(file1).then((rows) => {
            for (i = 0; i < rows.length; i++) {
                if (rows[i][0] == 'Deal Sumary') {
                    winlog.info("insdie deal sumary::::::::::::" + rows[i + 1][0]);
                    dealSummary = rows[i + 1][0];

                } else if (rows[i][0] == 'Basic Details') {
                    winlog.info("inside basic details::::::::::");
                    dealName = rows[i + 1][2]
                    assetclass = rows[i + 2][2];
                    status = rows[i + 5][2];
                    originalprinbal = String(rows[i + 6][2]);
                    paymentfrequency = rows[i + 8][2];

                    //  closingdate = rows[i + 3][2];
                    //   maturitydate = rows[i + 4][2];
                    // firstpaymentdate = rows[i + 7][2];
                    winlog.info(`closing date ::: ${rows[i + 3][2]} maturity date :::: ${rows[i + 4][2]} firstpaymentdate:: ${rows[i + 7][2]}`);

                    var utc_days = Math.floor(rows[i + 3][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    const value = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var cdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted closing date :: date_info  :: " + value);

                    var utc_days = Math.floor(rows[i + 4][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    const value1 = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var mdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted maturity date :: date_info  :: " + value1);

                    var utc_days = Math.floor(rows[i + 7][2] - 25569);
                    var utc_value = utc_days * 86400;
                    var date_info = new Date(utc_value * 1000);
                    const value2 = DateAndTime.format(date_info, 'MM-DD-YYYY')
                    var fdate = DateAndTime.format(date_info, 'YYYY-MM-DD')
                    winlog.info("formatted first payment date :: date_info  :: " + value2);

                    closingdate = value;
                    maturitydate = value1;
                    firstpaymentdate = value2;
                    bdbjson['Deal Name'] = rows[i + 1][2]
                    bdbjson['DealID'] = req.body.dealid
                    bdbjson['Asset Category'] = rows[i + 2][2];
                    bdbjson['Closing Date'] = cdate
                    bdbjson['Maturity Date'] = mdate;
                    bdbjson['1st Payment Date'] = fdate;
                    bdbjson['Status'] = status;
                    bdbjson['Original Principal Balance'] = originalprinbal;
                    bdbjson['Payment Frequency'] = paymentfrequency;

                    winlog.info("assetclass:: " + assetclass + " closingdate:: " + closingdate + " maturity date:: " + maturitydate + " status:: " + status + " originalprinbal:: " + originalprinbal
                        + " firstpaymentdate:: " + firstpaymentdate + " paymentfrequency:: " + paymentfrequency + " deal name " + dealName);
                        winlog.info("BDB json ::::::"+JSON.stringify(bdbjson));

                        i = i + 8;

                  
                } else if (rows[i][0] == 'Payment Rules') {
                    winlog.info("inside payment rules::::::::::::::: " + i);

                    while (rows[i + 1][0] != "Tranches") {
                        var uniqueID = uuidv4();
                        paymentarr.push([uniqueID, req.body.dealid, req.body.underwriterid, rows[i + 1][0], "0", String(date_info.getMonth() + 1), String(date_info.getFullYear())]);
                        i++;
                    }
                    winlog.info(paymentarr);

                } else if (rows[i][0] == 'Tranches') {
                    // winlog.info(rows[i])
                    winlog.info('inside TRANCHE :::::::::::');
                    i = i + 2;
                    while (i < rows.length) {
                        const ShortUniqueId = require('short-unique-id');
                        const uid = new ShortUniqueId({ length: 4 });
                        var uniqueID = uid();

                        winlog.info("unique id: " + uniqueID)
                        if (trancheid != '') {
                            trancheid = trancheid + "#" + uniqueID;
                            winlog.info(trancheid)
                        }
                        else
                            trancheid = uniqueID;
                        // try{
                        if (rows[i][4])
                            winlog.info("invested amount:::::" + rows[i][4])
                        else {
                            winlog.info("invested amount::::: 0")

                            rows[i][4] = 0;
                        }
                        // }catch{
                        //     winlog.info("error")
                        //     rows[i][4] =0
                        // }
                        tranchearr.push([uniqueID, req.body.dealid, rows[i][0], String(rows[i][1]), String(rows[i][2]), String(rows[i][3]), String(rows[i][4]), "active", "", closingdate, "0", String(rows[i][2]), "pending"]);
                        // winlog.info(tranchearr)
                        i++;

                    }
                    winlog.info(tranchearr)
                    // CreateFT();
                    savedealdeatils();
                }
            }
        });

        async function savedealdeatils() {
            var getdeal = await getdealbyid();
            winlog.info(getdeal)
            var updatedeal = await updatedeal1();
            winlog.info(updatedeal)
            var paymentrules = await savepaymentrules();
            winlog.info(paymentrules)
            var FT = await CreateFT();

        }
        function getdealbyid() {

            return new Promise((resolve, reject) => {
                //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC"; // deployed contract address( can be taken from remix or index.js)
                const contractPath = path.join(process.cwd() + "/api/contracts/DealOnboarding.sol");
                winlog.info("contractpath:: " + contractPath);
                const contractname = "DealOnboarding";
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
                    winlog.info(`Making a call to deal onboarding contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getDealByDealId(req.body.dealid)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) };
                    var finalresponse = JSON.parse(response.result);
                    var key = ["uniqueID", "dealid", "dealname", "assetclass", "vaid",
                        "servicerid", "issuerid", "underwriterid", "originalbalance", "noofloans", "loanids",
                        "nooftranche", "trancheid", "createdate", "status", "closingdate", "maturityDate",
                        "firstPaymentDate", "paymentFrequency", "dealsummary", "uploadapproach"];

                    winlog.info(finalresponse);
                    IssuerID = finalresponse[6];
                    winlog.info("issuer id:::::::::: " + IssuerID)
                    finalresponse[2] = dealName
                    finalresponse[3] = assetclass;
                    finalresponse[8] = originalprinbal;
                    finalresponse[11] = String(trancheid.split("#").length);
                    finalresponse[12] = trancheid;
                    finalresponse[14] = status;
                    finalresponse[15] = closingdate;
                    finalresponse[16] = maturitydate;
                    finalresponse[17] = firstpaymentdate;
                    finalresponse[18] = paymentfrequency;
                    finalresponse[19] = dealSummary;

                    finaldealarray = finalresponse;
                    resolve("get deal success");
                    winlog.info("length:::::::::" + finalresponse[11]);
                    winlog.info("finaldeal array::::: " + JSON.stringify(finaldealarray));

                };
                get1();
            });
        }

        function updatedeal1() {
            return new Promise((resolve, reject) => {
                const contractAddress = "0x9098cbFBC5947682ea6ea20aDA83d8270a192FCC"; // deployed contract address( can be taken from remix or index.js)    
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
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info([finaldealarray])
                const encoded = incrementer.methods.updateDeal([finaldealarray]).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the function in DealOnboarding contract at address ${contractAddress}`
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
                    resolve("deal update success");
                }; increment();
            });

        } // end 

        function createdealtranche() {
            return new Promise((resolve, reject) => {
                const contractAddress = "0xe4f1c7eA89226a7F8cE1B0604cE78a37439d785d"; // deployed contract address( can be taken from remix or index.js)    
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
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info(tranchearr)
                const encoded = incrementer.methods.createTranche(tranchearr).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the i function in DealTranche contract at address ${contractAddress}`
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
                    winlog.info("tranche save success and deal upload success::::::")
                    res.send({ "success": true, "message": "Deal  upload success" });
                    // resolve("tranche save success");
                    bdbapi();
                }; increment();
            });

        } // end 

        // winlog.info(" \n dealData:  " + JSON.stringify(dealData) + " \n trancheData: " + JSON.stringify(trancheData) +
        // " \n servicerData:    " + JSON.stringify(servicerdata) + " \n importantdetails:  " + JSON.stringify(importantdetails))

        function bdbapi() {
            winlog.info("portfolio chart view bdbarr: " + JSON.stringify(bdbjson))

            request.post({
                "headers": { "content-type": "application/json" },
                "url": "https://bdb.imtest.intainmarkets.us/api/v1/imarkets/pushdatatopreclosing",
                "body": JSON.stringify([bdbjson])
            })
        }

        function savepaymentrules() {
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
                //winlog.info(tempFile)
                const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                //const bytecode = contractFile.evm.bytecode.object;
                const abi = contractFile.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);
                //inputs
                // 1)uniqueID 2)dealId 3)dealName 4)assetclass 5)vaId 6)servicerId 7)issuerId
                // 8)underwriterId 9)originalbalance 10)numberofloans 11)loanIds 12)numberofTranches
                // 13)trancheIds 14)createdDate 15)status 16)colsingDate 17) maturityDate 18)firstPaymentDate 19) paymentFrequency

                winlog.info(paymentarr)
                const encoded = incrementer.methods.createPaymentRule(paymentarr).encodeABI();
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
                    resolve("payment save success");
                }; increment();
            });

        }// end 

        async function CreateFT() {
            winlog.info("Creating FT's :::::::::::::::::")
            var accountaddress = await getissueraccountaddress();
            for (var i = 0; i < tranchearr.length; i++) {
                winlog.info("tranche id:::::::: " + tranchearr[i])
                var deployFTaddress = await deployFTcontract(tranchearr[i]);
                tranchearr[i][8] = deployFTaddress;

                var c1 = Math.pow(10, 6)
                var finaltotalsupply = c1 * (tranchearr[i][4]);
                winlog.info("total supply ::::::::::" + finaltotalsupply)
                var transfertoken = await TransferTokens(deployFTaddress, accountaddress, finaltotalsupply);
                winlog.info("transfer token " + transfertoken)
                var transferowner = await TransferOwnerShip(deployFTaddress, accountaddress);
                winlog.info(transferowner);
            }
            if (i == tranchearr.length) {
                var savetranche = await createdealtranche();
            } else {
                res.send({ "success": false, "message": "Deal not uploaded successfully" });
            }
        }


        async function deployFTcontract(finaltranche) {

            return new Promise((resolve, reject) => {
                const bytecode = "60806040523480156200001157600080fd5b5060405162001f8f38038062001f8f8339818101604052810190620000379190620004b8565b828281600390816200004a919062000793565b5080600490816200005c919062000793565b5050506200007f620000736200009a60201b60201c565b620000a260201b60201c565b6200009133826200016860201b60201c565b50505062000995565b600033905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620001da576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620001d190620008db565b60405180910390fd5b620001ee60008383620002e060201b60201c565b80600260008282546200020291906200092c565b92505081905550806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546200025991906200092c565b925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620002c0919062000978565b60405180910390a3620002dc60008383620002e560201b60201c565b5050565b505050565b505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620003538262000308565b810181811067ffffffffffffffff8211171562000375576200037462000319565b5b80604052505050565b60006200038a620002ea565b905062000398828262000348565b919050565b600067ffffffffffffffff821115620003bb57620003ba62000319565b5b620003c68262000308565b9050602081019050919050565b60005b83811015620003f3578082015181840152602081019050620003d6565b60008484015250505050565b60006200041662000410846200039d565b6200037e565b90508281526020810184848401111562000435576200043462000303565b5b62000442848285620003d3565b509392505050565b600082601f830112620004625762000461620002fe565b5b815162000474848260208601620003ff565b91505092915050565b6000819050919050565b62000492816200047d565b81146200049e57600080fd5b50565b600081519050620004b28162000487565b92915050565b600080600060608486031215620004d457620004d3620002f4565b5b600084015167ffffffffffffffff811115620004f557620004f4620002f9565b5b62000503868287016200044a565b935050602084015167ffffffffffffffff811115620005275762000526620002f9565b5b62000535868287016200044a565b92505060406200054886828701620004a1565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680620005a557607f821691505b602082108103620005bb57620005ba6200055d565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620006257fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82620005e6565b620006318683620005e6565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620006746200066e62000668846200047d565b62000649565b6200047d565b9050919050565b6000819050919050565b620006908362000653565b620006a86200069f826200067b565b848454620005f3565b825550505050565b600090565b620006bf620006b0565b620006cc81848462000685565b505050565b5b81811015620006f457620006e8600082620006b5565b600181019050620006d2565b5050565b601f82111562000743576200070d81620005c1565b6200071884620005d6565b8101602085101562000728578190505b620007406200073785620005d6565b830182620006d1565b50505b505050565b600082821c905092915050565b6000620007686000198460080262000748565b1980831691505092915050565b600062000783838362000755565b9150826002028217905092915050565b6200079e8262000552565b67ffffffffffffffff811115620007ba57620007b962000319565b5b620007c682546200058c565b620007d3828285620006f8565b600060209050601f8311600181146200080b5760008415620007f6578287015190505b62000802858262000775565b86555062000872565b601f1984166200081b86620005c1565b60005b8281101562000845578489015182556001820191506020850194506020810190506200081e565b8683101562000865578489015162000861601f89168262000755565b8355505b6001600288020188555050505b505050505050565b600082825260208201905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b6000620008c3601f836200087a565b9150620008d0826200088b565b602082019050919050565b60006020820190508181036000830152620008f681620008b4565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000939826200047d565b915062000946836200047d565b9250828201905080821115620009615762000960620008fd565b5b92915050565b62000972816200047d565b82525050565b60006020820190506200098f600083018462000967565b92915050565b6115ea80620009a56000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063715018a61161008c578063a457c2d711610066578063a457c2d71461024f578063a9059cbb1461027f578063dd62ed3e146102af578063f2fde38b146102df576100ea565b8063715018a6146102095780638da5cb5b1461021357806395d89b4114610231576100ea565b806323b872dd116100c857806323b872dd1461015b578063313ce5671461018b57806339509351146101a957806370a08231146101d9576100ea565b806306fdde03146100ef578063095ea7b31461010d57806318160ddd1461013d575b600080fd5b6100f76102fb565b6040516101049190610d9f565b60405180910390f35b61012760048036038101906101229190610e5a565b61038d565b6040516101349190610eb5565b60405180910390f35b6101456103b0565b6040516101529190610edf565b60405180910390f35b61017560048036038101906101709190610efa565b6103ba565b6040516101829190610eb5565b60405180910390f35b6101936103e9565b6040516101a09190610f69565b60405180910390f35b6101c360048036038101906101be9190610e5a565b6103f2565b6040516101d09190610eb5565b60405180910390f35b6101f360048036038101906101ee9190610f84565b610429565b6040516102009190610edf565b60405180910390f35b610211610471565b005b61021b610485565b6040516102289190610fc0565b60405180910390f35b6102396104af565b6040516102469190610d9f565b60405180910390f35b61026960048036038101906102649190610e5a565b610541565b6040516102769190610eb5565b60405180910390f35b61029960048036038101906102949190610e5a565b6105b8565b6040516102a69190610eb5565b60405180910390f35b6102c960048036038101906102c49190610fdb565b6105db565b6040516102d69190610edf565b60405180910390f35b6102f960048036038101906102f49190610f84565b610662565b005b60606003805461030a9061104a565b80601f01602080910402602001604051908101604052809291908181526020018280546103369061104a565b80156103835780601f1061035857610100808354040283529160200191610383565b820191906000526020600020905b81548152906001019060200180831161036657829003601f168201915b5050505050905090565b6000806103986106e5565b90506103a58185856106ed565b600191505092915050565b6000600254905090565b6000806103c56106e5565b90506103d28582856108b6565b6103dd858585610942565b60019150509392505050565b60006006905090565b6000806103fd6106e5565b905061041e81858561040f85896105db565b61041991906110aa565b6106ed565b600191505092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610479610bc1565b6104836000610c3f565b565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6060600480546104be9061104a565b80601f01602080910402602001604051908101604052809291908181526020018280546104ea9061104a565b80156105375780601f1061050c57610100808354040283529160200191610537565b820191906000526020600020905b81548152906001019060200180831161051a57829003601f168201915b5050505050905090565b60008061054c6106e5565b9050600061055a82866105db565b90508381101561059f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161059690611150565b60405180910390fd5b6105ac82868684036106ed565b60019250505092915050565b6000806105c36106e5565b90506105d0818585610942565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b61066a610bc1565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036106d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106d0906111e2565b60405180910390fd5b6106e281610c3f565b50565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361075c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161075390611274565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107c290611306565b60405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040516108a99190610edf565b60405180910390a3505050565b60006108c284846105db565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff811461093c578181101561092e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161092590611372565b60405180910390fd5b61093b84848484036106ed565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036109b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109a890611404565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610a20576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a1790611496565b60405180910390fd5b610a2b838383610d05565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610ab1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aa890611528565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610b4491906110aa565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ba89190610edf565b60405180910390a3610bbb848484610d0a565b50505050565b610bc96106e5565b73ffffffffffffffffffffffffffffffffffffffff16610be7610485565b73ffffffffffffffffffffffffffffffffffffffff1614610c3d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3490611594565b60405180910390fd5b565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b505050565b505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d49578082015181840152602081019050610d2e565b60008484015250505050565b6000601f19601f8301169050919050565b6000610d7182610d0f565b610d7b8185610d1a565b9350610d8b818560208601610d2b565b610d9481610d55565b840191505092915050565b60006020820190508181036000830152610db98184610d66565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610df182610dc6565b9050919050565b610e0181610de6565b8114610e0c57600080fd5b50565b600081359050610e1e81610df8565b92915050565b6000819050919050565b610e3781610e24565b8114610e4257600080fd5b50565b600081359050610e5481610e2e565b92915050565b60008060408385031215610e7157610e70610dc1565b5b6000610e7f85828601610e0f565b9250506020610e9085828601610e45565b9150509250929050565b60008115159050919050565b610eaf81610e9a565b82525050565b6000602082019050610eca6000830184610ea6565b92915050565b610ed981610e24565b82525050565b6000602082019050610ef46000830184610ed0565b92915050565b600080600060608486031215610f1357610f12610dc1565b5b6000610f2186828701610e0f565b9350506020610f3286828701610e0f565b9250506040610f4386828701610e45565b9150509250925092565b600060ff82169050919050565b610f6381610f4d565b82525050565b6000602082019050610f7e6000830184610f5a565b92915050565b600060208284031215610f9a57610f99610dc1565b5b6000610fa884828501610e0f565b91505092915050565b610fba81610de6565b82525050565b6000602082019050610fd56000830184610fb1565b92915050565b60008060408385031215610ff257610ff1610dc1565b5b600061100085828601610e0f565b925050602061101185828601610e0f565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061106257607f821691505b6020821081036110755761107461101b565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006110b582610e24565b91506110c083610e24565b92508282019050808211156110d8576110d761107b565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760008201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b600061113a602583610d1a565b9150611145826110de565b604082019050919050565b600060208201905081810360008301526111698161112d565b9050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b60006111cc602683610d1a565b91506111d782611170565b604082019050919050565b600060208201905081810360008301526111fb816111bf565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b600061125e602483610d1a565b915061126982611202565b604082019050919050565b6000602082019050818103600083015261128d81611251565b9050919050565b7f45524332303a20617070726f766520746f20746865207a65726f20616464726560008201527f7373000000000000000000000000000000000000000000000000000000000000602082015250565b60006112f0602283610d1a565b91506112fb82611294565b604082019050919050565b6000602082019050818103600083015261131f816112e3565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e6365000000600082015250565b600061135c601d83610d1a565b915061136782611326565b602082019050919050565b6000602082019050818103600083015261138b8161134f565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f20616460008201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b60006113ee602583610d1a565b91506113f982611392565b604082019050919050565b6000602082019050818103600083015261141d816113e1565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b6000611480602383610d1a565b915061148b82611424565b604082019050919050565b600060208201905081810360008301526114af81611473565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b6000611512602683610d1a565b915061151d826114b6565b604082019050919050565b6000602082019050818103600083015261154181611505565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b600061157e602083610d1a565b915061158982611548565b602082019050919050565b600060208201905081810360008301526115ad81611571565b905091905056fea2646970667358221220482a5634b4ec47380c576ed431eb52233e748529cdda94ec5aaa2a32d6b3213064736f6c63430008110033"
                const abi = [
                    {
                        "inputs": [
                            {
                                "internalType": "string",
                                "name": "name",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "symbol",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "initialSupply",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "constructor"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Approval",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "previousOwner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "OwnershipTransferred",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Transfer",
                        "type": "event"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            }
                        ],
                        "name": "allowance",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "approve",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "account",
                                "type": "address"
                            }
                        ],
                        "name": "balanceOf",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [
                            {
                                "internalType": "uint8",
                                "name": "",
                                "type": "uint8"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "subtractedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "decreaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "addedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "increaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "name",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "owner",
                        "outputs": [
                            {
                                "internalType": "address",
                                "name": "",
                                "type": "address"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "renounceOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "symbol",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "totalSupply",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transfer",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transferFrom",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "transferOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ]
                var c1 = Math.pow(10, 6)
                var finaltotalsupply = c1 * (finaltranche[4]);
                // const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                const deploy = async () => {
                    winlog.info('Attempting to deploy from account:', address + " total supply::: " + (finaltranche[4]) + " name " + finaltranche[2]);
                    const incrementer = new web3.eth.Contract(abi, address);

                    const incrementerTx = incrementer.deploy({
                        data: bytecode,
                        arguments: [finaltranche[0], finaltranche[0], BigInt(finaltotalsupply)],
                    })
                    const createTransaction = await web3.eth.accounts.signTransaction({
                        from: address,
                        data: incrementerTx.encodeABI(),
                        gas: 8000000,
                        chainId: "101122"
                    },
                        privKey
                    )
                    const createReceipt = new web3.eth.sendSignedTransaction(createTransaction.rawTransaction).then((res) => {
                        winlog.info('FT Contract deployed at address', res.contractAddress);

                        resolve(res.contractAddress);

                    });
                };

                deploy()

            });
        }

        async function getissueraccountaddress() {
            return new Promise((resolve, reject) => {
                //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
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
                    winlog.info(`Making a call to User contract at address ${contractAddress}`);
                    const data = await incrementer.methods
                        .getUserById(IssuerID)
                        .call({ from: address });
                    //  winlog.info("data:: " + JSON.stringify(data));
                    // winlog.info(`The current string is: ` + data);
                    // var response ={ "result":JSON.stringify(data)}
                    // winlog.info(response)
                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info(finalresponse)
                    winlog.info("account address::::: " + finalresponse[4])
                    resolve(finalresponse[4])
                };

                get1();
            });
        }
        async function TransferTokens(deployedaddress, accountaddress, finaltotalsupply) {
            return new Promise((resolve, reject) => {
                const contractAddress = deployedaddress;// Contract Call
                winlog.info("\nownership details::: deployed address " + deployedaddress + " issuer id: " + accountaddress)
                const abi = [
                    {
                        "inputs": [
                            {
                                "internalType": "string",
                                "name": "name",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "symbol",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "initialSupply",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "constructor"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Approval",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "previousOwner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "OwnershipTransferred",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Transfer",
                        "type": "event"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            }
                        ],
                        "name": "allowance",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "approve",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "account",
                                "type": "address"
                            }
                        ],
                        "name": "balanceOf",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [
                            {
                                "internalType": "uint8",
                                "name": "",
                                "type": "uint8"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "subtractedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "decreaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "addedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "increaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "name",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "owner",
                        "outputs": [
                            {
                                "internalType": "address",
                                "name": "",
                                "type": "address"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "renounceOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "symbol",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "totalSupply",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transfer",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transferFrom",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "transferOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ]
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.transfer(accountaddress, BigInt(finaltotalsupply)).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the function in FT contract at address ${contractAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: contractAddress,
                            data: encoded,
                            gasLimit: 312896,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                    resolve("transfer token success")
                }; increment();
            });

        }


        async function TransferOwnerShip(deployedaddress, accountaddress) {
            return new Promise((resolve, reject) => {
                const contractAddress = deployedaddress;// Contract Call
                winlog.info("\nownership details::: deployed address " + deployedaddress + " issuer id: " + accountaddress)
                const abi = [
                    {
                        "inputs": [
                            {
                                "internalType": "string",
                                "name": "name",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "symbol",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "initialSupply",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "constructor"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Approval",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "previousOwner",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "OwnershipTransferred",
                        "type": "event"
                    },
                    {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "indexed": true,
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "indexed": false,
                                "internalType": "uint256",
                                "name": "value",
                                "type": "uint256"
                            }
                        ],
                        "name": "Transfer",
                        "type": "event"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "owner",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            }
                        ],
                        "name": "allowance",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "approve",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "account",
                                "type": "address"
                            }
                        ],
                        "name": "balanceOf",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "decimals",
                        "outputs": [
                            {
                                "internalType": "uint8",
                                "name": "",
                                "type": "uint8"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "subtractedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "decreaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "spender",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "addedValue",
                                "type": "uint256"
                            }
                        ],
                        "name": "increaseAllowance",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "name",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "owner",
                        "outputs": [
                            {
                                "internalType": "address",
                                "name": "",
                                "type": "address"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "renounceOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "symbol",
                        "outputs": [
                            {
                                "internalType": "string",
                                "name": "",
                                "type": "string"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [],
                        "name": "totalSupply",
                        "outputs": [
                            {
                                "internalType": "uint256",
                                "name": "",
                                "type": "uint256"
                            }
                        ],
                        "stateMutability": "view",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transfer",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "from",
                                "type": "address"
                            },
                            {
                                "internalType": "address",
                                "name": "to",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "name": "transferFrom",
                        "outputs": [
                            {
                                "internalType": "bool",
                                "name": "",
                                "type": "bool"
                            }
                        ],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    },
                    {
                        "inputs": [
                            {
                                "internalType": "address",
                                "name": "newOwner",
                                "type": "address"
                            }
                        ],
                        "name": "transferOwnership",
                        "outputs": [],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ]
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                const encoded = incrementer.methods.transferOwnership(accountaddress).encodeABI();
                const increment = async () => {
                    winlog.info(
                        `Calling the function in FT contract at address ${contractAddress}`
                    );
                    const createTransaction = await web3.eth.accounts.signTransaction(
                        {
                            from: address,
                            to: contractAddress,
                            data: encoded,
                            gasLimit: 312896,
                            chainId: "101122"
                        },
                        privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                        createTransaction.rawTransaction
                    );
                    winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                    resolve("transfer owneship success")
                }; increment();
            });

        }


    }
}
module.exports = Deal;