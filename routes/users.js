var express = require('express');
var router = express.Router();
var redis = require('../utils/redis');
var usersModel = require('../model/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var page = req.query.page || 1;
    var size = req.query.size || 10;
    var uid = req.query.uid;
    var kefuId = req.query.kefuId;

    let servicerId = 'chat-kefu-admin-' + req.query.kefuId;

    // 从数据库里面获取用户信息

    // usersModel.query(page,size,kefuId,function (err,data) {
    //     if(err){
    //         console.error(err);
    //         return res.send({code:400,msg:"系统错误"});
    //     }
    //     return res.send({code:200,msg:"获取成功",data:data});
    // });

    redis.get('user-uuids_' + servicerId,function (err,uuids) {
        if(err){
            console.error(err);
            return res.send({code:400,msg:'获取失败'});
        }
        if(uuids){
            uuids =JSON.parse(uuids);
        }else{
            uuids = [];
        }

        return res.send({code:200,msg:'获取成功',data:uuids});
    });
});

module.exports = router;
