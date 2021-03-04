import React, {useContext, useEffect, useState} from 'react'
import Collapsible from 'react-collapsible'
import Directory from './directory'
import Execute from './execute'
import LogContent from './container_log'
import {AppContext} from "./context";
import {ServiceStatus} from "./ProjectService";

export default function ManageContainer(props) {
    const [message, setMessage] = useState('');
    const id = props.match.params.id;
    const name = props.match.params.name;
    const [status, setStatus] = useState('');
    const [actioning, setActioning] = useState('');
    const hrefLog = `/server/${props.match.params.id}/container_log/${props.match.params.name}`;

    const actions = [{cmd: 'stop', icon: 'stop'}, {cmd: 'start', icon: 'play_arrow'}, {
        cmd: 'restart',
        icon: 'replay'
    }];
    const context = useContext(AppContext)

    useEffect(() => {
        getContainerProps();
    }, [props]);

    function getContainerProps() {
        context.api.container(id, name).then(result => {
                setStatus(result.status);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting container: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    function renderMessage() {
        if (message) {
            return <h3 className="alert alert-warning">{message}</h3>
        }
        return null;
    }

    function clickAction(evt, action) {
        evt.preventDefault();
        setActioning(action);
        context.api.proxyPost(`/container/${id}/${action}`, {name: name}
        ).then(result => {
                setMessage(`container: ${result.status}`);
                setStatus(result.status);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error with action: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => {
            setActioning('');
        });
    }


    function clickDownloadLogs() {
        const filename = 'logs.txt';

        return context.api.proxyPost(`/proxy/container/${id}/logs`, {
                name: name,
                filename,
            }
        ).then((result) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([result]));
                a.download = filename;
                a.click();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderActions() {
        if (actioning) {
            return <p>Action under way</p>
        }

        return (
            <ul className="list-inline">
                <li key='logs' className={"list-inline-item"}>
                    <button className={'btn btn-sm'} onClick={() => window.open(hrefLog)} title={"Logs"}>
                        Logs <span className="material-icons">assignment</span>
                    </button>
                </li>
                <li key='download' className={"list-inline-item"}>
                    <button className={'btn btn-sm'} onClick={() => clickDownloadLogs()} title={"Download logs"}>
                        Download Logs <span className="material-icons">texture</span>
                    </button>
                </li>
                {actions.map(action => renderActionListItem(action))}
            </ul>
        )
    }

    function renderActionListItem(action) {
        const style = {textTransform: "capitalize"};

        return <li key={action.cmd} className={"list-inline-item"}>
            <button style={style} className={"btn btn-sm"}
                    onClick={evt => clickAction(evt, action.cmd)}>{action.cmd}<span
                className="material-icons">{action.icon}</span></button>
        </li>
    }

    function renderExecute() {
        return <Collapsible trigger="Execute">
            <Execute id={id} name={name}/>
        </Collapsible>
    }

    function renderStatus() {

        return (
            <h3 title={"status"}>{name}: <ServiceStatus status={status}/>
            </h3>);
    }

    function renderDirectory() {
        return <div>
            <Collapsible trigger="Directory">

                <Directory
                    id={id}
                    pwd={'.'}
                    name={name}
                />
            </Collapsible>
        </div>
    }

    function renderLog() {
        return <div>
            <Collapsible trigger="Logs">

                <LogContent id={id}
                            name={name}/>
            </Collapsible>
        </div>
    }

    return (
        <div>
            {renderStatus()}
            {renderMessage()}
            {renderActions()}
            {renderExecute()}
            {renderDirectory()}
            {renderLog()}
        </div>
    )
}
