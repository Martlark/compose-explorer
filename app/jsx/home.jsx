import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AppContext} from './context';
import {NewServerForm} from './new-server-form'
import {confirmAlert} from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export default function Home(props) {
    const [servers, setServers] = useState([]);
    const [newServer, setNewServer] = useState(false);
    const context = useContext(AppContext);

    const getItems = () => {

        return context.api.json('/servers', {_: new Date().getTime()}).then(items => {
                if (!items || items.length < 1) {
                    setServers([]);
                    setNewServer(true);
                    context.setErrorMessage('No active servers found.  Add a server.');
                } else {
                    setServers(items);
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }

    useEffect(() => {
        context.setServerId(null);
        getItems().then(() =>
            context.setMessage(`${items.length} servers`));
    }, []);

    const clickAddServer = () => {
        setNewServer(true);
    }

    const clickDeleteServer = (item) => {
        confirmAlert({
            title: 'Confirm delete',
            message: 'Are you sure?',
            buttons: [
                {
                    label: 'Delete',
                    onClick: () => context.api.delete(`/server/${item.id}`).then(item => {
                            Promise.resolve()
                                .then(() => context.setMessage(`Deleted ${item.name}`))
                                .then(() => getItems())
                        }
                    ).fail((xhr, textStatus, errorThrown) =>
                        context.setErrorMessage(`${xhr.responseText}`)
                    )
                },
                {
                    label: 'No',
                }
            ]
        });
    }

    if (newServer) {
        return <NewServerForm setNewServer={setNewServer} getItems={getItems}/>
    }

    return (<div>
        <button className={"btn-primary btn-sm"} onClick={evt => clickAddServer()}>Add Server</button>
        <table className={"table"}>
            <thead>
            <tr>
                <th></th>
                <th>Docker Server</th>
                <th>Containers</th>
            </tr>
            </thead>

            <tbody>
            {servers.map(item =>
                <tr>
                    <td>
                        <button className={"btn-sm btn-danger"} onClick={() => clickDeleteServer(item)}>Delete</button>
                    </td>
                    <td>
                        <Link to={`/server/${item.id}`}>{item.name}</Link>
                    </td>
                    <td>
                        {item.summary.containers || item.summary.error}
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    </div>)
}
