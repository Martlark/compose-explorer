import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AppContext} from './context';
import {NewServerForm} from './new-server-form'
import InlineConfirmButton from "react-inline-confirm";

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
                    context.setErrorMessage('');
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }

    useEffect(() => {
        context.setServerId(null);
        getItems().then((items) =>
            context.setMessage(`${servers.length} servers`));
    }, []);

    const clickAddServer = () => {
        setNewServer(true);
    }

    const clickDeleteServer = (item) => {
        context.api.delete(`/server/${item.id}`).then(response => {
                context.setMessage(`Deleted ${response.item.name}`, () => getItems())
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }

    if (newServer) {
        return <NewServerForm setNewServer={setNewServer} getItems={getItems}/>
    }

    return (<div>
        <button className={"btn-primary btn-sm"} onClick={evt => clickAddServer()}>Add Server</button>
        <table className={"table"}>
            <thead>
            <tr>
                <th>&nbsp;</th>
                <th>Docker Server</th>
                <th>Containers</th>
            </tr>
            </thead>

            <tbody>
            {servers.map(item =>
                <tr>
                    <td>
                        <InlineConfirmButton className={"btn-sm btn-danger"}
                                             textValues={['Delete', 'Confirm', 'Deleting']} showTimer
                                             onClick={() => clickDeleteServer(item)}/>
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
