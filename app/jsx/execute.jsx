import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "./context";

function ExecEntry(props) {
    const clickCmd = (evt) => {
        evt.preventDefault();
        props.setCommand(props.entry.cmd);
    }

    return (
        <tr key={props.id}>
            <td className={"w-25"}>
                <a href={'javascript:'} title={'Re-run command'}
                   onClick={evt => props.clickExec(evt, props.entry.cmd)}><span
                    className="material-icons">directions_run</span></a>
                <a href={'javascript:'} title={'Remove from history'}
                   onClick={evt => props.clickExecDelete(evt, props.entry.id)}><span
                    className="material-icons">delete_forever</span></a>
            </td>
            <td className={"w-25"}><a href={'javascript:'} title={'Edit command string'}
                                      onClick={evt => clickCmd(evt)}>{props.entry.cmd}</a></td>
            <td className={"w-50"} title={`${props.entry.naturaldelta} ago`}>
                <pre>{props.entry.result}</pre>
            </td>
        </tr>)
}

export default function Execute(props) {
    const id = props.id;
    const name = props.name;
    const [executing, setExecuting] = useState(false);
    const [command, setCommand] = useState('');
    const [commandEntries, setCommandEntries] = useState([]);

    const context = useContext(AppContext);

    useEffect(() => {
        getCommandEntries();
    }, [props]);

    function getCommandEntries() {
        context.api.command(
        ).then(result =>
            setCommandEntries(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting commands: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function clickExec(evt, p_command = null) {
        const cmd = p_command || command;
        setExecuting(true);
        setCommand(cmd);
        return context.api.proxyPost(`/container/${id}/exec_run`, {
                name: name,
                cmd: cmd,
            }
        ).then(cmd_result => {
                return context.api.command('POST', {
                    result: cmd_result,
                    cmd: cmd,
                }).then(result => {
                    commandEntries.unshift(result);
                    setCommandEntries(commandEntries.slice(0));
                })
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error exec_run: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => setExecuting(false)
        )
    }

    function clickExecDelete(evt, command_id) {
        setExecuting(true);
        return context.api.command('DELETE', command_id
        ).then(
            result => {
                const entries = commandEntries.filter(command =>
                    command.id !== command_id
                );
                context.setMessage(result.message);
                setCommandEntries(entries);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error exec delete: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => setExecuting(false)
        )
    }

    function commandOnKeyUp(evt) {
        if (evt.key === "Enter") {
            clickExec(evt);
        }
    }

    function renderExecuting() {
        if (executing) {
            return (<div>running {command}</div>)
        }
        return (<div><input
                defaultValue={command}
                onChange={(evt) => setCommand(evt.target.value)}
                onKeyUp={(evt) => commandOnKeyUp(evt)}
            />
                <button onClick={(evt) => clickExec(evt)}><span className="material-icons">directions_run</span>
                </button>
            </div>
        )
    }

    return <div>
        <table className={"table"}>
            <tbody>
            {renderExecuting()}
            {commandEntries.map(result => <ExecEntry keycmd={result.cmd} clickExec={clickExec}
                                                     clickExecDelete={clickExecDelete}
                                                     setCommand={setCommand}
                                                     entry={result}/>)}
            </tbody>
        </table>
    </div>
}
