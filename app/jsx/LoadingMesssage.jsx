import React from "react";


export default function LoadingMessage(props) {
    return <div>
        <h2>Loading...{props.title}</h2>
        <img alt="loading..." src='/static/images/loading.gif'/>
    </div>
}