import React, {useEffect, useRef, useState} from "react";
import useTimeout from "use-timeout";

export default function TempMessage(props) {
    const [styleCloseButton, setStyleCloseButton] = useState({position: 'inherit'});
    const timeout = props.timeout || 3000;
    const message = props.message;
    const setMessage = props.setMessage;
    const ref = useRef();
    const closeButton = <a href="#" title="close" className="close" aria-label="Close"
                           aria-hidden="true">&times;</a>;

    useTimeout(() => {
        $(ref.current).fadeOut()
    }, timeout);

    useEffect(() => {
        if (!message) {
            $(ref.current).fadeOut();
        } else {
            $(ref.current).fadeIn();
        }
    }, [message]);
    if (!message) {
        return null;
    }
    return <div ref={ref} role="alert">{closeButton}<p className="alert alert-warning"
                                                      style={styleCloseButton}>{message}</p></div>;
}
