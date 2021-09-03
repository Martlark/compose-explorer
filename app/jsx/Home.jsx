import React, { useContext, useEffect, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { AppContext } from "./context";
import { NewServerForm } from "./server/NewServerForm";
import { ServerConfig } from "./server/ServerConfig";

export default function Home(props) {
  const [servers, setServers] = useState([]);
  const [newServer, setNewServer] = useState(false);
  const context = useContext(AppContext);
  const history = useHistory();

  const getItems = () => {
    if (context.anon) {
      setServers([]);
      return;
    }
    return context.api
      .json("/servers/", { _: new Date().getTime() })
      .then((items) => {
        // filter out servers to only those with read
        items = items.filter((item) => item.read);
        if (!items || items.length < 1) {
          setServers([]);
          setNewServer(context.admin && true);
          context.setErrorMessage(
            "No active servers found.  Ask your admin to add you to a group"
          );
        } else {
          setServers(items);
          context.setErrorMessage("");
        }
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(`${xhr.responseText}`)
      );
  };

  useEffect(() => {
    // find if server refresh needs history
    const $request_path = $("input[name=request_path]");
    const $message = $("input[name=message]");
    const requestPathValue = $request_path.val();

    if ($message.val()) {
      context.setMessage($message.val());
      $message.val("");
    }

    if (requestPathValue) {
      $request_path.val("");
      history.push(requestPathValue);
    }
  }, []);

  useEffect(() => {
    getItems();
  }, [context.anon]);

  const clickAddServer = () => {
    setNewServer(true);
  };

  function renderNewServer() {
    if (!context.admin) {
      return null;
    }

    if (newServer) {
      return <NewServerForm setNewServer={setNewServer} getItems={getItems} />;
    } else {
      return (
        <button
          className={"btn-primary btn-sm"}
          onClick={(evt) => clickAddServer()}
        >
          Add Server
        </button>
      );
    }
  }

  if (context.anon) {
    return (
      <div>
        <h1>Authorization is required</h1>
        <NavLink to={`/login/`}>Login</NavLink>
      </div>
    );
  }

  return (
    <div>
      {renderNewServer()}
      <table className={"table"}>
        <thead>
          <tr>
            <th className={"w-20"}>&nbsp;</th>
            <th className={"w-70"}>Docker Server</th>
            <th className={"w-10"}>Containers</th>
          </tr>
        </thead>

        <tbody>
          {servers.map((item) => (
            <ServerConfig item={item} getItems={getItems} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
