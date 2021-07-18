import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "../context";
import TempMessage from "../TempMessage";

function ResultLog(props) {
    return props.resultLog.map((result, index) =>
        <tr key={`result-${index}`}>
            <td><h3>{result.title}</h3>
                <pre>{result.result}</pre>
            </td>
        </tr>)
}

/***
 * component to show the results of and to send actions to the agent
 * first action of props.action is initiated on component load
 *
 * Actions: git, docker-compose
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function AgentAction(props) {
    const [resultLog, setResultLog] = useState([]);
    const [tempMessage, setTempMessage] = useState('');
    const [actioning, setActioning] = useState('');
    const [working_dir, setWorking_dir] = useState(props.working_dir);
    const context = useContext(AppContext);
    const actions = props.actions;

    useEffect(() => {
        clickAction(null, {action: props.actions[0]});
    }, [props]);

    function prependResultLog(element) {
        setResultLog(Array.of(element, ...resultLog));
    }

    const clickAction = (evt, action) => {
        evt?.preventDefault();

        if (action.action === 'clear') {
            setResultLog([]);
            return;
        }
        setActioning(action.action);
        return context.api.proxyPost(`/agent/${props.service}/${props.server_id}/${action.action}/`, {working_dir: working_dir}
        ).then(result => {
                prependResultLog({title: action.action, result: result});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error with ${action.action} action: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => {
            setActioning('');
        });
    }

    function renderActions() {
        if (!props.server.write) {
            return <p>Server group write required</p>
        }
        if (actioning) {
            return <p>Action: {actioning}, under way <progress/>
            </p>
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

    return (<div>
        <table>
            <tr>
                <td>
                    <TempMessage message={tempMessage} setMessage={setTempMessage}/>
                </td>
            </tr>
            <tr>
                <td>{renderActions()}</td>
            </tr>
        </table>
        <table>
            <ResultLog resultLog={resultLog}/>
        </table>
    </div>)
}
