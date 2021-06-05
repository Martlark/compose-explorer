import React, {useContext, useState} from "react";
import {useHistory} from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {AppContext, ProfileService} from "../context";

export function Login(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = new ProfileService();

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
