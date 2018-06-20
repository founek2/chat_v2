import React from 'react';
import PropTypes from 'prop-types';
import { socketConnect } from 'socket.io-react';

const OnlineUsers = function (props) {
    const getMessages = (targetUserName)=> {
        props.socket.emit("getUserRoomMessage", {targetUserName: targetUserName})
    }
    const listOnlineUsers = props.onlineUsers.map((item) =>
        <li key={item.userName} className="col-xs-12 col-sm-12 col-md-12 col-lg-12" style={{
            border: "1px solid #ccc",
            borderRadius: "5px"
        }} onClick={()=> getMessages(item.userName)}>
            {item.userName}
        </li>
    );
    return (
        <div>
            <strong>Online uživatelé</strong>
                <ul style={{height: "100px", overflowY: "scroll", overflowX: "hidden"}}>
                    {listOnlineUsers}
                </ul>
        </div>
            )
};
OnlineUsers.PropTypes = {
    onlineUsers: PropTypes.array.isRequired,
}

export default socketConnect(OnlineUsers);