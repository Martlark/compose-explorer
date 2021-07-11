import React, {useContext} from "react";
import {AppContext} from './../context';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {useProfile} from "../services/ProfileService";
import LoadingMessage from "../LoadingMesssage";

export default function UserProfile() {
    const context = useContext(AppContext);
    const [user, loadingStatus, update, updatePassword] = useProfile({});

    function clickUpdate(evt) {
        evt.preventDefault();
        update(evt);
    }

    function clickUpdatePassword(evt) {
        evt.preventDefault();
        updatePassword(evt);
    }

    function renderEdit() {
        return <Form onSubmit={clickUpdate}>
            <input type="hidden" name="id" defaultValue={user.id}/>
            <Form.Group size="lg" controlId="first_name">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    autoFocus
                    name="first_name"
                    defaultValue={user.first_name}
                />
            </Form.Group>
            <Form.Group size="lg" controlId="last_name">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    name="last_name"
                    defaultValue={user.last_name}
                />
            </Form.Group>

            <Button style={{marginLeft: '1em'}} size="sm" variant={"primary"} type={"submit"}>Save</Button>
        </Form>
    }

    function renderPassword() {
        return <Form onSubmit={clickUpdatePassword}>
            <h3>Change Password</h3>
            <input type="hidden" name="id" defaultValue={user.id}/>
            <Form.Group size="lg">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                    type="password"
                    name="current_password"
                    required
                />
            </Form.Group>
            <Form.Group size="lg">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    name="new_password"
                    required
                />
            </Form.Group>

            <Form.Group size="lg">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                    type="password"
                    name="confirm_password"
                    required
                />
            </Form.Group>

            <Button style={{marginLeft: '1em'}} size="sm" variant={"primary"} type={"submit"}>Change Password</Button>
        </Form>
    }

    if (loadingStatus !== 'done') {
        return <LoadingMessage status={loadingStatus}/>
    }

    function renderLdapDetails(){
        return <div>
            <p>Logged in using: {user.options}</p>
            <p>Your user details are maintained by a LDAP service.</p>
        </div>
    }

    return <div>
        <h1>Profile</h1>
        <h2>{user.email}</h2>
        <h3>User type: {context.admin && 'admin' || 'read'}</h3>
        {context.ldap ? renderLdapDetails() : `${renderEdit()} ${renderPassword()}`}
        <h3>Group Membership</h3>
        <table className="table">
            <thead>
            <tr>
                <th className={"w-60"}>Name</th>
                <th className={"w-40"}>Access type</th>
            </tr>
            </thead>
            <tbody>
            {user.group_membership?.map(group => <tr key={group.name}>
                <td>{group.name}</td>
                <td>{group.access_type}</td>
            </tr>)}
            </tbody>
        </table>
    </div>
}