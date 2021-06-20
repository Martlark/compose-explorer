import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";


export default function AddUser({setAddUser, authService, getUsers}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("user");
    const context = useContext(AppContext)

    function clickCancelAddUser() {
        setAddUser(false);
    }

    function handleSubmitAddUser(evt) {
        evt.preventDefault();
        authService.create(evt
        ).then(result => {
                setAddUser(false);
                getUsers();
                context.setMessage(`Added: ${result.email}`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error add: ${xhr.responseText} - ${errorThrown}`))
    }

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    return <div>
        <Button onClick={clickCancelAddUser}>Cancel</Button>
        <Form onSubmit={handleSubmitAddUser}>
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
            <Form.Group>
                <Form.Label>User Type</Form.Label>
                <Form.Control as="select" name="user_type" value={userType}
                              onChange={(e) => setUserType(e.target.value)}>
                    {authService.user_types.map(opt => (<option>{opt}</option>))}
                </Form.Control>
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateForm()}>
                Create User
            </Button>
        </Form>
    </div>

}
