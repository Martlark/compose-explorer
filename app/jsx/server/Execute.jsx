import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context";

function ExecEntry(props) {
  const clickCmd = (evt) => {
    evt.preventDefault();
    props.setCommand(props.entry.cmd);
  };

  function renderActions() {
    if (!props.server?.write) {
      return null;
    }

    const actionRemove = (
      <a
        href={"javascript:"}
        title={"Remove from history"}
        onClick={(evt) => props.clickExecDelete(evt, props.entry.id)}
      >
        <span className="material-icons">delete_forever</span>
      </a>
    );

    if (props.status !== "running") {
      return actionRemove;
    }

    return (
      <>
        <a
          href={"javascript:"}
          title={"Re-run command"}
          onClick={(evt) => props.clickExec(evt, props.entry.cmd)}
        >
          <span className="material-icons">directions_run</span>
        </a>
        {actionRemove}
      </>
    );
  }

  return (
    <tr key={props.id}>
      <td className={"w-25"}>{renderActions()}</td>
      <td className={"w-25"}>
        <a
          href={"javascript:"}
          title={"Edit command string"}
          onClick={(evt) => clickCmd(evt)}
        >
          {props.entry.cmd}
        </a>
      </td>
      <td className={"w-50"} title={`${props.entry.naturaldelta} ago`}>
        <pre>{props.entry.result}</pre>
      </td>
    </tr>
  );
}

export default function Execute(props) {
  const id = props.id;
  const name = props.name; // container name
  const [executing, setExecuting] = useState(false);
  const [command, setCommand] = useState("");
  const [commandEntries, setCommandEntries] = useState([]);

  const context = useContext(AppContext);

  useEffect(() => {
    getCommandEntries();
  }, [props.id]);

  function getCommandEntries() {
    context.api
      .command("GET", { container_name: props.name })
      .then((result) => setCommandEntries(result))
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error getting commands: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  function clickExec(evt, p_command = null) {
    const cmd = p_command || command;
    setExecuting(true);
    setCommand(cmd);
    return context.api
      .proxyPost(`/container/${id}/exec_run/`, {
        name: name,
        cmd: cmd,
      })
      .then((cmd_result) => {
        return context.api
          .command("POST", {
            result: cmd_result,
            cmd: cmd,
            container_name: name,
          })
          .then((result) => {
            commandEntries.unshift(result);
            setCommandEntries(commandEntries.slice(0));
          });
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error exec_run: ${xhr.responseText} - ${errorThrown}`
        )
      )
      .always(() => setExecuting(false));
  }

  function clickExecDelete(evt, command_id) {
    setExecuting(true);
    return context.api
      .command("DELETE", command_id)
      .then((result) => {
        const entries = commandEntries.filter(
          (command) => command.id !== command_id
        );
        context.setMessage(result.message);
        setCommandEntries(entries);
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error exec delete: ${xhr.responseText} - ${errorThrown}`
        )
      )
      .always(() => setExecuting(false));
  }

  function commandOnKeyUp(evt) {
    if (evt.key === "Enter") {
      clickExec(evt);
    }
  }

  function renderExecutingHeader() {
    if (!props.server.write) {
      return <h3>Server write access required</h3>;
    }

    if (executing) {
      return (
        <div>
          running {command}
          <progress />
        </div>
      );
    }
    if (props.status !== "running") {
      return <h4>Container is not running</h4>;
    }
    return (
      <div>
        <input
          defaultValue={command}
          onChange={(evt) => setCommand(evt.target.value)}
          onKeyUp={(evt) => commandOnKeyUp(evt)}
        />
        <button onClick={(evt) => clickExec(evt)}>
          <span className="material-icons">directions_run</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {renderExecutingHeader()}
      <table className={"table"}>
        <tbody>
          {commandEntries.map((result) => (
            <ExecEntry
              keycmd={result.cmd}
              clickExec={clickExec}
              clickExecDelete={clickExecDelete}
              setCommand={setCommand}
              status={props.status}
              server={props.server}
              entry={result}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
