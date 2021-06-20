import React, {useContext, useState} from "react";
import {ServerGroup} from "./ServerGroup";
import Button from "react-bootstrap/Button";
import {AppContext} from "../../context";
import GroupService, {useGroups} from "../../services/GroupService";
import Form from "react-bootstrap/Form";

function AddGroup(props) {
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
                props.refreshGroups();
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
            <Form.Group size="log" controlId="access_type">
                <Form.Label>Access Type</Form.Label>
                <Form.Control defaultValue="write"
                              as="select" name="access_type">
                    <option>read</option>
                    <option>write</option>
                </Form.Control>

            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateForm()}>
                Create Group
            </Button>
        </Form>
    </div>

}

export default function GroupAdmin(props) {
    const context = useContext(AppContext);
    const [groups, refreshGroups] = useGroups();
    const [addGroup, setAddGroup] = useState(false);
    const groupService = new GroupService({});

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }
    function clickAddGroup(evt) {
        setAddGroup(true);
    }

    if (addGroup) {
        return <AddGroup setAddGroup={setAddGroup} refreshGroups={refreshGroups} groupService={groupService}/>
    }

    return (<div>
        <Button style={{marginTop: '0.2em', marginBottom: '0.2em'}} size="sm" onClick={clickAddGroup}>Add Group</Button>
        <table className={"table"}>
            <thead>
            <tr>
                <th className={"w-30"}>Name</th>
                <th className={"w-30"}>Description</th>
                <th className={"w-10"}>Access</th>
                <th className={"w-30"}>Actions</th>
            </tr>
            </thead>
            {groups.map(group =>
                <ServerGroup group={group} groupService={groupService} refreshGroups={refreshGroups}/>
            )}
            <tbody>
            </tbody>
        </table>
    </div>)
}
