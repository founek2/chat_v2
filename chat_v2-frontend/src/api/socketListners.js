const listenSocket = (socket, self) => {
    socket.on("onlineUser", (data) => {
        let array = self.state.onlineUsers;
        if (data.type === "add") {
            if (data.room === "all") {
                if (array.indexOf({userName: data.userName}) === -1) {
                    array.push({userName: data.userName});
                    self.setState({
                        onlineUsers: array,
                    })
                }

            }
        } else if (data.type === "remove") {
            let index = -1;
            array.forEach((item, i) => {
                if (item.userName === data.userName) index = i;
            });
            if (index > -1) {
                array.splice(index, 1);
                self.setState({
                    onlineUsers: array,
                })
            }
        }

    });

    socket.on("initData", (data) => {
        console.log("initdata",data)
        let array = self.state.onlineUsers;
        data.userNames.forEach((user) => {
            if (user.userName !== self.props.userName) array.push({userName: user.userName});
        })

        let array2 = self.state.onlineRooms;
        let arrayMessages = self.state.messages;

        data.rooms.forEach((room) => {
            array2.push({name: room.name, groupId: room.groupId});
            arrayMessages[room.groupId] = room.messages
        })
        self.setState({
            onlineRooms: array2,
            onlineUsers: array,
            messages: arrayMessages,
            groupId: "global",
        })
    });
    socket.on("unauthorized", function (error) {
        console.log(error)
        if (error.data.type === "UnauthorizedError" || error.data.code === "invalid_token") {
            // redirect user to lo  gin page perhaps?
            console.log("User's token has expired");
        }
    });
    socket.on("gotUserRoomMessage", function (room) {
        let array = self.state.messages;
        if(!array[room.groupId]){
            array.push({[room.groupId]: room.messages});
            self.setState({
                messages: array,
            })
        }

        if (room.name) {
            self.setState({
                roomName: room.name,
                groupId: room.groupId
            })
        } else {
            self.setState({
                roomName: "Nezadané jmnéno",
                groupId: room.groupId
            })
        }
    });
    socket.on("message", function (message) {
        let array = self.state.messages;
        if (!array[message.groupId]) array[message.groupId] = [];
        array[message.groupId].push(message);
        self.setState({
            message: array,
        })
    });
    socket.on("onlineRoom", function (room) {
        let array = self.state.onlineRooms;
        let arrayM = self.state.messages;
        array.push({name: room.name, groupId: room.groupId});
        arrayM[room.groupId] =[];
        self.setState({
            onlineRooms: array,
            messages: arrayM,
        })
    })

}

export default listenSocket;