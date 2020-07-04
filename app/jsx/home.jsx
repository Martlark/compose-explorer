import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AppContext} from './context';

export default function Home(props) {
    const [servers, setServers] = useState([]);
    const context = useContext(AppContext);

    useEffect(() => {
        context.setServerId(null);

        context.api.json('/servers').then(items => {
                setServers(items);
                context.setMessage(`${items.length} servers`);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }, []);

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
                    {item.summary.containers}
                </td>
            </tr>
        )}
        </tbody>
    </table>)
}
