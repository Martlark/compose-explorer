import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import Button from "react-bootstrap/Button";
import AuthService, {useUsers} from "../../services/AuthService";
import User from "./User";
import AddUser from "./AddUser";

export const route = '/admin/';

export default function UserAdmin() {
    const {users, getUsers} = useUsers();
    const [addUser, setAddUser] = useState(false);
    const authService = new AuthService({})
    const context = useContext(AppContext);

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    function clickAddUser() {
        setAddUser(true);
    }

    if (addUser) {
        return <AddUser setAddUser={setAddUser} getUsers={getUsers} authService={authService}/>
    }

    return (<div>
        <h2>Users</h2>
        <Button style={{marginTop: '0.2em', marginBottom: '0.2em'}} size="sm" onClick={clickAddUser}>Add</Button>
        <table className={"table"}>
            <thead>
            <tr>
                <th className="w-30">email</th>
                <th className="w-20">User Type</th>
                <th className="w-50">Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map(user =>
                <User user={user} api={context.api} authService={authService} getUsers={getUsers}/>
            )}
            </tbody>
        </table>
    </div>)
}
