import React, {Component} from 'react';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {socketConnect} from 'socket.io-react';

class modalDialog extends Component {
    constructor(props){
        super(props);
        this.state = {
            init: this.props.data,
            inputs: {name: "", users: []}
        };
    }
    componentWillReceiveProps(nextProps){
        if (nextProps.data) this.setState({init: nextProps.data})
    }
    _handleInputChange = (e)=> {
        const inputs = this.state.inputs;
        inputs["name"] = e.target.value;
        this.setState({
            inputs: inputs,
        })
    }
    _handleSelectChange = (e)=> {
      //  console.log(e.target.value)
        if(e.target.value !== "Přidat"){
            const inputs = this.state.inputs;
            if(inputs.users.indexOf(e.target.value) === -1){
                inputs["users"].push({userName: e.target.value});
                console.log(inputs["users"])
                this.setState({
                    inputs: inputs,
                })
            }else {
                alert("Uživatel byl již vybrán")
            }

        }
        e.preventDefault();

    }
    _handleSubmit = (e)=>{
        e.preventDefault();
        const inputs = this.state.inputs;
        if(this.state.init.type === "addGroup"){
            if(inputs.name !== ""){
                inputs.users.push({userName: this.props.userName})
                this.props.socket.emit("createGroup", {name: inputs.name, users: inputs.users});
                this.setState({
                    inputs: {name: "", users: []}
                })
                this.props.handleClose();
            }else {
                alert("Název musí být vyplněn.")
            }
        }

    }
    render(){
        const {onlineUsers, handleClose} = this.props;
        const {init, inputs, error} = this.state
        const {isShowing, type} = init;
        const {name, users} = inputs;
        console.log("users",users);
        let dialogContent;
        if(type === "addGroup"){
            dialogContent = (
                <div>
                    <form onSubmit={this._handleSubmit}>
                    <h2>Vytvoření  skupiny:</h2>
                    <label>Název</label><input type="input" value={name} onChange={this._handleInputChange} required/><br/>
                    <label>Přidat uživatele</label>
                    <select onChange={this._handleSelectChange}>
                        <option>Přidat</option>
                        {onlineUsers.map(((user) =>
                                <option key={user.userName}>{user.userName}</option>
                        ))}
                    </select>
                    <div>
                    {users.map((user) =>
                        <span key={user.userName} style={{backgroundColor: "grey", borderRadius: "15px"}}>{user.userName}</span>
                    )}
                    </div>
                    <input type="submit" value="Vytvořit" />
                    </form>
                </div>
            );
        }
        return(
            <div>
                {
                    isShowing &&
                    <ModalContainer onClose={handleClose}>
                        <ModalDialog onClose={handleClose}>
                            { dialogContent}
                        </ModalDialog>
                    </ModalContainer>
                }
            </div>
        )
    }
}

export default socketConnect(modalDialog);