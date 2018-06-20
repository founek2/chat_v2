var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var schemaGroup = new mongoose.Schema({name: 'string', timeStamp: 'date', messages: [], users: []});
//rooms: [{room_id: "sdasdas"}] pro type user se bere name u user.rooms
var schemaUsers = new mongoose.Schema({
    socket_id: {type: {}},
    userName: {type: String, unique: true, required: true},
    passwd: {type: String, required: true},
    rooms: {type: []}
});

var Group = mongoose.model('group', schemaGroup);
var User = mongoose.model('users', schemaUsers);

function Database() {

}

Database.getOnlineUsers = function (socketId) {
    return User.find({$and: [{socket_id: {$exists: true}}, {"socket_id": {$ne: {[socketId]: socketId}}}]}).select("-_id userName").exec();
};

Database.getUserByUserName = function (userName) {
    return User.findOne({userName: userName}).then(function (user, err) {
        if (err) console.log(err);
        return user;
    }).catch(function (err) {
        console.log("getUserByUserName> ", err)
    });

};
Database.getUserById = function (userId) {
    return User.findById(userId).exec();

};
Database.getUserBySocketId = function (socketId) {
    return User.findOne({socket_id: socketId}).exec();
};
Database.getMessageArchive = function (limit, room) {
    return Group.findOne({name: room}).then(function (archive) {
        //User.find( { $or:[ {'_id':objId}, {'name':param}, {'nickname':param} ]},
        return archive.messages.slice(archive.messages.length - limit, archive.messages.length);
    });
};

Database.createUser = function (userName, passwd) {
    return User.find({userName: userName}).count().exec().then(function (count) {

        if (count === 0) {
            new User({userName: userName, passwd: autentizacion.hash(passwd)}).save();
            return true;
        } else {
            return false;
        }
    }).catch(function (err) {
        console.log(err)
    })
};
Database.createGlobalRoom = function () {
    return Database.getGlobalRoom().then(function (room) {
        if (room === null) {
            return new Group({name: "global"}).save(function (room) {
                return "Global room vytvořena";
            })
        } else {
            return "Global room již existuje";
        }
    }).catch(function (err) {
        console.log(err)
    })
}
Database.getGlobalRoom = function () {
    return Group.findOne({name: "global"}).then(function (room) {
        return room;
    }).catch(function (err) {
        console.log(err)
    })
}
Database.saveMessage = function (socketID, text, now, room) {
    return Database.getUserBySocketId(socketID).then(function (user) {
        return Database.getGroup(room).then(function (room) {
            room.messages.push({userName: user.userName, timestamp: now, text: text});
            return room.save(function (err, updatedRoom) {
                if (err) return console.log(err);
                return true
            });
        })

    }).catch(function (err) {
        console.log('error saveMessage:', err);
        return false;
    });

};
Database.getUserRooms = function (userName) {
    return Database.getUserByUserName(userName).then(function (user) {
        let promises = [];
        user.rooms.forEach(function (room) {
            promises.push(Database.getGroup(room.groupId));
        })
        return Promise.all(promises).then(function (value) {
            return user.rooms.map(function (room, i) {
                return {groupId: room.groupId, name: room.name, messages: value[i].messages};
            });
        })

    }).catch(function (err) {
        console.log(err)
    })
}
Database.createGroup = function (name, users) {
    return new Group({name: name, timeStamp: new Date(), users: users, messages: []}).save(function (savedGroup, err) {
        if (err) return console.log(err);
        return savedGroup;
    });
}
Database.addUserToRoom = function (userName, type, targetUserName, result) {
    if (type === "user") {
        return Database.getUserByUserName(userName).then(function (user) {
            return Database.getUserByUserName(targetUserName).then(function (targetUser) {
                return Database.createGroup("xxx", [user.userName, targetUser.userName]).then(function (group) {
                    user.rooms.push({
                        type: type,
                        targetUserName: targetUserName,
                        name: targetUserName,
                        created: new Date(),
                        groupId: group._id
                    });
                    user.markModified("rooms");
                    user.save();

                    targetUser.rooms.push({
                        type: type,
                        targetUserName: userName,
                        name: userName,
                        created: new Date(),
                        groupId: group._id
                    })
                    targetUser.markModified("rooms");
                    targetUser.save();

                    return {
                        messages: {groupId: group._id, name: targetUserName, messages: [], result: result},
                        group: {groupId: group._id, nameTarget: targetUserName, nameSource: userName},
                        targetSocketId: targetUser.socket_id,
                        sourceSocketId: user.socket_id
                    };
                })
                /*
                user.rooms.push({type: type, targetUserName: targetUserName, messages: [], name: targetUserName, created: new Date()});
                user.markModified("rooms");

                targetUser.rooms.push({type: type, targetUserName: userName, messages: [], name: userName})
                targetUser.markModified("rooms");
                targetUser.save();
                return user.save().then(function (updatedUser, err) {
                    return {messages: updatedUser.rooms[updatedUser.rooms.length-1].messages, name: targetUserName};
                })*/
            })
        })
    }
}
Database.createGroupAndAddUsers = function (name, users) {
    let promises = [];

    users.forEach(function (user) {
        promises.push(Database.getUserByUserName(user.userName).then(function (user) {
            if(user === null) return {error: true}
            return user;
        }))
    })

    return Promise.all(promises).then(function (values) {
        let error = false;
        let socket_id = [];
        values.forEach(function (val) {
            if(val.error) error = val.error
            console.log(val.socket_id)
            // socket_id.concat(val.socket_id);
            Object.keys(val.socket_id).forEach(function (id) {
                console.log("id",id)
                socket_id.push(id)
            })

        })
        if(!error){
            return new Group({name: name, timeStamp: new Date(), users: users.map(function (user) {return user.userName }), messages: []}).save().then(function (savedGroup, err) {
                if (err) console.log("err",err);
                users.forEach(function (user) {
                    Database.addGroupToUser(name, user.userName, savedGroup._id);
                })

                return {arrayId: socket_id, groupId: savedGroup._id};
            }).catch(function (err) {
                console.log("error createGroup> ", err)
            });
        }
    }).catch(function (err) {
        console.log(err)
    })

}
Database.addGroupToUser = function (groupName, username, groupId) {
    return User.update({userName: username}, {$push: {groupId: groupId, rooms: {type: "group", name: groupName, created: new Date(), groupId: groupId}}}).then(function (updatedUser) {
        return updatedUser;
    });
}
Database.getGroup = function (groupId) {
    return Group.findById(groupId).select({messages: {$slice: -35}}).then(function (group) {
        if (group) {
            return group;
        }
    })
}
Database.getUserRoomMessages = function (userName, targetUserName) {
    return Database.getUserByUserName(userName).then(function (user) {
        let result = false;
        for (var i = 0; i < user.rooms.length; i++) {
            if (user.rooms[i].targetUserName === targetUserName) {
                result = true;
                var groupId = user.rooms[i].groupId;
                return Database.getGroup(groupId).then(function (group) {
                    return {messages: group.messages, name: user.rooms[i].name, groupId: groupId, result: result};
                })
                break
            }
        }
        if (!result) {
            return Database.addUserToRoom(userName, "user", targetUserName, result)
        }
    })
}
Database.getArrayOfSocketId = function (arrayUserNames, noUser) {
    let pr = new Promise(function (resolve, reject) {
        let promises = [];
        for (var i = 0; i < arrayUserNames.length; i++) {
            if (arrayUserNames[i] !== noUser) {
                console.log("toto> ",arrayUserNames[i])
                promises.push(Database.getUserByUserName(arrayUserNames[i]).then(function (user) {
                    // console.log(user.socket_id)
                    if (user.socket_id) {
                        var socket = Object.keys(user.socket_id);
                        if (socket.length > 1) {
                            socket.forEach(function (id) {
                                return id;
                            })
                        } else {
                            return Object.keys(user.socket_id)[0];
                        }
                    } else {
                        return
                    }
                }))
            }
        }
        //co se dava do users v type user a group!
        Promise.all(promises).then(function (values) {
            resolve(values)
        }).then(function (err) {
            console.log("getArrayOfSockedId> ", err)
        })
    });
    return pr;
}
Database.sendUserMessage = function (userName, groupId, text, date) {
    /* return Database.getUserByUserName(userName).then(function (user) {
         user.rooms.forEach(function (item, i) {
             if (item.name === roomName) {
                 user.rooms[i].messages.push({text: text, created: new Date()});
                 user.markModified("rooms");
                 user.save();
                 return user.rooms[i].target
             }
         })
     })*/
    if (groupId === "global") {
       return Database.saveGlobalMessage(userName, text, date)
    } else {
        return Database.getGroup(groupId).then(function (group) {
            group.messages.push({text: text, created: date, userName: userName})
            group.markModified("messages");
            group.save();
            return Database.getArrayOfSocketId(group.users, userName);
        }).catch(function (err) {
            console.log("get> ",err)
        })
    }
}
Database.updateUserBySocketId = function (socketId, field, value) {
    return Database.getUserBySocketId(socketId).then(function (user) {
        user[field] = value;
        user.save();
        return user;
    }).catch(function (err) {
        console.log('error updateUserBySocketId:', err);
        return false;
    });
};
Database.saveGlobalMessage = function (userName, text, date) {
   return Database.getGlobalRoom().then(function (room) {
        room.messages.push({text: text, created: date, userName: userName})
        room.markModified("messages");
        room.save();
    })
}
Database.updateUserByUserName = function (userName, field, value) {
    return Database.getUserByUserName(userName).then(function (user) {
        user[field] = value;
        user.save();
        return user;
    }).catch(function (err) {
        console.log('error updateUserByName:', err);
        return false;
    });
};
Database.addSocketIdToUser = function (userName, socketId) {
    return Database.getUserByUserName(userName).then(function (user) {
        //  console.log("nalezeny  " + user)
        if (!user.socket_id) {
            user.socket_id = {};
        }
        user.socket_id[socketId] = socketId;
        user.markModified("socket_id");
        return user.save().then(function (updatedUser) {
            //         console.log(updatedUser)
            return updatedUser;
        })


    }).catch(function (err) {
        console.log('error updateUserByName:', err);
    });
}
Database.removeSocketIdToUser = function (userName, socketId) {
    return Database.getUserByUserName(userName).then(function (user) {
        delete user.socket_id[socketId];
        if (Object.keys(user.socket_id).length === 0) user.socket_id = undefined;
        user.markModified("socket_id");
        user.save();
        return user;
    }).catch(function (err) {
        console.log('error updateUserByName:', err);
        return false;
    });
}
Database.removeUserByUserName = function (userName) {
    User.findOneAndRemove({userName: userName}).exec(function (err, user) {
        if (err) console.log(err);
    });
}
Database.checkUser = function (userName, password) {
    return User.findOne({userName: userName, passwd: autentizacion.hash(password)}).then(function (user) {
        return user;
    }).catch(function (err) {
        console.log("checkUser error> " + err)
        return false;
    });
};

Database.resetSocketId = function () {
    User.find({}).then(function (users) {
        users.forEach(function (user) {
            user["socket_id"] = undefined;
            user.markModified("socket_id");
            user.save()
        })
    })
};
Database.connect = function () {
    var options = {
        db: {native_parser: true},
        server: {poolSize: 5},
        user: 'chat',
        pass: '5236521ly474'
    }

 //  return mongoose.connect('mongodb://localhost:27017/chat', options).then(function () {
	return mongoose.connect('mongodb://localhost:27017/chat').then(function () {
        console.log("Successfully connected to mongoDB");
    }).catch(function (err) {
        console.log("Error while connect to mongoDB");
    });
};


var autentizacion = {
    hash: function (passwd) {
        var hash = 5381;
        for (i = 0; i < passwd.length; i++) {
            char = passwd.charCodeAt(i);
            hash = ((hash << 5) + hash) + char;
            /* hash * 33 + c */
        }
        return hash;
    }
};

module.exports = Database;