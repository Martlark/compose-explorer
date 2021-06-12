import React, {useState} from "react";
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {AppContext, ContextErrorMessage, ContextMessage} from './context'

import ManageServer from "./server/ManageServer"
import ManageContainer from "./server/ManageContainer"
import FileEdit from "./server/FileEdit";
import LogContent from "./server/LogContent";
import Home from "./Home";
import Project from "./server/Project";
import {Navigation} from "./Navigation";
import {Login} from "./auth/Login";
import {Logout} from "./auth/Logout";
import UserAdmin from "./admin/UserAdmin";
import UserProfile from "./auth/UserProfile";

import ApiService from "./services/ApiService";


export function AppProvider() {
    const [projects, setProjects] = useState([]);
    const [serverId, setServerId] = useState(0);
    const [serverName, setServerName] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [anon, setAnon] = useState(window.g?.anon);
    const [admin, setAdmin] = useState(window.g?.admin);

    const state = {
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
        setAdmin
    }

    return (<AppContext.Provider value={state}>
        <Router>
            <Navigation/>
            <ContextMessage message={message}/>
            <ContextErrorMessage message={errorMessage}/>
            <div className={"container"}>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route exact path="/server/:id" component={ManageServer}/>
                    <Route path="/server/:id/project/:project" component={Project}/>
                    <Route exact path="/server/:id/container/:name" component={ManageContainer}/>
                    <Route exact path="/server/:id/container_file_edit/:name" component={FileEdit}/>
                    <Route exact path="/server/:id/container_log/:name" component={LogContent}/>
                    <Route exact path="/login/" component={Login}/>
                    <Route exact path="/logout/" component={Logout}/>
                    <Route exact path="/admin/" component={UserAdmin}/>
                    <Route exact path="/profile/" component={UserProfile}/>
                </Switch>
            </div>
        </Router>
    </AppContext.Provider>)
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
