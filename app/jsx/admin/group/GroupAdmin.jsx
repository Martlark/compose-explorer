import React, { useContext, useState } from "react";
import { ServerGroup } from "./ServerGroup";
import Button from "react-bootstrap/Button";
import { AppContext } from "../../context";
import GroupService, { useGroups } from "../../services/GroupService";
import AddGroup from "./AddGroup";

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
    return (
      <AddGroup
        setAddGroup={setAddGroup}
        refreshGroups={refreshGroups}
        groupService={groupService}
      />
    );
  }

  return (
    <div>
      <h2>Groups</h2>
      <Button
        style={{ marginTop: "0.2em", marginBottom: "0.2em" }}
        size="sm"
        onClick={clickAddGroup}
      >
        Add Group
      </Button>
      <table className={"table"}>
        <thead>
          <tr>
            <th className={"w-20"}>Name</th>
            <th className={"w-30"}>Description</th>
            <th className={"w-10"}>Access</th>
            <th className={"w-40"}>Actions</th>
          </tr>
        </thead>
        {groups.map((group) => (
          <ServerGroup
            group={group}
            groupService={groupService}
            refreshGroups={refreshGroups}
          />
        ))}
        <tbody></tbody>
      </table>
    </div>
  );
}
