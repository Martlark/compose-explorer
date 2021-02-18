import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AppContext} from './context';
import {NewServerForm} from './new-server-form'

export default function Home(props) {
    const [servers, setServers] = useState([]);
    const [newServer, setNewServer] = useState(false);
    const context = useContext(AppContext);

    useEffect(() => {
        context.setServerId(null);

        context.api.json('/servers').then(items => {
                if(!items || items.length < 1){
                    setServers([]);
                    setNewServer(true);
                    context.setErrorMessage('No active servers found.  Add a server.');
                    return;
                }
                setServers(items);
                context.setMessage(`${items.length} servers`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }, []);

    if(newServer){
        return <NewServerForm />
    }

    return (<table className={"table"}>
        <thead>
        <tr>
            <th>Docker Server</th>
            <th>Containers</th>
        </tr>
        </thead>

        <tbody>
        {servers.map(item =>
            <tr>
                <td>
                    <Link to={`/server/${item.id}`}>{item.name}</Link>
                </td>
                <td>
                    {item.summary.containers || item.summary.error}
                </td>
            </tr>
        )}
        </tbody>
    </table>)
}
