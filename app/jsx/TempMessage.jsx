import React, {useEffect, useRef, useState} from "react";
import {useTimeout} from "react-use";

export default function TempMessage({timeout=5000, message, setMessage}) {
    const [styleCloseButton, setStyleCloseButton] = useState({position: 'inherit'});
    const ref = useRef();
    const closeButton = <a href="#" title="close" className="close" aria-label="Close"
                           aria-hidden="true">&times;</a>;

    const [timeoutReady, timeoutCancel, timeoutReset] = useTimeout(timeout);

    useEffect(() => {
        if (!message) {
            timeoutCancel();
            $(ref.current).fadeOut("slow", ()=>{
                if(setMessage){
                    setMessage("");
                }
            });
        } else {
            timeoutReset();
            $(ref.current).fadeIn();
        }
    }, [message]);
    if (!message) {
        return null;
    }

    if( timeoutReady ){
        $(ref.current).fadeOut();
    }

    return <div ref={ref} role="alert">{closeButton}<p className="alert alert-warning"
                                                      style={styleCloseButton}>{message}</p></div>;
}
