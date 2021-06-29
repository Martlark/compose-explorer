import React, {useContext, useEffect, useState} from "react";
import ApiService from "./services/ApiService";

export const ContextErrorMessage = ({message}) => {
    const context = useContext(AppContext);
    if (!message) {
        return null;
    }
    return (<div
        className="alert alert-danger"
        role="alert">
        <a href="#" title="close" className="close" onClick={() => context.setErrorMessage(null)}
           aria-label="Close"
           aria-hidden="true">&times;</a>
        <span id="flash-message">{message}</span>
    </div>)
}

export const ContextMessage = ({message}) => {
    const context = useContext(AppContext);
    useEffect(() => {
        if (message)
            setTimeout(() => context.setMessage(null), 5000);
    }, [message])
    return (message && <h3 className={"alert alert-info"}>{message}</h3>)
}

export function useContextState() {
    const [projects, setProjects] = useState([]);
    const [serverId, setServerId] = useState(Number(localStorage.getItem('serverId')));
    const [serverName, setServerName] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [anon, setAnon] = useState(window.g?.anon);
    const [admin, setAdmin] = useState(window.g?.admin);
    const [userId, setUserId] = useState(window.g?.id);

    return {
        api: new ApiService(),
        projects,
        setProjects,
        serverId,
        setServerId,
        serverName,
        setServerName,
        message,
        setMessage,
        errorMessage,
        setErrorMessage,
        anon,
        setAnon,
        admin,
        setAdmin,
        userId,
        setUserId,
    }
}

// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const
    AppContext = React.createContext({});
