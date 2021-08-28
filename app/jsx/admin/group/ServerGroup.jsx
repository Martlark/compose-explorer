import React, { useContext, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { AppContext } from "../../context";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";

export function ServerGroup({ group, groupService, refreshGroups }) {
  const [mode, setMode] = useState("view");
  const formId = `group-edit-${group.id}`;
  const context = useContext(AppContext);
  const buttonStyle = { marginRight: "1em" };

  function clickEdit() {
    setMode("edit");
  }

  function clickUpdate(evt) {
    evt.preventDefault();
    groupService
      .update(evt)
      .then((result) => {
        context.setMessage(`${result.message} ${result.item.name}`);
        refreshGroups();
        setMode("view");
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error update: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  function clickCancelUpdate() {
    setMode("view");
  }

  function clickSubmitDelete(evt) {
    evt.preventDefault();
    groupService
      .remove(evt)
      .then((result) => {
        context.setMessage(`${result.message} ${result.item.name}`);
        setMode("view");
        refreshGroups();
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error delete: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  function renderConfirmDeleteRow() {
    if (mode !== "delete") {
      return null;
    }

    return (
      <>
        <td>{group.name}</td>
        <td>{group.description}</td>
        <td>{group.access_type}</td>
        <td>
          <form onSubmit={clickSubmitDelete}>
            <input type="hidden" name="id" defaultValue={group.id} />
            <Button
              style={buttonStyle}
              variant="danger"
              size="sm"
              type={"submit"}
            >
              Confirm Delete
            </Button>
            <Button
              style={buttonStyle}
              size="sm"
              variant="success"
              onClick={clickCancelUpdate}
            >
              Cancel
            </Button>
          </form>
        </td>
      </>
    );
  }

  function renderDeleteButton() {
    return (
      <Button
        style={buttonStyle}
        variant="danger"
        size="sm"
        title="Delete group"
        onClick={() => setMode("delete")}
      >
        delete
      </Button>
    );
  }

  function renderEditRow() {
    if (mode !== "edit") {
      return null;
    }

    return (
      <>
        <Form id={formId} onSubmit={clickUpdate}>
          <input type="hidden" name="id" defaultValue={group.id} />
        </Form>

        <td>
          <input form={formId} name="name" required defaultValue={group.name} />
        </td>
        <td>
          <input
            form={formId}
            name="description"
            defaultValue={group.description}
          />
        </td>
        <td>
          <Form.Control
            defaultValue={group.access_type}
            as="select"
            form={formId}
            name="access_type"
          >
            <option>read</option>
            <option>write</option>
          </Form.Control>
        </td>
        <td>
          <div>
            <Button
              form={formId}
              style={buttonStyle}
              size="sm"
              variant={"primary"}
              type={"submit"}
            >
              ok
            </Button>
            <Button
              form={formId}
              style={buttonStyle}
              size="sm"
              variant="danger"
              onClick={clickCancelUpdate}
            >
              cancel
            </Button>
          </div>
        </td>
      </>
    );
  }

  function renderRow() {
    if (mode !== "view") {
      return null;
    }

    return (
      <>
        <td>
          <Link to={`/group/${group.id}/`}>{group.name}</Link>
        </td>
        <td>
          {group.description}{" "}
          <Badge variant={"primary"}>
            Servers{" "}
            <Badge pill variant="secondary">
              {group.servers.length}
            </Badge>
          </Badge>{" "}
          <Badge variant={"warning"}>
            Users{" "}
            <Badge pill variant="secondary">
              {group.users.length}
            </Badge>
          </Badge>
        </td>
        <td>{group.access_type}</td>
        <td>
          <Button
            style={buttonStyle}
            size="sm"
            title="Edit"
            onClick={clickEdit}
          >
            Edit{" "}
          </Button>
          {renderDeleteButton()}
        </td>
      </>
    );
  }

  return (
    <tr key={`server-group-${group.id}`}>
      {renderEditRow()}
      {renderRow()}
      {renderConfirmDeleteRow()}
    </tr>
  );
}
