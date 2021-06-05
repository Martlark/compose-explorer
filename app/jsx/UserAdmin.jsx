import React, {useContext, useEffect, useState} from "react";
import {AppContext, AuthService} from './context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function User(props) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');

    function clickEdit() {
        setMode('edit');
    }

    function clickUpdate(evt) {
        evt.preventDefault();
        props.authService.update(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.email}`);
                props.getUsers();
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`))
    }

    function clickCancelUpdate() {
        setMode('view')
    }

    function renderEdit() {
        return <form onSubmit={clickUpdate}>
            <input type="hidden" name="id" defaultValue={props.user.id}/>
            <input name="email" type="email" required defaultValue={props.user.email}/>
            <Button style={{marginLeft: '1em'}} variant={"primary"} type={"submit"}>ok</Button>
            <Button style={{marginLeft: '1em'}} variant="danger" onClick={clickCancelUpdate}>cancel</Button>
        </form>
    }

    function clickUpdateSetPassword(evt) {
        evt.preventDefault();
        props.authService.set_password(evt
        ).then(result => {
                context.setMessage(`${result}`);
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error set password: ${xhr.responseText} - ${errorThrown}`))
    }

    function renderPassword() {
        return <form onSubmit={clickUpdateSetPassword}>
            <input type="hidden" name="id" defaultValue={props.user.id}/>
            <input name="password" type="text" required />
            <Button style={{marginLeft: '1em'}} variant={"primary"} type={"submit"}>ok</Button>
            <Button style={{marginLeft: '1em'}} variant="danger" onClick={clickCancelUpdate}>cancel</Button>
        </form>
    }

    return <tr>
        <td>{mode === 'edit' ? renderEdit() : <span title="Edit" style={{cursor:'pointer'}} onClick={clickEdit}>{props.user.email}</span>}</td>
        <td>{mode === 'password' ? renderPassword() : <span title="Set password" style={{cursor:'pointer'}} onClick={()=>setMode('password')}>password</span>}</td>
    </tr>
}

export default function UserAdmin(props) {
    const context = useContext(AppContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [users, setUsers] = useState([]);
    const [addUser, setAddUser] = useState(false);
    const authService = new AuthService({})

    context.api.setPrefix('auth');

    if (!window.g.admin) {
        return <h3>Forbidden</h3>;
    }

    function getUsers() {
        context.api.json('user'
        ).then(result => setUsers(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting users: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(() => {
        getUsers();
    }, []);

    function clickAddUser(evt) {
        setAddUser(true);
    }

    function clickCancelAddUser(evt) {
        setAddUser(false);
    }

    function handleSubmitAddUser(evt) {
        evt.preventDefault();
        authService.create(evt
        ).then(result => {
                setAddUser(false);
                getUsers();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error add: ${xhr.responseText} - ${errorThrown}`))
    }

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    if (addUser) {
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
                <Button block size="lg" type="submit" disabled={!validateForm()}>
                    Create User
                </Button>
            </Form>
        </div>
    }

    return (<div>
        <Button onClick={clickAddUser}>Add</Button>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-30"}>email</th>
                <th className={"w-70"}>Actions</th>
            </tr>
            </thead>
            {users.map(user =>
                <User user={user} api={context.api} authService={authService} getUsers={getUsers}/>
            )}
            <tbody>
            </tbody>
        </table>
    </div>)
}
