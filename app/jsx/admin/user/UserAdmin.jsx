import React, { useContext, useState } from "react";
import { AppContext } from "../../context";
import Button from "react-bootstrap/Button";
import AuthService, { useUsers } from "../../services/AuthService";
import User from "./User";
import AddUser from "./AddUser";
import { useGroups } from "../../services/GroupService";
import LoadingMessage from "../../LoadingMesssage";

export const route = "/admin/";

export default function UserAdmin() {
  const { users, getUsers, isLoadingUsers } = useUsers();
  const [addUser, setAddUser] = useState(false);
  const [groups, refreshGroups, isLoadingGroups] = useGroups();
  const authService = new AuthService({});
  const context = useContext(AppContext);

  function clickAddUser() {
    setAddUser(true);
  }

  if (addUser) {
    return (
      <AddUser
        setAddUser={setAddUser}
        getUsers={getUsers}
        authService={authService}
      />
    );
  }

  if (!context.admin) {
    return <h2>Forbidden</h2>;
  }

  if (isLoadingGroups || isLoadingUsers) {
    return <LoadingMessage />;
  }

  return (
    <div>
      <h2>Users</h2>
      {context.ldap ? null : (
        <Button
          style={{ marginTop: "0.2em", marginBottom: "0.2em" }}
          size="sm"
          onClick={clickAddUser}
        >
          Add
        </Button>
      )}
      <table className={"table"}>
        <thead>
          <tr>
            <th className="w-30">email</th>
            <th className="w-20">User Type</th>
            <th className="w-20">Actions</th>
            <th className="w-30">Groups</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <User
              user={user}
              groups={groups}
              authService={authService}
              getUsers={getUsers}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
