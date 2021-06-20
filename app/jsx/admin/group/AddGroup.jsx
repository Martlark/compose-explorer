import React, {useContext, useState} from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {AppContext} from "../../context";

export default function AddGroup({setAddGroup, refreshGroups, groupService}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const context = useContext(AppContext);

    function clickCancelAddUser(evt) {
        setAddGroup(false);
    }

    function handleSubmitAdd(evt) {
        evt.preventDefault();
        groupService.create(evt
        ).then(result => {
                setAddGroup(false);
                refreshGroups();
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
