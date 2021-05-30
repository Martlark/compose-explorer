import React, {useContext, useEffect, useState} from "react";
import {AppContext} from './context';
import {NewServerForm} from './new-server-form'
import * as PropTypes from "prop-types";
import {ServerConfig} from "./ServerConfig";

ServerConfig.propTypes = {item: PropTypes.any};
export default function Home(props) {
    const [servers, setServers] = useState([]);
    const [newServer, setNewServer] = useState(false);
    const context = useContext(AppContext);

    const getItems = () => {
        return context.api.json('/servers/', {_: new Date().getTime()}).then(items => {
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
        getItems();
    }, []);

    const clickAddServer = () => {
        setNewServer(true);
    }

    function renderNewServer() {
        if (newServer) {
            return <NewServerForm setNewServer={setNewServer} getItems={getItems}/>
        } else {
            return (<button className={"btn-primary btn-sm"} onClick={evt => clickAddServer()}>Add Server</button>)
        }
    }

    return (<div>
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
            {servers.map(item =>
                <ServerConfig item={item} getItems={getItems}/>
            )}
            </tbody>
        </table>
    </div>)
}
