module.exports = function (io) {
    var app = require('express'), socketioJwt = require("socketio-jwt");
    var router = app.Router();
    var database = require("../bin/database/database");
    io.use(socketioJwt.authorize({
        secret: process.env.JWT_SECRET_KEY,
        handshake: true
    }));

    io.on('connection', function (socket) {
        var userName = socket.decoded_token.userName;
        console.log('prihlasen! ', userName);
        //informuje ostatní
        socket.broadcast.emit("onlineUser", {room: "all", type: "add", userName: userName});
        var promises = [];

        promises.push(database.addSocketIdToUser(userName, socket.id).then(function () {
            return;
        }));
        promises.push(database.getOnlineUsers(socket.id))
        promises.push(database.getUserRooms(userName));
        promises.push(database.getGlobalRoom());
        Promise.all(promises).then(function (data) {
            if (data[1].length > 0 || data[2].length > 0) {
                data[2].push({groupId: data[3].name, name: data[3].name, messages: data[3].messages});
                socket.emit("initData", {userNames: data[1], rooms: data[2]})
            }
        }).catch(function (err) {
            console.log("initData> ",err)
        })
        socket.on('getUserRoomMessage', function (msg) {
            database.getUserRoomMessages(userName, msg.targetUserName).then(function (room) {

                //    socket.join(room.groupId);

                if (room.result) {
                    socket.emit("gotUserRoomMessage", room)
                } else {
                    if (Object.keys(room.sourceSocketId).length === 1) {
                        if (Object.keys(room.sourceSocketId)[0] === socket.id) {
                            socket.emit("onlineRoom", {
                                groupId: room.group.groupId,
                                name: room.group.nameTarget
                            });
                        } else {
                            socket.to(Object.keys(room.sourceSocketId)[0]).emit("onlineRoom", {
                                groupId: room.group.groupId,
                                name: room.group.nameTarget
                            });
                        }
                    } else {
                        room.sourceSocketId.forEach(function (id) {
                            if (id === socket.id) {
                                socket.emit("onlineRoom", {
                                    groupId: room.group.groupId,
                                    name: room.group.nameTarget
                                });
                            } else {
                                socket.to(id).emit("onlineRoom", {
                                    groupId: room.group.groupId,
                                    name: room.group.nameTarget
                                });
                            }
                        })
                    }

                    socket.emit("gotUserRoomMessage", room.messages)
                    // socket.emit("onlineRoom", room.group)
                    if (Object.keys(room.targetSocketId).length === 1) {
                        socket.to(Object.keys(room.targetSocketId)[0]).emit("onlineRoom", {
                            groupId: room.group.groupId,
                            name: room.group.nameSource
                        });
                    } else {
                        room.targetSocketId.forEach(function (id) {
                            socket.to(id).emit("onlineRoom", {
                                groupId: room.group.groupId,
                                name: room.group.nameSource
                            });
                        })
                    }
                }

            }).catch(function (err) {
                console.log("getMessages> ",err)
            });
        });
        socket.on('getRoomMessage', function (data) {
            let date = new Date();
            database.getGroup(data.groupId).then(function (group) {
                socket.emit("gotUserRoomMessage", {messages: group.messages, groupId: group._id})
            })
        });

        socket.on('sendUserMessage', function (msg) {
            let date = new Date();
            if(msg.groupId === "global"){
                socket.broadcast.emit("message", {
                    groupId: msg.groupId,
                    text: msg.text,
                    userName: userName,
                    created: date
                });
                database.sendUserMessage(userName, msg.groupId, msg.text, date)
            }else{
                console.log(userName)
                database.sendUserMessage(userName, msg.groupId, msg.text, date).then(function (arrayId) {
                    arrayId.forEach(function (id) {
                        socket.to(id).emit("message", {
                            groupId: msg.groupId,
                            text: msg.text,
                            userName: userName,
                            created: date
                        })
                    })
                }).catch(function (err) {
                    console.log("sendUserMessage> ",err)
                })
            }

        });

        socket.on("createGroup", function (msg) {
            if(msg.name){
                database.createGroupAndAddUsers(msg.name, msg.users).then(function (data) {
                    console.log("data> ", data)
                    data.arrayId.forEach(function (id) {
                        if (id === socket.id) {
                            socket.emit("onlineRoom", {
                                groupId: data.groupId,
                                name: msg.name
                            });
                        } else {
                            socket.to(id).emit("onlineRoom", {
                                groupId: data.groupId,
                                name: msg.name,
                            });
                        }
                    })
                }).catch(function (err) {
                    console.log("createGroup> ", err)
                })
            }
        })

        socket.on('disconnect', function () {
            console.log("odhlasen " + userName)
            socket.broadcast.emit("onlineUser", {room: "all", type: "remove", userName: userName});
            database.removeSocketIdToUser(userName, socket.id).then(function (user) {

            });
            /*    database.getUserByUserName(userName).then(function (user) {
                   // console.log(user.socket_id)
                    user.rooms.forEach(function (room) {
                        socket.join(room);
                        socket.broadcast.to(msg).emit('offlineUser', room + "," + user.userName);
                        database.getMessageArchive(10, room).then(function (archive) {
                            socket.emit("roomMessages", room + "," + archive);
                        })
                    })

                });*/
        });
    });


    return router;
}