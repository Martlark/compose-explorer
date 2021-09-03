import React, { useContext } from "react";
import { AppContext } from "../context";
import ServerService from "../services/ServerService";
import LoginRequired from "../LoginRequired";

export function NewServerForm(props) {
  const setNewServer = props.setNewServer;
  const getItems = props.getItems;
  const api = new ServerService();

  const context = useContext(AppContext);

  const handleSubmit = (e) => {
    return api
      .create(e)
      .then((item) => {
        setNewServer(false);
        context.setMessage(`Added ${item.name}`);
        getItems();
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
      );
  };

  function clickTestConnection(e) {
    e.preventDefault();
    context.setErrorMessage("");
    return api
      .testConnection(
        $("input[name=name]").val(),
        $("input[name=port]").val(),
        $("input[name=credentials]").val()
      )
      .then((result) => context.setMessage(`${result.message}`))
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
      );
  }

  const clickCancel = (evt) => {
    setNewServer(false);
  };

  if (context.anon) {
    return <LoginRequired />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className={"form-group"}>
          <label htmlFor="name">Agent server</label>
          <input
            autoFocus={true}
            required={true}
            id="name"
            name="name"
            className={"form-control"}
          />
        </div>
        <div className={"form-group"}>
          <label htmlFor="port">Port</label>
          <input
            type="number"
            required={true}
            id="port"
            name="port"
            className={"form-control"}
          />
        </div>
        <div className={"form-group"}>
          <label htmlFor="port">Credentials</label>
          <input
            required={true}
            id="credentials"
            name="credentials"
            className={"form-control"}
          />
        </div>
        <button className="ml-1 btn btn-default" type={"submit"}>
          Create
        </button>
        <button
          className="ml-1 btn btn-danger"
          onClick={(evt) => clickCancel(evt)}
        >
          Cancel
        </button>
        <button
          className="ml-1 btn btn-success"
          onClick={(evt) => clickTestConnection(evt)}
        >
          Test Connection
        </button>
      </form>
    </div>
  );
}
