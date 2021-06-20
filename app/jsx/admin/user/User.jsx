import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default function User(props) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');
    const [userType, setUserType] = useState(props.user.user_type);
    const buttonStyle = {marginRight: '1em'};

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
            <Button style={buttonStyle} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={buttonStyle} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
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
            <Button style={buttonStyle} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={buttonStyle} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
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
            <Button style={buttonStyle} variant=
                "danger" size="sm" type={"submit"}>Confirm Delete</Button>
            <Button style={buttonStyle} size="sm" variant="success" onClick={clickCancelUpdate}>Cancel</Button>
        </form>
    }

    function renderPasswordButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button style={buttonStyle} variant="warning" size="sm" title="Set password"
                       onClick={() => setMode('password')}>password</Button>
    }

    function renderDeleteButton() {
        if (mode !== 'view') {
            return null
        }
        if (context.userId === props.user.id) {
            return null
        }

        return <Button style={buttonStyle} variant="danger" size="sm" title="Delete user"
                       onClick={() => setMode('delete')}>delete</Button>
    }

    function updateUserType(newType) {
        props.authService.put(props.authService.urlJoin('user', props.user.id), {user_type: newType}
        ).then(result => {
                setUserType(newType);
                context.setMessage(`${result.message} ${result.item.email} type: ${result.item.access_type}`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderUserTypes() {
        if (context.userId === props.user.id) {
            return <span>{props.user.user_type}</span>;
        }

        return <Form.Control as="select" value={userType} onChange={(e) => updateUserType(e.target.value)}>
            {props.authService.user_types.map(opt => (<option>{opt}</option>))}
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
