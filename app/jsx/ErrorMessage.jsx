import React from "react";

export default function renderErrorMessage(props) {
    const key = props?.key ?? Math.random();
    const {errorMessage, setErrorMessage} = props;

    const style = {position: 'inherit'}
    const closeButton = <a href="#" title="close" className="close" aria-label="Close"
                           aria-hidden="true">&times;</a>;
    if (!errorMessage) {
        return null;
    }

    return (<div key={key} role="alert">
        {closeButton}
        <div style={style} className="alert alert-danger">{errorMessage}</div>
    </div>);
}