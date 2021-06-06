import React, {useContext, useEffect, useState} from "react";
import {AppContext} from './../context';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ProfileService from "../services/ProfileService";

export default function UserProfile() {
    const context = useContext(AppContext);
    const [user, setUser] = useState({});
    const [first_name, setFirst_name] = useState('');
    const [last_name, setLast_name] = useState('');
    const api = new ProfileService();

    function getUser() {
        api.json('user'
        ).then(result => {
                setUser(result);
                setFirst_name(result.first_name);
                setLast_name(result.last_name);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting user: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(() => {
        getUser();
    }, []);

    function clickUpdate(evt) {
        evt.preventDefault();
        api.update(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.email}`);
                getUser();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderEdit() {
        return <Form onSubmit={clickUpdate}>
            <input type="hidden" name="id" defaultValue={user.id}/>
            <Form.Group size="lg" controlId="first_name">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    autoFocus
                    name="first_name"
                    value={first_name}
                    onChange={(e) => setFirst_name(e.target.value)}
                />
            </Form.Group>
            <Form.Group size="lg" controlId="last_name">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    name="last_name"
                    value={last_name}
                    onChange={(e) => setLast_name(e.target.value)}
                />
            </Form.Group>

            <Button style={{marginLeft: '1em'}} size="sm" variant={"primary"} type={"submit"}>Save</Button>
        </Form>
    }

    return <div>
        <h1>Profile</h1>
        <h2>{user.email}</h2>
        <h3>User type: {g.admin && 'admin' || 'read'}</h3>
        {renderEdit()}
    </div>
}