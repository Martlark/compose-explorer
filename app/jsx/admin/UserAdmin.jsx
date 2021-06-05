import React, {useContext, useEffect, useState} from "react";
import {AppContext, AuthService, urlJoin} from '../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

function User(props) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');
    const [userType, setUserType] = useState(props.user.user_type);
    const user_types = ['admin', 'read'];

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
            <Button style={{marginLeft: '1em'}} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
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
            <input name="password" type="text" required/>
            <Button style={{marginLeft: '1em'}} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
        </form>
    }

    function clickSubmitDelete(evt) {
        evt.preventDefault();
        props.authService.remove(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.email}`);
                setMode('view');
                props.getUsers();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error delete: ${xhr.responseText} - ${errorThrown}`))
    }

    function renderConfirmDelete() {
        return <form onSubmit={clickSubmitDelete}>
            <input type="hidden" name="id" defaultValue={props.user.id}/>
            <Button style={{marginLeft: '1em'}} variant=
                "danger" size="sm" type={"submit"}>Confirm Delete</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="success" onClick={clickCancelUpdate}>Cancel</Button>
        </form>
    }

    function renderPasswordButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button variant="warning" size="sm" title="Set password"
                       onClick={() => setMode('password')}>password</Button>
    }

    function renderDeleteButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button variant="danger" size="sm" title="Delete user"
                       onClick={() => setMode('delete')}>delete</Button>
    }

    function updateUserType(newType) {
        props.authService.put(urlJoin('user', props.user.id), {user_type: newType}
        ).then(result => {
                setUserType(newType);
                context.setMessage(`${result.message} ${result.item.email} type: ${result.item.user_type}`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderUserTypes() {
        return <Form.Control as="select" value={userType} onChange={(e) => updateUserType(e.target.value)}>
            {user_types.map(opt => (<option>{opt}</option>))}
        </Form.Control>
    }

    return <tr>
        <td>{mode === 'edit' ? renderEdit() :
            <span title="Edit" style={{cursor: 'pointer'}} onClick={clickEdit}>{props.user.email}</span>}
        </td>
        <td>
            {renderUserTypes()}
        </td>
        <td>
            {mode === 'password' ? renderPassword() : renderPasswordButton()}
            {' '}
            {mode === 'delete' ? renderConfirmDelete() : renderDeleteButton()}
        </td>
    </tr>
}

function AddUser(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function clickCancelAddUser(evt) {
        props.setAddUser(false);
    }

    function handleSubmitAddUser(evt) {
        evt.preventDefault();
        props.authService.create(evt
        ).then(result => {
                props.setAddUser(false);
                props.getUsers();
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
            <Button block size="lg" type="submit" disabled={!validateForm()}>
                Create User
            </Button>
        </Form>
    </div>

}

export default function UserAdmin(props) {
    const context = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [addUser, setAddUser] = useState(false);
    const authService = new AuthService({})

    if (!window.g.admin) {
        return <h3>Forbidden</h3>;
    }

    function getUsers() {
        authService.json('user'
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

    if (addUser) {
        return <AddUser setAddUser={setAddUser} getUsers={getUsers} authService={authService}/>
    }

    return (<div>
        <Button style={{marginTop:'0.2em', marginBottom:'0.2em'}} size="sm" onClick={clickAddUser}>Add</Button>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-30"}>email</th>
                <th>User Type</th>
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
