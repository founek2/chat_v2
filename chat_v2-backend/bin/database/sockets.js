/**
 * Created by martin on 1.1.17.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var database = require("./database.js");
function Sockets() {

}

Sockets.inRoom = function () {
    return io.sockets.adapter.rooms["room0"].sockets[socketId];
}

Sockets.logOut = function (socket) {
    database.updateUserBySocketId(socket.id, "socket_id", "0").then(function (result) {
        socket.broadcast.to(socket.room).emit('offline-user', result.name);
    }).catch(function (err) {
        // just need one of these
        console.log('error:', err);
    });
}

module.exports = Sockets;