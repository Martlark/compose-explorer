import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "./context";

function LogEntry(props) {
    const parts = props.item.split(' ')[0].split('.')[0].split('T');
    if (parts.length < 2) {
        return null;
    }
    const datePart = parts[0];
    const timePart = parts[1];
    const text = props.item.substr(props.item.split(' ')[0].length);

    return (
        <tr key={props.item}>
            <td>{datePart} {timePart}</td>
            <td>{text}</td>
        </tr>)
}

export default function LogContent(props) {
    const [logs, setLogs] = useState([]);
    const [previousLogHash, setPreviousLogHash] = useState('');
    const [tail, setTail] = useState(100);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const id = props.id || props.match.params.id;
    const name = props.name || props.match.params.name;
    let refreshLogsInterval = null

    const context = useContext(AppContext);

    function getLogs() {
        return context.api.proxyGet(`/container/${id}/logs/`, {name,tail}
        ).then(result => {
                if (previousLogHash !== result.hash) {
                    const items = [];
                    result.logs.forEach(data => items.push(data));
                    setPreviousLogHash(result.hash);
                    setLogs(items);
                    if (autoUpdate) {
                        baseView.scrollToBottom();
                    }
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting log: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(() => {
        context.api.container(id, name).then(result => {
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting container: ${xhr.responseText} - ${errorThrown}`)
        );

        refreshLogsInterval = setInterval(() => {
            if (autoUpdate) {
                getLogs();
            }
        }, 10000);
        getLogs();
    }, [props]);

    function clickRefresh(evt) {
        getLogs();
    }

    return (<div>
            <button className={'btn btn-sm'} onClick={evt => clickRefresh(evt)} title={"Refresh"}>
                Refresh <span className="material-icons">replay</span>
            </button>
            <label>Tail:<input name="tail" type="number" defaultValue={tail}
                               onChange={(evt) => setTail(evt.target.value)} min="1"/></label>
            <label>Auto Update: <input name="autoUpdate" defaultValue={autoUpdate}
                                       onClick={(evt) => setAutoUpdate(!autoUpdate)} type="checkbox"/></label>
            <table className={"table table-bordered table-striped"}>
                <thead>
                <tr>
                    <th className={"w-25"}>Time stamp</th>
                    <th className={"w-75"}>&nbsp;</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((item) => <LogEntry key={item}
                                              item={item}/>)
                }
                </tbody>
            </table>
        </div>
    )
}
