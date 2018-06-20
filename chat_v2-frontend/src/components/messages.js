import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {socketConnect} from 'socket.io-react';

class Messages extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        var elem = document.getElementById('messages');
        elem.scrollTop = elem.scrollHeight;
    }

    _sendMessage = (e) => {
        // Enter is pressed
        if (e.keyCode === 13) {
            e.preventDefault();
            const text = document.getElementById("input").value.trim();
            if (text !== "") {
                this.props.socket.emit("sendUserMessage", {groupId: this.props.groupId, text: text})
                this.props.addMessage(text, new Date())
                document.getElementById("input").value = "";
            }
        }
    }

    render() {
        let listMessages;
        if(this.props.groupId) {

             listMessages = this.props.messages[this.props.groupId].map((item, i) => {
                let time = new Date(new Date(item.created).getTime() + this.props.timeDelay);
                time = time.getDate() + ". " + (time.getMonth() + 1) + ". " + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + " ";
                if(item.userName === this.props.userName) item.userName = "Já"
                return (
                    <li key={i} className="col-xs-12 col-sm-12 col-md-12 col-lg-12" style={{
                        border: "1px solid #ccc",
                        borderRadius: "5px"
                    }}>
                        <span style={{fontSize: "10px"}}>{time}</span>
                        <strong> {item.userName}</strong>: {item.text}
                    </li>
                );
            })
        }
        return (
            <div>
                <div style={{width: "100%", textAlign: "center"}}>Místnost: {this.props.roomName}</div>
                <ul style={{height: "400px", overflowY: "scroll", overflowX: "hidden"}} id="messages">
                    {listMessages}
                </ul>
                <input type="input" onKeyDown={this._sendMessage} id="input"/>
            </div>
        )
    };
}

Messages.PropTypes = {
    messages: PropTypes.array.isRequired,
    timeDelay: PropTypes.number.isRequired,
}

export default socketConnect(Messages);