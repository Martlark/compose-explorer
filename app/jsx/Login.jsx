import React, {useContext, useState} from "react";
import {useHistory} from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {AppContext, AuthService} from "./context";

export function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = new AuthService(props);

    const context = useContext(AppContext)
    const history = useHistory();

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();
        api.login(event).then(result => {
                window.g = result;
                context.setMessage('Welcome');
                history.push('/');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error login: ${xhr.responseText} - ${errorThrown}`))
    }

    return (
        <div className="Login">
            <Form onSubmit={handleSubmit}>
                <Form.Group size="lg" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        autoFocus
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group size="lg" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button block size="lg" type="submit" disabled={!validateForm()}>
                    Login
                </Button>
            </Form>
        </div>
    );
}

export function Logout(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = new AuthService(props);

    const context = useContext(AppContext)
    const history = useHistory();

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    function clickLogout(event) {
        event.preventDefault();
        api.logout(event, {}).then(result => {
                window.g.anon = result;
                context.setMessage('Farewell');
                history.push('/');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error login: ${xhr.responseText} - ${errorThrown}`))
    }

    return (
        <div className="Login">
            <h3>Confirm Logout</h3>
            <Button block size="lg" onClick={clickLogout}>
                Logout
            </Button>
        </div>
    );
}