import React, {useEffect, useState} from "react";

export default function TempMessage(props) {
    const [styleCloseButton, setStyleCloseButton] = useState({position: 'inherit'});
    const timeout = props.timeout || 3000;
    const message = props.message;
    const setMessage = props.setMessage;
    const id = Math.random();
    const closeButton = <a href="#" title="close" className="close" aria-label="Close"
                           aria-hidden="true">&times;</a>;

    useEffect(() => {
        if (!message) {
            $(`#${id}`).fadeOut();
        } else {
            $(`#${id}`).fadeIn();
            setTimeout(() => $(`#${id}`).fadeOut(), timeout);
        }
    }, [message]);
    if(!message){
        return null;
    }
    return (<div id={id} role="alert">{closeButton}<p className="alert alert-warning"
                                                                    style={styleCloseButton}>{message}</p></div>);
}
