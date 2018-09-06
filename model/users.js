var mongoose = require('../utils/mongoose').mongoose;
var crypto = require('crypto');

var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    username : { type:String },
    password : { type:String },
    kefu_id : { type:String },
    time : { type:Date, default:Date.now }
});

var UsersModel = mongoose.model("users", UsersSchema);

function add(username, password, kefuId, callback) {
    var info = {
        "username" : username,
        "password" : password,
        "kefu_id": kefuId,
    };
    var usersModel = new UsersModel(info);
    usersModel.save(function(err, res){
        return callback(err,res);
    });
}

function query(page,size,kefuId,callback) {
    var query = UsersModel.find({});
    var orCondition = [], andCondition = [];

    andCondition.push({"kefu_id":kefuId});

    var skip = (page - 1) * size;
    query.and(andCondition).or(orCondition).skip(skip).limit(size).sort({"time":-1}).exec(callback);
}

function login(username,password,callback) {
    var md5 = crypto.createHash('md5');
    password = md5.update(password).digest('hex');
    var condition = {'username' : username,'password':password};

    UsersModel.findOne(condition, function(err, res){
        var _err = null;
        if (err) {
            _err = err;
        }
        if(!res){
            _err = '用户名密码不正确';
        }
        return callback(_err,res);
    })
}

function reset_psw(username,psw_old,psw_new,callback) {
    psw_old = crypto.createHash('md5').update(psw_old).digest('hex');
    UsersModel.find({username:username,password:psw_old},function (err,info) {
        if (err) {
            return callback(err,null);
        }

        if(!info || info.length == 0){
            return callback('原密码不正确',null);
        }
        psw_new = crypto.createHash('md5').update(psw_new).digest('hex');
        UsersModel.findOneAndUpdate({username:username,password:psw_old}, {password:psw_new}, callback);
    });
}

exports.login = login;
exports.reset_psw = reset_psw;