import React from 'react';
import PropTypes from 'prop-types';
import {socketConnect} from 'socket.io-react';
import {ContextMenu, MenuItem, ContextMenuTrigger} from "react-contextmenu";

const OnlineRooms = function (props) {
    const getMessages = (groupId, name) => {
        // props.socket.emit("getRoomMessage", {groupId: groupId});
        props.setRoom(name, groupId)
    }
    const listOnlineRooms = props.onlineRooms.map((item) =>
        <li key={item.groupId} className="col-xs-12 col-sm-12 col-md-12 col-lg-12" style={{
            border: "1px solid #ccc",
            borderRadius: "5px"
        }} onClick={() => getMessages(item.groupId, item.name)}>
            {item.name}
        </li>
    );

    function handleClick(e, data) {
        props.showModal(data.type);

    }

    return (
        <div>
            <ContextMenuTrigger id="some_unique_identifier" style={{width: "10%"}}>
                <div><strong>Konverzace</strong></div>
            </ContextMenuTrigger>

            <ContextMenu id="some_unique_identifier" className="contextMenu">
                <MenuItem data={{type: "addGroup"}} onClick={handleClick}>
                    Vytvořit skupinu
                </MenuItem>
                <MenuItem onClick={handleClick}>
                    něco
                </MenuItem>
                <MenuItem divider/>
                <MenuItem onClick={handleClick}>
                    něco
                </MenuItem>
            </ContextMenu>

            <ul style={{height: "300px", overflowY: "scroll", overflowX: "hidden"}}>
                {listOnlineRooms}
            </ul>
        </div>
    )
};
OnlineRooms.PropTypes = {
    onlineRooms: PropTypes.array.isRequired,
    online: PropTypes.array.isRequired,
}

export default socketConnect(OnlineRooms);