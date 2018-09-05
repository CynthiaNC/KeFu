var express = require('express');
var router = express.Router();
var msgModel = require('../model/message');

router.get('/', function(req, res, next) {
    var page = req.query.page || 1;
    var size = req.query.size || 10;
    var uid = req.query.uid;
    var kefuId = req.query.kefuId;

    console.log('--- req kefuId: ' + kefuId)

    if(!uid || !kefuId){
        return res.send({code:500,msg:"参数不全"});
    }

    msgModel.query(page,size,uid,kefuId,function (err,data) {

        console.log('--- msgModel.query kefuId: ' + kefuId)
        
        if(err){
            console.error(err);
            return res.send({code:400,msg:"系统错误"});
        }
        return res.send({code:200,msg:"获取成功",data:data});
    });
});

module.exports = router;