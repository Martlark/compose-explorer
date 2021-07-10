import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import GroupService from "../../services/GroupService";

function GroupMembership({user, groups, authService, context}) {
    const userGroupIds = user.group_membership.map(member => member.id);
    const filteredGroups = groups.filter(group => userGroupIds.includes(group.id));
    const groupService = new GroupService();

    const [membership, setMembership] = useState(filteredGroups.map(group => {
        return {value: group.id, label: `${group.name} - ${group.access_type}`}
    }));
    const options = groups?.map(group => {
        return {value: group.id, label: `${group.name} - ${group.access_type}`}
    });

    function onChange(evt, action) {
        const group_id = action.option?.value || action.removedValue.value;
        const user_id = user.id;
        switch (action.action) {
            case 'select-option':
                groupService.add_user(null, {group_id, user_id}).then(result => context.setMessage(result));
                break;
            case 'remove-value':
                groupService.remove_user(null, {group_id, user_id}).then(result => context.setMessage(result));
                break;
        }
    }

    return <Select isMulti name="groups" isClearable={false} defaultValue={membership} options={options}
                   onChange={onChange}/>;
}

export default function User({user, groups, authService, getUsers}) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');
    const [userType, setUserType] = useState(user.user_type);
    const buttonStyle = {marginRight: '1em'};

    function clickEdit() {
        setMode('edit');
    }

    function clickUpdate(evt) {
        evt.preventDefault();
        authService.update(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.email}`);
                getUsers();
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
            <input type="hidden" name="id" defaultValue={user.id}/>
            <input name="email" type="email" required defaultValue={user.email}/>
            <Button style={buttonStyle} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={buttonStyle} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
        </form>
    }

    function clickUpdateSetPassword(evt) {
        evt.preventDefault();
        authService.set_password(evt
        ).then(result => {
                context.setMessage(`${result}`);
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error set password: ${xhr.responseText} - ${errorThrown}`))
    }

    function renderPassword() {
        return <form onSubmit={clickUpdateSetPassword}>
            <input type="hidden" name="id" defaultValue={user.id}/>
            <input name="password" type="text" required/>
            <Button style={buttonStyle} size="sm" variant={"primary"} type={"submit"}>ok</Button>
            <Button style={buttonStyle} size="sm" variant="danger" onClick={clickCancelUpdate}>cancel</Button>
        </form>
    }

    function clickSubmitDelete(evt) {
        evt.preventDefault();
        authService.remove(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.email}`);
                setMode('view');
                getUsers();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error delete: ${xhr.responseText} - ${errorThrown}`))
    }

    function renderConfirmDelete() {
        return <form onSubmit={clickSubmitDelete}>
            <input type="hidden" name="id" defaultValue={user.id}/>
            <Button style={buttonStyle} variant=
                "danger" size="sm" type={"submit"}>Confirm Delete</Button>
            <Button style={buttonStyle} size="sm" variant="success" onClick={clickCancelUpdate}>Cancel</Button>
        </form>
    }

    function renderPasswordButton() {
        if (context.userId === user.id) {
            return null;
        }

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
        if (context.userId === user.id) {
            return null
        }

        return <Button style={buttonStyle} variant="danger" size="sm" title="Delete user"
                       onClick={() => setMode('delete')}>delete</Button>
    }

    function updateUserType(newType) {
        authService.put(authService.urlJoin('user', user.id), {user_type: newType}
        ).then(result => {
                setUserType(newType);
                context.setMessage(`${result.message} ${result.item.email} type: ${result.item.user_type}`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderUserTypes() {
        if (context.userId === user.id) {
            return <span>{user.user_type}</span>;
        }

        return <Form.Control as="select" value={userType} onChange={(e) => updateUserType(e.target.value)}>
            {authService.user_types.map(opt => (<option>{opt}</option>))}
        </Form.Control>
    }

    return <tr>
        <td>{mode === 'edit' ? renderEdit() :
            <span title="Edit" style={{cursor: 'pointer'}} onClick={clickEdit}>{user.email}</span>}
        </td>
        <td>
            {renderUserTypes()}
        </td>
        <td>
            {mode === 'password' ? renderPassword() : renderPasswordButton()}
            {' '}
            {mode === 'delete' ? renderConfirmDelete() : renderDeleteButton()}
        </td>
        <td>
            <GroupMembership user={user} groups={groups} authService={authService} context={context}/>
        </td>
    </tr>
}
