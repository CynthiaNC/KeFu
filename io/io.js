/*
*介绍：socket.io 功能封装
*作者：TaiGuangYin
*时间：2017-09-09
* */
var redis = require('../utils/redis');
var msgType = require('./messageTpye');
var ioSvc = require('./ioHelper').ioSvc;
var AppConfig = require('../config');
var Common = require('../utils/common');
var msgModel = require('../model/message');

//服务端连接
function ioServer(io) {

    var _self = this;
    ioSvc.setInstance(io);

    var __uuids = [];

    //初始化连接人数
    // redis.set('online_count',0,null,function (err,ret) {
    //     if(err){
    //         console.error(err);
    //     }
    // });

    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    io.on('connection', function (socket) {
        console.log('SocketIO有新的连接!');

        //用户与Socket进行绑定
        socket.on('login', function (msg) {
            var uid = msg.uid;
            var kefuId = msg.kefuId;
            console.log(uid+'登录成功, 连接客服'+kefuId);
            let servicerId = AppConfig.KEFUUUID + '-' + kefuId;

            let socketSignature = msg.socketSignature;

            if (uid.indexOf(AppConfig.KEFUUUID) !== -1) {
                //初始化连接人数
                console.log(uid+': 初始化连接人数');
                redis.set('online_count_' + servicerId,0,null,function (err,ret) {
                    if(err){
                        console.error(err);
                    }
                });

                redis.get('user-uuids_' + servicerId,function (err,uuids) {
                    console.log('err, uuids')
                    console.log(err)
                    console.log(uuids)
                    if(err){
                        console.error(err);
                    }
                    if(uuids){
                        uuids =JSON.parse(uuids);
                    }else{
                        uuids = [];
                    
                    }
                    uuids.map (item => {
                        if(__uuids.indexOf(item.uid) == -1){
                            __uuids.push(item.uid);
                        }
                    })
                });

            }
            
            _self.updateOnlieCount(true, servicerId);


            //通知用户上线
            if(uid.indexOf(AppConfig.KEFUUUID) == -1){ // 客服id的标识

                console.log('servicerId')
                console.log(servicerId)
                redis.get(servicerId ,function (err,sid) {
                    if(err){
                        console.error(err);
                    }

                    console.log('sid')
                    console.log(sid)
                    
                    if(sid){
                        redis.get('online_count_' + servicerId,function (err,val) {
                            if(err){
                                console.error(err);
                            }
                            if(!val){
                                val = 0;
                            }
                            if(typeof val == 'string'){
                                val = parseInt(val);
                            }

                            //var ip = socket.request.connection.remoteAddress;
                            //此处获取IP可能会有延迟，建议改成自己的IP库
                            Common.getIpLocation(msg.ip,function (err,location) {
                                if(err){
                                    location = '';
                                }
                                var info = {
                                    "uid":uid,
                                    "kefuId":kefuId,
                                    "name":location + ' 客户',
                                    "type":'online'
                                };

                                redis.get('user-uuids_' + servicerId,function (err,uuids) {
                                    if(err){
                                        console.error(err);
                                    }
                                    if(uuids){
                                        uuids =JSON.parse(uuids);
                                    }else{
                                        uuids = [];
                                    }

                                    if(__uuids.indexOf(uid) == -1){
                                        __uuids.push(uid);
                                        var d_user = {"uid":uid, "kefuId": kefuId,"name":location + ' 客户'};
                                        uuids.push(d_user);
                                        uuids = JSON.stringify(uuids);
                                        redis.set('user-uuids_' + servicerId, uuids,null,function (err,ret) {

                                            console.log('set user-uuids_')
                                            if(err){
                                                console.error(err);
                                            }
                                        });
                                    }
                                });

                                io.to(sid).emit('update-users',info);
                            });

                        });
                    }
                });
            }

            redis.set(uid,socket.id,null,function (err,ret) {
                if(err){
                    console.error(err);
                }
            });

            redis.set(socket.id,uid,null,function (err,ret) {
                if(err){
                    console.error(err);
                }
            });

        });

        //断开事件
        socket.on('disconnect', function() {
            
            redis.get(socket.id,function (err,val) {
                
                // let tmpArr = val.split('----');
                // let servicerId = tmpArr[0];
                let servicerId = val;
                _self.updateOnlieCount(false, servicerId);
                
                console.log(val + "与服务器断开");
                if(err){
                    console.error(err);
                }
                redis.del(socket.id,function (err,ret) {
                    if(err){
                        console.error(err);
                    }
                });

                redis.del(val,function (err,ret) {
                    if(err){
                        console.error(err);
                    }
                });

                //通知用户下线
                if (val) {
                    if(val.indexOf( AppConfig.KEFUUUID) == -1){
                        redis.get(servicerId,function (err,sid) {
                            if(err){
                                console.error(err);
                            }
                            if(sid){
                                var info = {
                                    "uid":val,
                                    "name":'客户下线',
                                    "type":'offline'
                                };
                                io.to(sid).emit('update-users',info);
                            }
                        });
    
                        redis.get('user-uuids_' + servicerId,function (err,uuids) {
                            if(err){
                                console.error(err);
                            }
                            if(uuids){
                                uuids =JSON.parse(uuids);
                            }else{
                                uuids = [];
                            }
                            val = parseInt(val);
                            var idx = __uuids.indexOf(val);
                            if( idx != -1){
                                __uuids.remove(val);
                                //uuids.splice(idx,1);
                                var tmp = [];
                                uuids.forEach(function (user) {
                                    if(user.uid != val){
                                        tmp.push(user);
                                    }
                                });
                                uuids = JSON.stringify(tmp);
                                redis.set('user-uuids_' + servicerId,uuids,null,function (err,ret) {
                                    if(err){
                                        console.error(err);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });

        //重连事件
        socket.on('reconnect', function() {
            console.log("重新连接到服务器");
        });

        //监听客户端发送的信息,实现消息转发到各个其他客户端
        socket.on('message',function(msg){
            msgModel.add(msg.from_uid,msg.uid,msg.kefuId,msg.content,msg.chat_type,msg.image,function (err) {
               if(err){
                   console.error(err);
               }
            });
            if(msg.type == msgType.messageType.public){
                var mg = {
                    "uid" : msg.from_uid  ,
                    "content": msg.content,
                    "kefuId": msg.kefuId,
                    "chat_type" :  msg.chat_type?msg.chat_type:'text',
                    "image":msg.image
                };
                socket.broadcast.emit("message",mg);
            }else if(msg.type == msgType.messageType.private){
                var uid = msg.uid;
                redis.get(uid,function (err,sid) {
                   if(err){
                       console.error(err);
                   }
                   if(sid){
                       //给指定的客户端发送消息
                       var mg = {
                         "uid" : msg.from_uid,
                         "content": msg.content,
                         "kefuId": msg.kefuId,
                         "chat_type" :  msg.chat_type?msg.chat_type:'text',
                         "image":msg.image
                       };
                       io.to(sid).emit('message',mg);
                   }
                });
            }

        });
    });

    this.updateOnlieCount = function (isConnect, servicerId) {
        //记录在线客户连接数
        redis.get('online_count_' + servicerId,function (err,val) {
            if(err){
                console.error(err);
            }
            if(!val){
                val = 0;
            }
            if(typeof val == 'string'){
                val = parseInt(val);
            }
            if(isConnect){
                val += 1;
            }else{
                val -= 1;
                if(val<=0){
                    val = 0;
                }
            }

            console.log('当前在线人数：'+val); // TODO: 有问题，只能显示当前客服的连接数量
            io.sockets.emit('update_online_count', { online_count: val });

            redis.set('online_count_' + servicerId,val,null,function (err,ret) {
                if(err){
                    console.error(err);
                }
            });
        });
    };

}


//模块导出
exports.ioServer = ioServer;