import React, {Component} from 'react'
import OnlineRooms from "../components/onlinerooms";
import OnlineUsers from "../components/onlineusers";
import Messages from "../components/messages";
import {SocketProvider} from 'socket.io-react';
import io from 'socket.io-client';
import listenSocket from "../api/socketListners";
import ModalDialog from "../components/modalDialog";

class LoggedContent extends Component {
    constructor(props) {
        super(props);

        const socket = io.connect('http://localhost:3000', {
            'query': 'token=' + sessionStorage.getItem('jwtToken')
        });
        this.state = {
            onlineUsers: [],
            onlineRooms: [],
            socket: socket,
            messages: {},
            roomName: "global",
            modalDialog: {isShowingModal: false},
        };
        listenSocket(socket, this);
    }

    componentWillUnmount() {
        this.state.socket.disconnect();
    }

    _setRoom = (roomName, groupId) => {
        this.setState({
            roomName: roomName,
            groupId: groupId,
        })
    }
    _addMessage = (text, created) => {
        //  console.log(this.state.messages)
        let messagesPushed = this.state.messages;
        messagesPushed[[this.state.groupId]].push({text: text, created: created, userName: this.props.userName});
        this.setState({
            messages: messagesPushed
        })
        //console.log(this.state.messages)
    };
    _showModal = (type) => {
        this.setState({
            modalDialog: {
                isShowing: true,
                type: type,
            }

        })
    }
    _handleClose = ()=> {
        this.setState({
            modalDialog: {isShowing: false}
        })
    };
    render() {
        const {onlineUsers, socket, roomName, messages, groupId, onlineRooms, modalDialog} = this.state;
        const {userName} = this.props;
        return (
            <SocketProvider socket={socket}>
                <div className="root">
                    <ModalDialog data={modalDialog} handleClose={this._handleClose} onlineUsers={onlineUsers} userName={userName}/>
                    <div className="container-fluid">
                        <div>
                            <div className="row">
                                <div style={{textAlign: "center"}}>
                                    Chatv2_frontend <span style={{textAlign: "right"}}> {userName}</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-xs-8 col-sm-9 col-md-9 col-lg-10">
                                    <Messages messages={messages} timeDelay={2511} roomName={roomName}
                                              groupId={groupId} addMessage={this._addMessage} userName={userName}/>
                                </div>

                                <div className="col-xs-4 col-sm-3 col-md-3 col-lg-2 ">
                                    <OnlineRooms onlineRooms={onlineRooms} userName={userName}
                                                 setRoom={this._setRoom} showModal={this._showModal}/>
                                    <OnlineUsers onlineUsers={onlineUsers} userName={userName}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SocketProvider>
        );
    }
}

export default LoggedContent;
