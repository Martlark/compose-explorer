import React, {useContext, useEffect} from "react";

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


// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const
    AppContext = React.createContext({});
