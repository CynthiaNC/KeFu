var redisSvc = {};
var redis = require("redis");

const DB_NUMBER = 7;

if(!client){
    var client = redis.createClient();
}

/**
 * 作者：袁俊亮技术博客
    链接：https://www.jianshu.com/p/8f01fa5fe288
    來源：简书
    简书著作权归作者所有，任何形式的转载都请联系作者获得授权并注明出处。
 */
client.once("connect", function() {
    // 假设我们需要选择 redis 的 db，因为实际上我们不会去污染默认的 db 0
    client.select(DB_NUMBER, function(err) {
        if(err) process.exit(4);
    });
});



client.on("error", function (err) {
    console.log("Redis Error :" , err);
    client = null;
});

client.on('connect', function(){
    console.log('Redis连接成功.');
});

/**
 * 添加string类型的数据
 * @param key 键
 * @params value 值
 * @params expire (过期时间,单位秒;可为空，为空表示不过期)
 * @param callBack(err,result)
 */
redisSvc.set = function(key, value, expire, callback){

    client.set(key, value, function(err, result){

        if (err) {
            console.log(err);
            callback(err,null);
            return;
        }

        if (!isNaN(expire) && expire > 0) {
            client.expire(key, parseInt(expire));
        }

        callback(null,result)
    })
};

/**
 * 查询string类型的数据
 * @param key 键
 * @param callBack(err,result)
 */
redisSvc.get = function(key, callback){

    client.get(key, function(err,result){

        if (err) {
            console.log(err);
            callback(err,null);
            return;
        }

        callback(null,result);
    });
};

/*
*删除String 类型的key
 * @param key 键
 * @param callBack(err,result)
*/
redisSvc.del = function(key, callback){

    client.del(key, function(err,result){

        if (err) {
            console.log(err);
            callback(err,null);
            return;
        }

        callback(null,result);
    });
};


module.exports = redisSvc;