const path = require('path');

var request = require('request');
const fs = require('fs')
const xl = require("xlsx");
const uuidv4 = require('uuid/v4');
const Web3 = require('web3');
const solc = require('solc');
var EventEmitter = require("events").EventEmitter;
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://104.42.155.78:27017/IntainMarkets";
// var url = "mongodb://mongoservice:27017/IntainMarkets";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";

const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://104.42.155.78:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
const winlog = require("../log/winstonlog");

var pools = {

    // createpool: async function (req, res) {
    //     winlog.info("inside createpool");

    //     if (!req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
    //         !req.body.assignservicer || !req.body.assignunderwriter || !req.body.serialno
    //         || !req.body.contractaddress) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     } else {

    //         //invoking the contract
    //         var contractaddress = req.body.contractaddress;
    //         var UA_contract = require('./web3js/createpool');
    //         winlog.info("contractaddress*** " + contractaddress);
    //         let date = String(new Date().toJSON()).substring(0, 10);
    //         winlog.info(date);
    //         var poolid = String(date).substring(0, 1) + String(date).substring(2, 4);
    //         poolid = poolid + "IM" + String(req.body.poolname).charAt(0) + String(req.body.assetclass).charAt(0) +
    //             String(req.body.serialno);

    //         var pooldetails = [[uuidv4(), poolid, req.body.poolname, req.body.assetclass,
    //         req.body.assignverification, req.body.assignservicer, req.body.assignunderwriter,
    //             "0", date, "0", "UnMapped", "", "", "", ""]];

    //         let res1 = await UA_contract.transaction(contractaddress, pooldetails, "CreatePool");
    //         if (res1.success) {
    //             winlog.info("success");
    //             res.send({ "success": true, "message": "Pool Created" });
    //         }
    //     }
    // },

    createpool: async function (req, res) {
        var PoolSaveEmitter = new EventEmitter();
        var addPoolEmit = new EventEmitter();
        if (!req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
            !req.body.assignservicer || !req.body.assignunderwriter || !req.body.serialno
            || !req.body.issuerId || !req.body.issuerName) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                let date = String(new Date().toJSON()).substring(0, 10);
                db.collection('pool_detail').find({}).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);

                    var poolid = String(req.body.poolname).slice(0, 2) + String(req.body.issuerName).charAt(0) + String(req.body.assetclass).charAt(0) + String(date).substring(2, 4) + String(result.length + 1).padStart(3, '0');
                    winlog.info(poolid)
                    PoolSaveEmitter.emit('savepool', poolid)

                })
            })

        }
        PoolSaveEmitter.on('savepool', (poolid) => {
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                var arr = [];
                var attributes = "";

                // 
                let date = String(new Date().toJSON()).substring(0, 10);

                winlog.info(date);
                // var poolid = String(date).substring(0, 1) + String(date).substring(2, 4);
                // poolid = poolid + "IM" + String(req.body.poolname).charAt(0).toUpperCase() + String(req.body.assetclass).charAt(0).toUpperCase() +
                //     String(req.body.serialno);

                //  attributeEmit.on('getAttribute', function () {

                db.collection('Attribute_details').find({ attributePoolName: req.body.poolname }).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);

                    for (c = 0; c < result.length; c++) {

                        if (attributes == "") {
                            attributes = result[c].attributeId;
                        } else {
                            attributes = attributes + "#" + result[c].attributeId;
                        }
                        if (c == (result.length - 1)) {
                            addPoolEmit.emit('addPool', poolid);

                        }

                    }

                })
                //  });
                addPoolEmit.on('addPool', function (poolid) {
                    var json = {
                        "uniqueID": uuidv4(),
                        "poolID": poolid,
                        "poolname": req.body.poolname,
                        "issuerId": req.body.issuerId,
                        "assetclass": req.body.assetclass,
                        "assignverification": req.body.assignverification,
                        "assignservicer": req.body.assignservicer,
                        "assignunderwriter": req.body.assignunderwriter,
                        "numberofloans": "0",
                        "setupdate": date,
                        "originalbalance": "0",
                        "status": "Created",
                        "loanids": "",
                        "typename": "",
                        "filepath": "",
                        "typepurpose": "",
                        "attributes": attributes,
                        "issuerName": req.body.issuerName,
                        "assignpayingagent": req.body.assignpayingagent
                    }

                    arr.push(json);

                    db.collection('pool_detail').insert(arr, (err, result) => {

                        if (err) return winlog.info(err)
                        winlog.info('saved to database')
                        res.send({ "success": true, "message": "Pool Created" });

                    });

                }); // end of pool emit


            }); // end of mongo connection
        })

    },
    updatepool: async function (req, res) {
        winlog.info("update createpool");

        if (!req.body.uniqueid || !req.body.poolid || !req.body.poolname || !req.body.assetclass || !req.body.assignverification ||
            !req.body.assignservicer || !req.body.assignunderwriter || !req.body.numberofloans || !req.body.poolcreateddate ||
            !req.body.originalbalance || !req.body.status || !req.body.loanids
            || !req.body.contractaddress) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            //invoking the contract
            var contractaddress = req.body.contractaddress;
            var UA_contract = require('./web3js/update');
            winlog.info("contractaddress*** " + contractaddress);

            var pooldetails = [[req.body.uniqueid, req.body.poolid, req.body.poolname, req.body.assetclass,
            req.body.assignverification, req.body.assignservicer, req.body.assignunderwriter,
            req.body.numberofloans, req.body.poolcreateddate, req.body.originalbalance, req.body.status,
            req.body.loanids, "", "", ""]];

            let res1 = UA_contract.transaction(contractaddress, pooldetails, "CreatePool");
            if (res1.success) {
                winlog.info("success");
                res.send({ "success": true, "message": "Pool Created" });
            }
        }
    },
    // getallpools: async function (req, res) {

    //     if (!req.query.contractaddress) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     } else {

    //         //invoking the contract
    //         var UA_contract = require('./web3js/GetAllPools/interact');
    //         winlog.info("contractaddress*** " + req.query.contractaddress);
    //         let res1 = await UA_contract.querygetallpools(req.query.contractaddress, "CreatePool");
    //         if (res1.success) {
    //             var key = ["uniqueID", "poolID", "poolname", "assetclass", "assignverification",
    //                 "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
    //                 "status", "loanids", "typename", "filepath", "typepurpose"];

    //             var arr = [];
    //             var data = JSON.parse(res1.result);
    //             // winlog.info("data:: " + data);
    //             for (var i = 0; i < data.length; ++i) {
    //                 var json = {};
    //                 winlog.info(data[i]);
    //                 for (var j = 0; j < key.length; ++j) {
    //                     json[key[j]] = data[i][j];
    //                     winlog.info(data[i][j]);
    //                 }
    //                 arr.push(json);
    //             }
    //             setTimeout(function () {
    //                 res.send({ "success": true, "message": arr });
    //             }, 1000);
    //         }
    //     }
    // },
    getallpoolsbyIssuerId: function (req, res, next) {
        if (!req.query.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var event = new EventEmitter();
            var event1 = new EventEmitter();
            winlog.info("inside fn");
            var resArr = [];

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                var dealIds = '';
                var count = 0;
                var Dcount = '';

                db.collection('pool_detail').find({ issuerId: req.query.issuerId }).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);
                    if (result.length > 0) {

                        res.send(result);
                    }
                    else {
                        // var json = {
                        //     "isSuccess": false,
                        //     "message": "No Pools found for the isuuer  " + req.query.issuerId
                        // }

                        res.send([]);

                    }
                });


            });
        }
    },

    getallpoolsbyVAId: function (req, res, next) {
        if (!req.query.VAId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var event = new EventEmitter();
            var event1 = new EventEmitter();
            winlog.info("inside fn");
            var resArr = [];

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                var dealIds = '';
                var count = 0;
                var Dcount = '';

                db.collection('pool_detail').find({ "assignverification": req.query.VAId, "status": { $nin: ["Created"] } }).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);
                    if (result.length > 0) {

                        res.send(result);
                    }
                    else {
                        // var json = {
                        //     "isSuccess": false,
                        //     "message": "No Pools found for the verification agent with id  " + req.query.VAId
                        // }

                        res.send([]);

                    }
                });


            });
        }
    },
    getbypoolid: function (req, res, next) {
        if (!req.query.poolid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var poolid = req.query.poolid;
            var UserEmitter = new EventEmitter();

            var poolData = [];
            var loanData = [];
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');


                db.collection('pool_detail').find({ poolID: poolid }).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);
                    if (result.length > 0) {
                        poolData = result;
                        db.collection('lms').find({ 'poolid': poolid }).toArray(function (err, result) {
                            winlog.info("res:: " + result.length);
                            //if (result.length > 0) {
                            loanData = result;
                            // }
                            //res.send({ "success": true, "pooldetails": poolData, "loandetails": loanData });
                            UserEmitter.emit('getuserdetails')
                        });
                        //  res.send(result);
                    }
                    else {
                        var json = {
                            "isSuccess": false,
                            "message": "No Pool with poolid " + poolid
                        }

                        res.send(json);

                    }
                })

            });
        }

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
                if (data.length > 0) {

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    // 1)UserId 2)EmailAddress 3)UserHash 4)UserSatus 5)UserAccAddress 6) userRole

                    var key = ["UserId", "EmailAddress", "UserHash", "UserSatus", "UserAccAddress", "userRole", "username"];

                    // var arr = [];
                    var c2 = 0;
                    winlog.info(poolData);
                    for (var i = 0; i < finalresponse.length; ++i) {
                        if (finalresponse[i][0] == poolData[0]["assignverification"]) {
                            winlog.info("fdv");

                            poolData[0]["VAUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == poolData[0]["assignservicer"]) {
                            poolData[0]["ServicerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == poolData[0]["issuerId"]) {
                            poolData[0]["IssuerUserName"] = finalresponse[i][6]
                        } else if (finalresponse[i][0] == poolData[0]["assignunderwriter"]) {
                            poolData[0]["UnderWriterUserName"] = finalresponse[i][6]
                        }
                        c2++;

                        //   trancheData.push(json);
                        if (c2 == finalresponse.length) {

                            res.send({ "success": true, "pooldetails": poolData, "loandetails": loanData });
                        }

                    }


                    // res.send(arr)
                } else {
                    res.send({ "success": true, "pooldetails": poolData, "loandetails": loanData });
                }

            };

            getloans();
        })
    },

    updatePoolStatus: function (req, res, next) {
        if (!req.query.poolid || !req.query.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');

                db.collection('pool_detail').updateOne({ "poolID": req.query.poolid }, { $set: { status: req.query.status } }, function (err, result) {

                    if (err) throw err;

                    // poolData = result;
                    res.send({
                        "isSuccess": true,
                        "message": "pool status updated sucessfully"
                    });

                })

            });

        }

    },

    updateLoanAndPoolStatus: function (req, res, next) {
        if (!req.query.poolid || !req.query.poolStatus || !req.query.loanStatus) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');

                db.collection('pool_detail').updateOne({ "poolID": req.query.poolid }, { $set: { status: req.query.poolStatus } }, function (err, result) {
                    if (err) throw err;

                    db.collection('lms').updateMany({ "poolid": req.query.poolid }, { $set: { status: req.query.loanStatus } }, function (err, result) {
                        if (err) throw err;

                        res.send({
                            "isSuccess": true,
                            "message": "Loan status and pool status updated sucessfully"
                        });


                    });

                })

            });

        }
    },
    // getbypoolid: async function (req, res) {

    //     if (!req.query.contractaddress || !req.query.poolid) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     } else {

    //         //invoking the contract
    //         var UA_contract = require('./web3js/GetByPoolID/interact');
    //         winlog.info("contractaddress*** " + req.query.contractaddress);
    //         let res1 = await UA_contract.querygetallpools(req.query.contractaddress, req.query.poolid, "CreatePool");
    //         if (res1.success) {
    //             var key = ["uniqueID", "poolID", "poolname", "assetclass", "assignverification",
    //                 "assignservicer", "assignunderwriter", "numberofloans", "setupdate", "originalbalance",
    //                 "status", "loanids", "typename", "filepath", "typepurpose"];

    //             var arr = [];
    //             var data = JSON.parse(res1.result);
    //             winlog.info("data:: " + data);
    //             // for (var i = 0; i < data.length; ++i) {
    //             var json = {};
    //             // winlog.info(data[i]);
    //             for (var j = 0; j < key.length; ++j) {
    //                 json[key[j]] = data[j];
    //                 // winlog.info(data[i][j]);
    //             }
    //             arr.push(json);
    //             var loanids = json['loanids'];
    //             loanids = loanids.split("#");
    //             winlog.info(loanids);
    //             var loanarr = [];

    //             //quer loan details from mongo db
    //             MongoClient.connect(url, function (err, client) {
    //                 const db = client.db("IntainMarkets");
    //                 for (var i = 0; i < loanids.length; ++i) {
    //                     winlog.info(loanids[i]);
    //                     db.collection('LoanData').find({ 'loanid': String(loanids[i]) }).toArray(function (err, result) {
    //                         winlog.info("res:: " + result.length);
    //                         if (result.length > 0) {
    //                             loanarr.push(result[0]);
    //                         }
    //                     });
    //                 }
    //             });

    //             setTimeout(function () {
    //                 res.send({ "success": true, "pooldetails": arr, "loandetails": loanarr });

    //             }, 1000);
    //         }
    //     }
    // },
    mappoolstoloans: async function (req, res) {
        if (!req.body.loanid || !req.body.poolid || !req.body.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var eventemit1 = new EventEmitter();
            var eventemit2 = new EventEmitter();
            var contractUpdate = new EventEmitter();
            var mapLoan = new EventEmitter();
            var loanidhash = "";
            var originalbal = 0;
            var count = 0;
            var count2 = 0;
            var loanData = "";

            //add originalbal
            var loans = req.body.loanid;
            winlog.info("loans:: " + loans.length);


            // setTimeout(function () {
            //     eventemit2.emit('update');
            // }, 2000)
            //   });


            eventemit2.on('update', function () {
                winlog.info("----------------------------------");

                var loans = req.body.loanid;

                MongoClient.connect(url, function (err, client) {
                    if (err) throw err;
                    const db = client.db("IntainMarkets");
                    winlog.info('CONNECTED');

                    contractUpdate.on('update', async function () {
                        db.collection('contract').updateMany({ loanid: { $in: loans } }, { $set: { poolid: req.body.poolid } }, function (err, result) {

                            if (err) throw err;
                            //winlog.info("44444444444444444444444444444444444444");
                            res.send({ "success": true, "message": "Pool Upated" });


                        });
                    });

                    eventemit1.on('update', async function () {

                        // winlog.info("+++++++++++++++++++++++++++++++++++  " + loanid);

                        db.collection('lms').updateMany({ loanid: { $in: loans }, "issuerId": req.body.issuerId }, { $set: { poolid: req.body.poolid, status: "Mapped" } }, function (err, result) {
                            if (err) throw err;
                          //  winlog.info("33333333333333333333333333333333333333");
                            contractUpdate.emit('update');


                        }); // end of lms update
                    }); // end of emit1


                    db.collection('pool_detail').updateOne({ "poolID": req.body.poolid }, {
                        $set: {
                            numberofloans: String(loanData.length),
                            originalbalance: String(originalbal), status: "Pending",
                            loanids: String(loanidhash)
                        }
                    }, function (err, result) {

                        if (err) throw err;
                        winlog.info("1 document updated");
                      //  winlog.info("22222222222222222222222222222222222222222");
                        //   for (var q = 0; q < loans.length; q++) {
                        eventemit1.emit('update');
                        // }



                    });  // end of pool update

                });  // end of mongo connection 
            });

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');
                var dealIds = '';
                var count = 0;
                var Dcount = '';

            db.collection('lms').find({ loanid: { $in: loans } }).toArray(function (err, result) {
                winlog.info("Lengthof result" + result.length);
                if (result.length > 0) {
                    loanData = result;
                    //   winlog.info(JSON.stringify(loanData) + "------------------");
                    mapLoan.emit('map');
                }
                else {
                    // var json = {
                    //     "isSuccess": false,
                    //     "message": "No Pools found for the verification agent with id  " + req.query.VAId
                    // }


                    res.send({ "success": false, "message": "No data found for the given loans" });

                }
            });
        }); // end og mongo connection 
            mapLoan.on('map', function () {

                for (var i = 0; i < loanData.length; i++) {

                    //  var j = loans[i];
                    originalbal = parseFloat(originalbal) + parseFloat(loanData[i]['current_principal']);
                    if (i == 0) {
                        loanidhash = loanData[i]['loanid'];
                    } else {
                        loanidhash = loanidhash + "#" + loanData[i]['loanid'];

                    }
                    count++;
                    // winlog.info(count + " : " + loans.length  + "::: "+originalbal);
                    if (count == loanData.length) {
                     //   winlog.info("-----------------------------------------");
                        eventemit2.emit('update');

                    }

                }

            }); // end of emit map 

        }
    }

}
module.exports = pools;