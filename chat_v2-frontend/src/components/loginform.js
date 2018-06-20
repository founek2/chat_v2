import React from 'react';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {userName: "", password: ""};
    }
    _handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        })
    }
    _callAuth = (e) => {
        e.preventDefault();
        this.props.callAuth(this.state.userName, this.state.password);
    }
    render() {
        const {userName, password} = this.state;
        return(
            <div className="formBack">
                <div className="login">
                    <h1>Login</h1>
                    <form onSubmit={this._callAuth}>
                        <input type="text" name="userName" placeholder="Username" required="required" className="input" value={userName} onChange={this._handleChange}/>
                        <input type="password" name="password" placeholder="Password" required="required" className="input" value={password} onChange={this._handleChange}/>
                        <button type="submit" className="btn btn-primary btn-block btn-large">Let me in.</button>
                    </form>
                </div>
            </div>
        )
    }
}


export default LoginForm;