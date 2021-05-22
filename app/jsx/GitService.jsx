import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./context";

export function GitService(props) {
    const [resultLog, setResultLog] = useState([]);
    const [message, setMessage] = useState('');
    const [actioning, setActioning] = useState('');
    const [working_dir, setWorking_dir] = useState(props.working_dir);
    const context = useContext(AppContext);

    const actions = ['pull', 'fetch', 'status', 'log'];

    useEffect(() => {
        getStatus();
    }, [props]);

   function prependResultLog(element){
        setResultLog(Array.of(element, ...resultLog));
    }

    function getStatus() {
        return context.api.proxyGet(`/git/${props.server_id}`, {working_dir: working_dir}
        ).then(result => {
                prependResultLog(result.result);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting project git status: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    const clickAction = (evt, action) => {
        evt.preventDefault();

        setActioning(action.action);
        if (action.action === 'status') {
            getStatus().always(() => {
                setActioning('');
            });
        } else {
            return context.api.proxyPost(`/git/${props.server_id}/${action.action}/`, {working_dir: working_dir}
            ).then(result => {
                    setMessage(`${action.action}`);
                    prependResultLog(result);
                }
            ).fail((xhr, textStatus, errorThrown) =>
                setMessage(`Error with action: ${xhr.responseText} - ${errorThrown}`)
            ).always(() => {
                setActioning('');
            });
        }
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

    function renderResultLog() {
        let index = 1;
        return resultLog.map(result =>
            <tr key={`result-${index++}`}>
                <td><pre>{result}</pre></td>
            </tr>)
    }

    return (<div>
        <table>
            <tr>
                <td>
                    {renderMessage()}
                </td>
            </tr>
            <tr>
                <td>{renderActions()}</td>
            </tr>
        </table>
        <table>
            {renderResultLog()}
        </table>
    </div>)
}
