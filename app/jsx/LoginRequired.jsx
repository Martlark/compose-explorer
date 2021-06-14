import {NavLink} from "react-router-dom";
import React from "react";

export default function LoginRequired() {
    return (<div>
        <h1>Authorization is required</h1>
        <NavLink to={`/login/`}>Login</NavLink>
    </div>)

}