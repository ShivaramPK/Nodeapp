const ShortUniqueId = require('short-unique-id');
var MongoClient = require('mongodb').MongoClient;
var EventEmitter = require('events').EventEmitter;
const winlog = require("../log/winstonlog");


var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
//var url = "mongodb://localhost:27017/IntainMarkets";

//Instantiate
const uid = new ShortUniqueId({ length: 10 });

var attributes = {

    addAttribute: function (req, res, next) {


        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            const db = client.db("IntainMarkets");
            winlog.info('CONNECTED');
            var AttrID = uid();
            //var loansarr = req.body.loans.length;
            var arr = [];

            winlog.info(AttrID);

            var resjson = {
                "isSuccess": true,
                "message": "Attribute created successfully"
            }



            var json = {
                "attributeId": AttrID,
                "attributeName": req.body.attributeName,
                "attributeStandardName": req.body.attributeStandardName,
                "attributeCategory": req.body.attributeCategory,
                "attributeDisplay": req.body.attributeDisplay,
                "attributePoolName": req.body.attributePoolName

            }

            arr.push(json);

            db.collection('Attribute_details').insert(arr, (err, result) => {

                if (err) return winlog.info(err)
                winlog.info('saved to database')
                res.send(resjson);

            });

        });
    },
    getAllAttributes: function (req, res, next) {


        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            const db = client.db("IntainMarkets");
            winlog.info('CONNECTED');
            var noofprocessor;

            db.collection('Attribute_details').find().toArray(function (err, result) {
                winlog.info("Lengthof result" + result.length);

                res.send(result);
            })

        });
    },
    getAttributesByPoolId: function (req, res, next) {

        var getAttribueEmit = new EventEmitter();
        var count = 0;
        var resp = [];
        var Attributes = '';
        var allAttr = '';
        var finalRes = [];
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            const db = client.db("IntainMarkets");
            winlog.info('CONNECTED');
            winlog.info(req.query.poolname + "    :::req.query.poolname");
            db.collection('Attribute_details').find({ attributePoolName: req.query.poolname }).toArray(function (err, result) {
                winlog.info("Lengthof result" + result.length);

                allAttr = result;
                getAttribueEmit.emit('getAttributes', allAttr);
            });

            getAttribueEmit.on('getAttributes', function (aid) {
                db.collection('pool_detail').find({ poolid: req.query.poolid }).toArray(function (err, result) {
                    winlog.info("Lengthof result" + result.length);
                    if (result.length > 0) {
                        winlog.info('json' + JSON.stringify(result[0]));
                        Attributes = result[0].attributes.split('#');
                        winlog.info(Attributes.length + "::number of attributes : " + Attributes);

                        for (var c = 0; c < aid.length; c++) {
                            winlog.info(aid[c]);

                            if (Attributes.indexOf(aid[c].attributeId) == -1) {
                                aid[c]["matched"] = false;
                            } else {
                                aid[c]["matched"] = true;
                            }
                            // var js = {
                            //     "data": aid[c],
                            //     "matched": Attributes.indexOf(aid[c].attributeId)
                            // }
                            // finalRes.push(js);
                            count++;
                            if (count == aid.length) {
                                res.send(aid);
                            }
                            // getAttribueEmit.emit('getAttributes', Attributes[c]);
                        }

                    } else {
                        var json = {
                            "isSuccess": false,
                            "message": "No Pool with poolid " + req.query.poolid
                        }

                        res.send(json);
                    }


                }); // end of db pool_details
            }); // end ofemiter
            // getAttribueEmit.on('getAttributes', function (aid) {

            //     db.collection('Attribute_details').find({ attributeId: aid }).toArray(function (err, result) {
            //         winlog.info('--------------------------------------' +aid);
            //         count++;
            //         if (result.length > 0) {
            //             resp.push(result[0]);
            //         }
            //         if (count == Attributes.length) {
            //             res.send(resp);
            //         }

            //     });


            // });// end og get attributes


        });  // end of mogoclient
    },

    getAttributeDetailsByPoolId: function (req, res, next) {


        var findAttributes = new EventEmitter();
        var finalArr = [];
        var b = 0;

        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            const db = client.db("IntainMarkets");
            winlog.info('CONNECTED');

            db.collection('pool_detail').find({ poolid: req.query.poolid }).toArray(function (err, result) {
                winlog.info("Lengthof result" + result.length);
                if (result.length > 0) {


                    var attList = result[0].attributes.split('#');
                    // res.send(result);

                    if (attList.length < 2) {
                        var json = {
                            "isSuccess": false,
                            "message": "No Fields found for the poolid " + req.query.poolid
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
                        "message": "No Pool with poolid " + req.query.poolid
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

                        finalArr.push(result);
                        winlog.info(JSON.stringify(finalArr) + "::b");

                    }
                    b++;
                    if (b == size) {
                        res.send(finalArr);
                    }

                });

            }); //end of find attributes emit


        }); // end of mongo connection 

    },

    getAttributesByPoolName: function (req, res, next) {
        if (!req.query.poolname) {
            res.status(400).send({ "message": "Missing Arguments!" })
        }
        else {

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                const db = client.db("IntainMarkets");
                console.log('CONNECTED');
                var noofprocessor;

                db.collection('Attribute_details').find({ attributePoolName: req.query.poolname }).toArray(function (err, result) {
                    console.log("Lengthof result" + result.length);

                    res.send(result);
                })

            });

        }
    }
}

module.exports = attributes;