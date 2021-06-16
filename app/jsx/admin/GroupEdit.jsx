import React, {useContext, useEffect, useState} from "react";
import {AppContext} from '../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import AuthService from "../services/AuthService";
import GroupService from "../services/GroupService";

function GroupUser({user,group,groupService,getGroup}) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');

    function clickSubmitRemove(evt) {
        evt.preventDefault();
        groupService.remove_user(evt
        ).then(result => {
                context.setMessage(result);
                setMode('view');
                getGroup();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error delete: ${xhr.responseText} - ${errorThrown}`))
    }

    function clickCancel() {
        setMode('view');
    }

    function renderConfirmRemove() {
        return <form onSubmit={clickSubmitRemove}>
            <input type="hidden" name="user_id" defaultValue={user.id}/>
            <input type="hidden" name="group_id" defaultValue={group.id}/>
            <Button style={{marginLeft: '1em'}} variant=
                "danger" size="sm" type={"submit"}>Confirm Remove</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="success" onClick={clickCancel}>Cancel</Button>
        </form>
    }

    function renderRemoveButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button variant="danger" size="sm" title="Remove user"
                       onClick={() => setMode('delete')}>remove</Button>
    }

    return <tr>
        <td>
            <span>{user.email}</span>
        </td>
        <td>
            {mode === 'delete' ? renderConfirmRemove() : renderRemoveButton()}
        </td>
    </tr>
}

function GroupServer(props) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');

    function clickSubmitRemove(evt) {
        evt.preventDefault();
        props.groupService.remove_server(evt
        ).then(result => {
                context.setMessage(result);
                setMode('view');
                props.getGroup();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error remove: ${xhr.responseText} - ${errorThrown}`))
    }

    function clickCancel() {
        setMode('view');
    }

    function renderConfirmRemove() {
        return <form onSubmit={clickSubmitRemove}>
            <input type="hidden" name="server_id" defaultValue={props.server.id}/>
            <input type="hidden" name="group_id" defaultValue={props.group.id}/>
            <Button style={{marginLeft: '1em'}} variant=
                "danger" size="sm" type={"submit"}>Confirm Remove</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="success" onClick={clickCancel}>Cancel</Button>
        </form>
    }

    function renderRemoveButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button variant="danger" size="sm" title="Remove server"
                       onClick={() => setMode('delete')}>remove</Button>
    }

    return <tr>
        <td>
            <span>{props.server.name}</span>
        </td>
        <td>
            {mode === 'delete' ? renderConfirmRemove() : renderRemoveButton()}
        </td>
    </tr>
}

export default function GroupEdit(props) {
    const context = useContext(AppContext);
    const [group_id, setGroup_id] = useState(props?.match?.params?.id);
    const [mode, setMode] = useState('view');
    const [users, setUsers] = useState([]);
    const [servers, setServers] = useState([]);
    const [groupUsers, setGroupUsers] = useState([]);
    const [groupServers, setGroupServers] = useState([]);
    const [group, setGroup] = useState({});
    const [newUserId, setNewUserId] = useState(null);
    const [newServerId, setNewServerId] = useState(null);

    const groupService = new GroupService({});
    const authService = new AuthService({});

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    function getServers() {
        context.api.json('/servers/').then(items => {
                setServers(items);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting servers: ${xhr.responseText}`)
        )
    }

    function getUsers() {
        authService.json('user'
        ).then(result => setUsers(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting users: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    function getGroup() {
        groupService.get(group_id
        ).then(result => {
                setGroup(result);
                setGroupServers(result.servers);
                setGroupUsers(result.users);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting group: ${xhr.responseText} - ${errorThrown}`)
        );

    }

    useEffect(() => {
        getGroup();
        getUsers();
        getServers();
    }, [group_id]);

    function clickAddUser() {
        setMode('add-user');
    }

    function clickAddServer() {
        setMode('add-server');

    }

    function submitAddUser(evt) {
        evt.preventDefault();
        groupService.add_user(evt
        ).then(result => {
                context.setMessage(`${result}`);
                getGroup();
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error add user: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    function submitAddServer(evt) {
        evt.preventDefault();
        groupService.add_server(evt
        ).then(result => {
                context.setMessage(`${result}`);
                getGroup();
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error add server: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    function renderAddUser() {
        const newUsers = users.filter(user => !groupUsers.map(gu => gu.id).includes(user.id));
        if (newUsers.length < 1) {
            return <h3>No users left</h3>;
        }
        return <Form onSubmit={submitAddUser}>
            <Form.Control type="hidden" value={group_id} name="group_id"/>
            <Form.Control as="select" value={newUserId} name="user_id" onChange={(e) => setNewUserId(e.target.value)}>
                {newUsers.map(opt => (<option value={opt.id}>{opt.email}</option>))}
            </Form.Control>
            <Button type="submit" size="sm" variant="success">Add User</Button>
        </Form>;
    }

    function renderAddServer() {
        const newServers = servers.filter(server => !groupServers.map(gu => gu.id).includes(server.id));
        if (newServers.length < 1) {
            return <h3>No servers left</h3>;
        }
        return <Form onSubmit={submitAddServer}>
            <Form.Control type="hidden" value={group_id} name="group_id"/>
            <Form.Control as="select" value={newServerId} name="server_id"
                          onChange={(e) => setNewServerId(e.target.value)}>
                {newServers.map(opt => (<option value={opt.id}>{opt.name}</option>))}
            </Form.Control>
            <Button type="submit" size="sm" variant="success">Add Server</Button>
        </Form>;
    }

    function renderActions() {
        if (mode !== 'view') {
            return <Button style={{marginTop: '0.2em', marginBottom: '0.2em', marginRight: '0.2em'}} size="sm"
                           variant="warning"
                           onClick={() => setMode('view')}>Cancel</Button>;
        }
        return <>
            <Button style={{marginTop: '0.2em', marginBottom: '0.2em', marginRight: '0.2em'}} size="sm"
                    onClick={clickAddUser}>Add User</Button>
            <Button style={{marginTop: '0.2em', marginBottom: '0.2em', marginRight: '0.2em'}} size="sm"
                    onClick={clickAddServer}>Add Server</Button>
        </>;
    }

    return (<div>
        <h2>Group: {group.name} - {group.description}</h2>
        <h3>{group.access_type}</h3>
        {renderActions()}
        {mode === 'add-user' && renderAddUser()}
        {mode === 'add-server' && renderAddServer()}
        <h3>Servers</h3>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-50"}>Name</th>
                <th className={"w-50"}>Actions</th>
            </tr>
            </thead>
            {groupServers.map(server =>
                <GroupServer group={group} server={server} groupService={groupService} getGroup={getGroup}/>
            )}
            <tbody>
            </tbody>
        </table>
        <h3>Users</h3>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-50"}>Email</th>
                <th className={"w-50"}>Actions</th>
            </tr>
            </thead>
            {groupUsers.map(user =>
                <GroupUser group={group} user={user} groupService={groupService} getGroup={getGroup}/>
            )}
            <tbody>
            </tbody>
        </table>
    </div>)
}
