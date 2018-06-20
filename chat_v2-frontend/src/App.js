import React, {Component} from 'react';
import './App.css';
import LoginForm from "./components/loginform";
import {auth} from "./api/calls";
import LoggedContent from "./containers/loggedContent";

class App extends Component {
    constructor(props) {
        super(props);

        if (sessionStorage.getItem('jwtToken')) {
            console.log("Prihlasen jako " + sessionStorage.getItem('userName'))
            this.state = {logged: true, userName: sessionStorage.getItem('userName')};
        } else {
            this.state = {logged: false};
        }

    }

    _callAuth = (userName, password) => {
        auth(userName, password).then((result) => {
            if (result) {
                console.log(result);
                sessionStorage.setItem('jwtToken', result["jwtToken"]);
                sessionStorage.setItem('userName', result.userName);
                this.setState({logged: true, userName: result.userName});
            }

        })
    }

    render() {
        const {logged, userName} = this.state;
        console.log(logged);
        const mainContent = logged ? (<LoggedContent userName={userName}/>) : "";
        const login = logged ? "" : <LoginForm callAuth={this._callAuth}/>;
        return (
                <div className="root">
                    {login}
                    <div className="container-fluid">
                        {mainContent}
                    </div>
                </div>
        );
    }
}

export default App;
