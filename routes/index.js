var express = require('express');
var router = express.Router();
var AppConfig = require('../config');
var qiniu = require('qiniu');

router.get('/', function(req, res, next) {
  res.render('./server/index');
});

router.get('/admin', function(req, res, next) {
    console.log('------- 客服登录 -------')
    console.log('kefuId:' +req.query.kefuId)
    res.render('./server/index');
});

router.get('/client', function(req, res, next) {
    console.log('------- 用户登录 -------')
    console.log('kefuId:' +req.query.kefuId)
    console.log('openId:' +req.query.openId)
    res.render('./client/index');
});

router.get('/admin/users', function(req, res, next) {
    res.render('./server/users');
});

router.get('/admin/setup', function(req, res, next) {
    res.render('./server/setup');
});

router.get('/uptoken', function(req, res, next) {
    var mac = new qiniu.auth.digest.Mac(AppConfig.QINIU.accessKey, AppConfig.QINIU.secretKey);
    var options = {
        scope: 'kefu',
        expires: 7200,
        mimeLimit:"image/*"
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken=putPolicy.uploadToken(mac);
    res.send({"uptoken":uploadToken});
});

module.exports = router;
