import React, {useEffect, useState} from "react";

export default function TempMessage(props) {
    const [style, setStyle] = useState({display: "None"});
    const timeout = props.timeout || 3000;
    const message = props.message;
    const setMessage = props.setMessage;
    const fadeOut = {
        opacity: 0,
        width: 0,
        height: 0,
        transition: "width 0.5s 0.5s, height 0.5s 0.5s, opacity 0.5s"
    };
    const fadeIn = {
        opacity: "1",
        width: "100px",
        height: "100px",
        transition: "width 0.5s, height 0.5s, opacity 0.5s 0.5s"
    };

    useEffect(() => {
        if (!message) {
            setStyle(fadeOut);
        } else {
            setStyle(fadeIn);
            setTimeout(() => setMessage(''), timeout);
        }
    }, [message]);
    return (<span className={"alert alert-warning"} style={style}>{message}</span>);
}
