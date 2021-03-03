import React, {useContext, useState} from "react";
import {AppContext} from "./context";
import {Link} from "react-router-dom";

export function ServiceStatus(props) {
    if(!props && !props.status){
        return('');
    }

    let badgeClass = 'warning';
    let text = props.status;
    switch (text) {
        case 'running':
            badgeClass = 'success';
            break;
        case 'exited':
            badgeClass = 'danger';
            break;
        case 'stopped':
            badgeClass = 'warning';
            break;
        default:
            text = 'unknown'
            break;
    }
    return (<span className={`badge badge-${badgeClass}`}>{text}</span>)
}

export function ProjectService(props) {
    const [status, setStatus] = useState(props.status);
    const [message, setMessage] = useState('');
    const [actioning, setActioning] = useState('');
    const context = useContext(AppContext);

    const hrefLog = `/server/${props.server_id}/container_log/${props.name}`;
    const hrefContainer = `/server/${props.server_id}/container/${props.name}`;
    const actions = ['stop', 'start', 'restart'];

    const clickAction = (evt, action) => {
        evt.preventDefault();
        setActioning(action.action);
        return context.api.proxyPost(`/container/${props.server_id}/${action.action}`, {
                name: props.name,
            }
        ).then(result => {
                setMessage(`${action.action}: ${result.status}`);
                setStatus(result.status);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setMessage(`Error with action: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => {
            setActioning('');
        });
    }

    function renderActions() {
        if (actioning) {
            return <p>Action: {actioning}, under way</p>
        }
        return <ul className="list-inline">{actions.map(action => renderActionListItem(action))}</ul>
    }

    function renderActionListItem(action) {
        const style = {textTransform: "capitalize"};

        return <li key={action} className={"list-inline-item"}>
            <a style={style} href="#"
               onClick={evt => clickAction(evt, {action})}>{action}</a>
        </li>
    }

    function renderMessage() {
        if (message) {
            return <p className={"alert alert-info"}>{message}</p>
        }
        return null;
    }

    return (
        <tr>
            <td>
                <a href={hrefLog} title="Logs"><span className="material-icons">assignment</span></a>
                <Link to={hrefContainer} title="Manage container">{props.name}</Link>
                {renderMessage()}
            </td>
            <td><ServiceStatus status={status}/></td>
            <td>{renderActions()}</td>
        </tr>)
}
