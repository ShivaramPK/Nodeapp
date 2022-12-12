var request = require('request');
const fs = require('fs')
const reader = require('xlsx')
var dateFormat = require('date-format');
// var dateFormat = require('dateformat');
var EventEmitter = require("events").EventEmitter;
var MongoClient = require('mongodb').MongoClient;
const date = require('date-and-time')
//var url = "mongodb://localhost:27017/IntainMarkets";
// var url = "mongodb://104.42.155.78:27017/IntainMarkets";
// var url = "mongodb://mongoservice:27017/IntainMarkets";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
const winlog = require("../log/winstonlog");

var loans = {

    // onboardloans: function (req, res, next) {
    //     if (!req.body.filename) {
    //         res.status(400).send({ "message": "Missing Arguments!" })
    //     }
    //     else {

    //         var filename = req.body.filename;
    //         var uploadname;

    //         //check file path
    //         if (fs.existsSync("./uploads/" + filename)) {
    //             winlog.info("file found");
    //             uploadname = "./uploads/" + filename;

    //             const path = uploadname;
    //             winlog.info("pathhhhh" + path);

    //             var key = [];
    //             var finalarr = [];

    //             var wb = xl.readFile(path, { cellDates: true }, { sheetStubs: true });
    //             var ws = wb.Sheets[wb.SheetNames[0]];

    //             var rows = xl.utils.sheet_to_json(ws, {
    //                 header: 0,
    //                 defval: ""
    //             });

    //             winlog.info("first:  " + JSON.stringify(rows[0]) + "   len: " + rows.length);

    //             var t1 = Object.keys(rows[0]);
    //             winlog.info("t1:::" + t1);

    //             var names = String(t1).split(",");
    //             winlog.info("key::;" + key.length + "   keys:   " + JSON.stringify(names));


    //             for (var k = 0; k < names.length; ++k) {

    //                 if ((names[k].toLowerCase()).includes("empty")) {

    //                 }
    //                 else {
    //                     key.push(names[k]);
    //                 }
    //             }

    //             k = 0;
    //             while (k < rows.length) {
    //                 var json = {};
    //                 for (var p = 0; p < key.length; p++) {
    //                     if (String(key[p]).includes("date") || (String(key[p]).includes("Date")) || String(rows[k][key[p]]).includes(':')) {

    //                         if (String(rows[k][key[p]]) == "null" || String(rows[k][key[p]]) == "" || rows[k][key[p]] == "") {
    //                             json[key[p]] = "";
    //                         }
    //                         else {
    //                             if (rows[k][key[p]] instanceof Date) {
    //                                 // //yyyy-mm-dd
    //                                 var d1 = new Date(rows[k][key[p]]);
    //                                 var arr = [1, 3, 5, 7, 8, 10, 12];

    //                                 if (!arr.includes(d1.getMonth() + 1)) {
    //                                     if (d1.getDate() == 30) {
    //                                         var tempdate = "1";
    //                                         var d = d1.getMonth() + 2;
    //                                     } else {
    //                                         var tempdate = d1.getDate() + 1;
    //                                         if (d1.getMonth() < 9) {
    //                                             var d = "0" + String(d1.getMonth() + 1);
    //                                         } else {
    //                                             var d = d1.getMonth() + 1;
    //                                         }
    //                                     }
    //                                 } else {
    //                                     var tempdate = d1.getDate() + 1;
    //                                     if (d1.getMonth() < 9) {
    //                                         var d = "0" + String(d1.getMonth() + 1);
    //                                     } else {
    //                                         var d = d1.getMonth() + 1;
    //                                     }
    //                                 }
    //                                 if (k == 0) {
    //                                     winlog.info(d1 + "   year:: " + d1.getFullYear() + "  month:: " + (d) + "  date:: " + (d1.getDate() + 1));
    //                                 }
    //                                 rows[k][key[p]] = d1.getFullYear() + "-" + d + "-" + (tempdate);
    //                             }
    //                         }
    //                         json[key[p]] = String(rows[k][key[p]]);
    //                     }
    //                     else {
    //                         json[key[p]] = String(rows[k][key[p]]);
    //                     }
    //                     json['loandata'] = "yes";
    //                     json['contractdata'] = "no";
    //                     json['status'] = "Unmapped";
    //                     json['createddate'] = String(new Date().toJSON()).substring(0, 10);
    //                 }//end of for
    //                 finalarr.push(json);
    //                 ++k;
    //             }//end of while

    //             winlog.info("finalar:: " + JSON.stringify(finalarr[finalarr.length - 1]) + "   len:: " + finalarr.length);
    //             winlog.info("finalar:: " + JSON.stringify(finalarr[0]));

    //             // save to db
    //             MongoClient.connect(url, function (err, client) {
    //                 const db = client.db("IntainMarkets");
    //                 winlog.info("connected");
    //                 db.collection('LoanData').insertMany(finalarr, function (err, result) {
    //                     if (err) return winlog.info(err)
    //                     winlog.info("Number of documents inserted: " + result);
    //                     winlog.info('saved to database')
    //                     res.send({ "success": true, "result": "Data Saved!" });
    //                 });
    //             });
    //         } else {
    //             res.send({ "success": false, "result": "File not found!" });
    //         }
    //     }
    // },//end of onboardloans

    onboardloans: function (req, res, next) {
        // check for the args 
        if (!req.body.filename || !req.body.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            //  var lmscollection = req.query.poolname + "_lms"
            //    var filename = req.query.poolname + req.query.filetype;
            var filetype = req.body.filename.split('.');
            //  var poolid = req.query.poolid;
            var uploadname = "./uploads/" + req.body.filename;
            const path = uploadname;
            var dealids = [];

            var event1 = new EventEmitter();
            var saveLMS = new EventEmitter();

            var getAttributeNames = new EventEmitter();
            var readFile = new EventEmitter();
            var key = [];
            var count = 0;
            var count1 = 0;
            var attributeList = [];
            var finalarr = [];
            //check filetype
            if (filetype[1] == "xlsx" || filetype[1] == "xls" || filetype[1] == "xlsm") {
                winlog.info(filetype[0] + " :::pathhhhh" + path + ":::" + filetype[1]);

                if (fs.existsSync(path)) {
                    winlog.info("File exist!");
                    MongoClient.connect(url, function (err, client) {
                        if (err) throw err;
                        const db = client.db("IntainMarkets");
                        winlog.info('CONNECTED');

                        db.collection('Attribute_details').find({ attributePoolName: "IM Test" }).toArray(function (err, result) {
                            if (err) throw err;
                            //  key.push(result[]);
                            key = result;

                            winlog.info(JSON.stringify(key));
                            readFile.emit('readExcel');


                        }); // end of 

                        readFile.on('readExcel', function () {

                            // Reading our test file
                            const file = reader.readFile(path);

                            let data = []
                            winlog.info(file.SheetNames + "::");
                            const sheets = file.SheetNames


                            const temp = reader.utils.sheet_to_json(
                                file.Sheets[file.SheetNames[0]])
                            temp.forEach((res) => {
                                data.push(res)
                            })


                            // Printing data
                            //  winlog.info(JSON.stringify(data) + ":::::::::::::::::::::::::::::::::::::::::::::");


                            saveLMS.on('saveData', function () {
                                winlog.info('hi');
                                winlog.info(JSON.stringify(finalarr));
                                db.collection('lms').insertMany(finalarr, function (err, result) {
                                    if (err) throw err;
                                    winlog.info("1 document inserted");
                                    res.send({ "success": true, "result": "Data Saved!" });
                                    //res.send(resjson);
                                    //  event1.emit("querypool", finalarr.length);
                                });

                            }); //end of save LMS emit


                            for (var i = 0; i < data.length; i++) {
                                winlog.info(JSON.stringify(data[i]) + " :: index :  " + i);

                                var json = {

                                }
                                for (var l = 0; l < key.length; l++) {
                                    // winlog.info(JSON.stringify(key[l]) + "/////////////////////////////////");
                                    var position = key[l].attributeStandardName.search(/Date/i);
                                    //var position = -1;
                                    //   winlog.info(key[l].attributeStandardName + "--------------------------------------------------------------------position:: " + position);
                                    if (position == -1) {
                                        json[key[l].attributeStandardName] = String(data[i][key[l].attributeName]);
                                    } else {
                                        //winlog.info("+++++++++++++++++++++++++++++++++++++++++++++++++++");
                                        var utc_days = Math.floor(data[i][key[l].attributeName] - 25569);
                                        var utc_value = utc_days * 86400;
                                        var date_info = new Date(utc_value * 1000);

                                        // Creating object of current date and time 
                                        // by using Date() 
                                        const now = new Date();

                                        // Formatting the date and time
                                        // by using date.format() method
                                        const value = date.format(date_info, 'MM-DD-YYYY');

                                        winlog.info(date_info + " :: date_info  :: " + value);

                                        json[key[l].attributeStandardName] = value;
                                    }

                                }
                                json['loandata'] = "yes";
                                json['contractdata'] = "no";
                                json['contractdigitized'] = "no";
                                json['status'] = "Unmapped";
                                json['createddate'] = String(new Date().toJSON()).substring(0, 10);
                                json['issuerId'] = req.body.issuerId;
                                json['poolid'] = "";
                                json['asset_class'] = "Residential Real Estate";
                                json['matched'] = '0';

                                finalarr.push(json);
                                count1++;

                                if (count1 == data.length) {
                                    saveLMS.emit('saveData');
                                }


                            }
                        });
                    }); // end of mongo connection 
                } else {
                    winlog.info("file does not exist");
                }
            }
        }

    },

    //-----------------------------------------------------------------------------------------------------------------

    getallloans: function (req, res, next) {
        if (!req.query.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            MongoClient.connect(url, function (err, client) {
                const db = client.db("IntainMarkets");
                db.collection('lms').find({ 'issuerId': req.query.issuerId }).toArray(function (err, result) {
                    if (result.length > 0) {
                        res.send(result);
                    } else {
                        res.send([]);
                    }
                });
            });
        }
    },//end of getallloans   updateLoanStatus
    getloansbyarayofloanhashes: function (req, res, next) {

        if (!req.query.loanhashes) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {
            var loanids = String(req.query.loanhashes).split(",");
            var finalarr = [];
            MongoClient.connect(url, function (err, client) {
                const db = client.db("IntainMarkets");
                for (var i = 0; i < loanids.length; ++i) {
                    winlog.info(loanids[i]);
                    db.collection('lms').find({ 'loanid': String(loanids[i]) }).toArray(function (err, result) {
                        winlog.info("res:: " + result.length);
                        if (result.length > 0) {
                            finalarr.push(result[0]);
                        }
                    });
                }
            });

            setTimeout(function () {
                res.send(finalarr);
            }, 1000);


        }
    },//end of getloansbyarayofloanhashes

    updateLoanStatus: function (req, res, next) {

        if (!req.query.loanid || !req.query.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');


                db.collection('lms').updateOne({ "loanid": req.query.loanid }, { $set: { status: req.query.status } }, function (err, result) {
                    //winlog.info("Lengthof result" + result.length);
                    // if (result.length > 0) {
                    if (err) throw err;
                    res.send({
                        "isSuccess": true,
                        "message": "loan status updated sucessfully"
                    });
                    // }
                    // else {
                    //     var json = {
                    //         "isSuccess": false,
                    //         "message": "No loan data found with loanid " + req.query.loanid
                    //     }

                    //     res.send(json);

                    // }
                })

            });

        }
    },

    updateArrayofLoanStatus: function (req, res, next) {

        if (!req.body.loanid || !req.body.status) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {

            var loanid = req.body.loanid;
            var count =0;
            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                winlog.info('CONNECTED');

                
                loanid.forEach(ID => {

                    db.collection('lms').updateOne({ "loanid": ID }, { $set: { status: req.body.status } }, function (err, result) {
                        winlog.info("Lengthof result" + JSON.stringify(result));
                        // if (result.length > 0) {
                        if (err) throw err;
                        count++;
                        if(count==loanid.length){
                            winlog.info(`updated: ${count} documents`)
                        res.send({
                            "isSuccess": true,
                            "message": "loan status updated sucessfully"
                        });
                    }
                        // }
                        // else {
                        //     var json = {
                        //         "isSuccess": false,
                        //         "message": "No loan data found with loanid " + req.query.loanid
                        //     }

                        //     res.send(json);

                        // }
                    })

                });
            });

        }
    },


    filterloans: function (req, res, next) {
        if (!req.body.contractdigitized || !req.body.minprincipalamt || !req.body.maxprincipalamt ||
            !req.body.mindate || !req.body.maxdate || !req.body.assetclass || !req.body.issuerId) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            MongoClient.connect(url, function (err, client) {
                const db = client.db("IntainMarkets");
                db.collection('lms').find({
                    'contractdigitized': String(req.body.contractdigitized), 'asset_class': String(req.body.assetclass), 'current_principal': { $gt: String(req.body.minprincipalamt), $lt: String(req.body.maxprincipalamt) },
                    'createddate': { $gte: String(req.body.mindate), $lte: String(req.body.maxdate) }, 'issuerId': req.body.issuerId
                }).toArray(function (err, result) {
                    winlog.info("res:: " + result.length);
                    if (result.length > 0) {
                        var json = { "success": true, "data": result }
                        winlog.info("json::  " + JSON.stringify(json));
                        res.send(json);
                    } else {
                        var json = { "success": false, "data": [] }
                        winlog.info("json::  " + JSON.stringify(json));
                        res.send(json);
                    }
                });
            });
        }
    },
    updatedata: function (req, res, next) {

        // var arr = req.body.data;
        var arrlms = [];
        var arrcontract = [];
        var lmscollection;
        var contractcollection;
        var b = 0;
        var event1 = new EventEmitter();
        var event2 = new EventEmitter();

        var event3 = new EventEmitter();

        var event4 = new EventEmitter();

        var findAttributes = new EventEmitter();


        // for (var i = 0; i < arr.length; ++i) {
        //     arrlms[i] = arr[i].lms;
        //     arrcontract[i] = arr[i].contract;
        // }

        MongoClient.connect(url, function (err, client) {
            if (err) throw err
            const db = client.db("IntainMarkets");

            var resjson = {
                "isSuccess": true,
                "message": "Data Updated"
            }


            var lmsData = "";
            var contractData = "";
            var attributeData = [];
            var count1 = 0;
            var count2 = 0;
            var count = 0;
            var finacount = 0;
            var lmsloancount = 0;
            var dealidKey = "";
            var contractKey = "";

            winlog.info(req.body.poolid)
            db.collection('pool_detail').find({ poolID: req.body.poolid }).toArray(function (err, result) {
                winlog.info("Lengthof result" + result.length);
                if (result.length > 0) {

                    lmscollection = (result[0].poolname) + "_lms"
                    contractcollection = (result[0].poolname) + "_contract"
                    var attList = result[0].attributes.split('#');
                    // res.send(result);

                    if (attList.length < 2) {
                        var json = {
                            "isSuccess": false,
                            "message": "No Fields found for the poolid " + req.body.poolid
                        }

                        res.send(json);

                    } else {
                        for (var c = 0; c < attList.length; c++) {

                            findAttributes.emit("getAttributes", attList[c], attList.length);

                        }
                    }

                }
                else {
                    var json = {
                        "isSuccess": false,
                        "message": "No Pool with poolid " + req.body.poolid
                    }

                    res.send(json);
                }
            }); // end of get pool details 

            findAttributes.on('getAttributes', function (id, size) {


                winlog.info(id + ":::");
                db.collection('Attribute_details').findOne({ attributeId: id }, function (err, result) {
                    winlog.info(JSON.stringify(result));


                    winlog.info(Object.keys(result).length + "::::::::::::::::::::::::::::::::::::::::::");
                    if (Object.keys(result).length > 0) {

                        attributeData.push(result);
                        winlog.info(JSON.stringify(attributeData) + "::b");

                    }
                    b++;
                    if (b == size) {
                        for (var a = 0; a < attributeData.length; a++) {
                            // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                            if (attributeData[a].attributeStandardName == 'loanid') {
                                dealidKey = attributeData[a].attributeName;
                            }
                            if (attributeData[a].attributeStandardName == 'agreementid') {
                                contractKey = attributeData[a].attributeName;
                            }
                        }

                        event1.emit('modifyLMS',req.body.agreementloan);
                        winlog.info("\n get loans")
                        //  event1.emit('modifyLMS');

                    }

                });

            }); //end of find attributes emit


            
            // db.collection('Attribute_details').find().toArray(function (err, result) {
            //     winlog.info("Lengthof result" + result.length);

            //     attributeData = result;

            //     //  winlog.info(JSON.stringify(result[0]) + ":;;;;;");
            //     event1.emit('modifyLMS');

            // });
            event1.on('modifyLMS', function ( ) {

                winlog.info(dealidKey + "::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::"+req.body.lmsloan[dealidKey]);

                db.collection('lms').find({ loanid: req.body.lmsloan[dealidKey], poolid: req.body.poolid }).toArray(function (err, result) {
                    //  winlog.info("Lengthof result" + JSON.stringify(result));
                    lmsData = result[0];
                    count = Object.keys(req.body.lmsloan).length;
                    winlog.info(JSON.stringify(lmsData) + " :before lms update::");
                    Object.keys(req.body.lmsloan).forEach(function (key) {
                        // winlog.info('Key : ' + key + ', Value : ' + req.body.lmsloan[key]);
                        //winlog.info(JSON.stringify(attributeData) + "::legth   :: " + attributeData.length)
                        for (var c = 0; c < attributeData.length; c++) {
                            // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                            if (attributeData[c].attributeName == key) {

                                winlog.info(key + "  :::key");
                                winlog.info(attributeData[c].attributeStandardName + " ::value");
                                lmsData[attributeData[c].attributeStandardName] = req.body.lmsloan[key];

                                count1++
                                if (count == count1) {
                                    winlog.info("lms data::::::" + JSON.stringify(lmsData));
                                    lmsData['status'] = 'Reviewed';
                                    lmsData['matched'] = 1;
                                   event2.emit('updateLMS');
                                }

                            }
                        }


                    });
                    //                    winlog.info(JSON.stringify(lmsData) + " :after update::");

                });


            }); //end of event1
            event2.on('updateLMS', function () {
                db.collection('lms').updateOne({ loanid: req.body.lmsloan[dealidKey], poolid: req.body.poolid }, { $set: lmsData }, function (err, result) {
                    if (err) throw err;
                    winlog.info("1 document updated");
                    //res.send(resjson);
                    event3.emit('modifyContract');
                });

            }); //end of event2

            event3.on('modifyContract', function () {

                winlog.info(req.body.agreementloan[dealidKey] + "aggrement loan : " + JSON.stringify(req.body.agreementloan))
                db.collection('contract').find({ loanid: req.body.agreementloan[dealidKey], poolid: req.body.poolid }).toArray(function (err, result) {
                    //  winlog.info("Lengthof result" + JSON.stringify(result));
                    contractData = result[0];
                    var count = Object.keys(req.body.agreementloan).length;
                    winlog.info(JSON.stringify(contractData) + " :before update::contract data");
                    Object.keys(req.body.agreementloan).forEach(function (key) {
                        // winlog.info('Key : ' + key + ', Value : ' + req.body.lmsloan[key]);
                        //  winlog.info(JSON.stringify(attributeData)+ "::legth   :: "+attributeData.length)
                        for (var c = 0; c < attributeData.length; c++) {
                            // winlog.info(JSON.stringify(attributeData[c]) + "::::::::")
                            if (attributeData[c].attributeName == key) {
                                count2++;
                                winlog.info(key + "  ::contarct:key");
                                winlog.info(attributeData[c].attributeStandardName + " :contarct:value");
                                contractData[attributeData[c].attributeStandardName] = req.body.agreementloan[key];

                                if (count2 == count) {
                                   event4.emit('updateContract');
                                    winlog.info("final data::::::::" + JSON.stringify(contractData))
                                }

                            }
                        }


                    });
                    //                    winlog.info(JSON.stringify(lmsData) + " :after update::");

                });


            }); //end of event3
            event4.on('updateContract', function () {

                db.collection('contract').updateOne({ loanid: contractData['loanid'], poolid: req.body.poolid }, { $set: contractData }, function (err, result) {
                    if (err) throw err;
                    winlog.info("1 contract document updated");
                    
                        res.send(resjson);
                });
            });


        });//end of db
    }
}
module.exports = loans;