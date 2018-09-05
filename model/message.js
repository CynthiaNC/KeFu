var mongoose = require('../utils/mongoose').mongoose;

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    from_uid : { type:String ,index: true},
    to_uid : { type:String ,index: true},
    kefu_id : { type:String ,index: true},
    content : { type:String },
    chat_type : { type:String,default:'text'},
    image : { type:String,default:''},
    time : { type:Date, default:Date.now }
});

var MessageModel = mongoose.model("message", MessageSchema);

function add(from_uid,to_uid,kefu_id,content,chat_type,image,callback) {
    var info = {
        "from_uid" : from_uid,
        "to_uid" : to_uid,
        "kefu_id" : kefu_id,
        "content" : content,
        "chat_type" : chat_type,
        "image" : image,
    };
    var msgModel = new MessageModel(info);
    msgModel.save(function(err, res){
        return callback(err,res);
    });
}

function query(page,size,uid,kefuId,callback) {
    console.log('--- query kefuId: ' + kefuId + ' uid: ' + uid)
    var query = MessageModel.find({});
    var orCondition = [], andCondition = [];
    if(uid){
        orCondition.push({"from_uid":uid});
        orCondition.push({"to_uid":uid});
    }
    andCondition.push({"kefu_id":kefuId});

    var skip = (page - 1) * size;
    query.and(andCondition).or(orCondition).skip(skip).limit(size).sort({"time":-1}).exec(callback);
}


exports.add = add;
exports.query = query;