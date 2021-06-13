import React, {useContext, useEffect, useState} from "react";
import {AppContext} from '../context';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import GroupService from "../services/GroupService";
import {Link} from "react-router-dom";

function Group(props) {
    const context = useContext(AppContext);
    const [mode, setMode] = useState('view');
    const formId = `group-edit-${props.group.id}`;

    function clickEdit() {
        setMode('edit');
    }

    function clickUpdate(evt) {
        evt.preventDefault();
        props.groupService.update(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.name}`);
                props.getGroups();
                setMode('view');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error update: ${xhr.responseText} - ${errorThrown}`))
    }

    function clickCancelUpdate() {
        setMode('view')
    }

    function clickSubmitDelete(evt) {
        evt.preventDefault();
        props.groupService.remove(evt
        ).then(result => {
                context.setMessage(`${result.message} ${result.item.name}`);
                setMode('view');
                props.getGroups();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error delete: ${xhr.responseText} - ${errorThrown}`))
    }

    function renderConfirmDelete() {
        return <form onSubmit={clickSubmitDelete}>
            <input type="hidden" name="id" defaultValue={props.group.id}/>
            <Button style={{marginLeft: '1em'}} variant=
                "danger" size="sm" type={"submit"}>Confirm Delete</Button>
            <Button style={{marginLeft: '1em'}} size="sm" variant="success" onClick={clickCancelUpdate}>Cancel</Button>
        </form>
    }

    function renderDeleteButton() {
        if (mode !== 'view') {
            return null
        }
        return <Button variant="danger" size="sm" title="Delete group"
                       onClick={() => setMode('delete')}>delete</Button>
    }

    function renderEdit() {
        if (mode === 'view')
            return <Button style={{marginLeft: '1em'}} size="sm" title="Edit" onClick={clickEdit}>Edit </Button>;

        if (mode === 'edit') {
            return <div>
                <Button form={formId} style={{marginLeft: '1em'}} size="sm" variant={"primary"}
                        type={"submit"}>ok</Button>
                <Button form={formId} style={{marginLeft: '1em'}} size="sm" variant="danger"
                        onClick={clickCancelUpdate}>cancel</Button>
            </div>
        }
        return null
    }

    function renderName() {
        if (mode === 'edit') {
            return <input form={formId} name="name" defaultValue={props.group.name}/>
        }
        return <span title='Edit group membership'><Link
            to={`/group/${props.group.id}`}>{props.group.name}</Link></span>
    }

    return <tr>
        <Form id={formId} onSubmit={clickUpdate}><input type="hidden" name="id" defaultValue={props.group.id}/></Form>
        <td>
            {renderName()}
        </td>
        <td>
            {mode === 'edit' ?
                <input form={formId} name="description"
                       defaultValue={props.group.description}/> : props.group.description}
        </td>
        <td>
            {mode === 'delete' ? renderConfirmDelete() : renderDeleteButton()}
            {renderEdit()}
        </td>
    </tr>
}

function AddGroup(props)
{
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    function clickCancelAddUser(evt) {
        props.setAddGroup(false);
    }

    function handleSubmitAdd(evt) {
        evt.preventDefault();
        props.groupService.create(evt
        ).then(result => {
                props.setAddGroup(false);
                props.getGroups();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error add group: ${xhr.responseText} - ${errorThrown}`))
    }

    function validateForm() {
        return name.length > 0 && description.length > 0;
    }

    return <div>
        <Button onClick={clickCancelAddUser}>Cancel</Button>
        <Form onSubmit={handleSubmitAdd}>
            <Form.Group size="lg" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    autoFocus
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Form.Group>
            <Form.Group size="lg" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateForm()}>
                Create Group
            </Button>
        </Form>
    </div>

}

export default function GroupAdmin(props)
{
    const context = useContext(AppContext);
    const [groups, setGroups] = useState([]);
    const [addGroup, setAddGroup] = useState(false);
    const groupService = new GroupService({});

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    function getGroups() {
        groupService.json('group'
        ).then(result => setGroups(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting groups: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(() => {
        getGroups();
    }, []);

    function clickAddGroup(evt) {
        setAddGroup(true);
    }

    if (addGroup) {
        return <AddGroup setAddGroup={setAddGroup} getGroups={getGroups} groupService={groupService}/>
    }

    return (<div>
        <Button style={{marginTop: '0.2em', marginBottom: '0.2em'}} size="sm" onClick={clickAddGroup}>Add Group</Button>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-30"}>Name</th>
                <th className={"w-40"}>Description</th>
                <th className={"w-30"}>Actions</th>
            </tr>
            </thead>
            {groups.map(group =>
                <Group group={group} groupService={groupService} getGroups={getGroups}/>
            )}
            <tbody>
            </tbody>
        </table>
    </div>)
}
