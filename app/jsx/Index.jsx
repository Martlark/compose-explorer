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
import UserAdmin, {route as userAdminRoute} from "./admin/user/UserAdmin";
import UserProfile from "./auth/UserProfile";

import ApiService from "./services/ApiService";
import GroupAdmin from "./admin/group/GroupAdmin";
import GroupEdit from "./admin/group/GroupEdit";
import NotFound from "./NotFound";
import AuditAdmin, {route as auditAdminRoute} from "./admin/audit/AuditAdmin";


export function AppProvider() {
    const [projects, setProjects] = useState([]);
    const [serverId, setServerId] = useState(0);
    const [serverName, setServerName] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [anon, setAnon] = useState(window.g?.anon);
    const [admin, setAdmin] = useState(window.g?.admin);
    const [userId, setUserId] = useState(window.g?.id);

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
        setAdmin,
        userId,
        setUserId,
    }

    return (<AppContext.Provider value={state}>
        <Router>
            <Navigation/>
            <ContextMessage message={message}/>
            <ContextErrorMessage message={errorMessage}/>
            <div className={"container-fluid"}>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route exact path="/server/:id" component={ManageServer}/>
                    <Route exact path="/server/:id/project/:project" component={Project}/>
                    <Route exact path="/server/:id/container/:name" component={ManageContainer}/>
                    <Route exact path="/server/:id/container_file_edit/:name" component={FileEdit}/>
                    <Route exact path="/server/:id/container_log/:name" component={LogContent}/>
                    <Route exact path="/login/" component={Login}/>
                    <Route exact path="/logout/" component={Logout}/>
                    <Route exact path={userAdminRoute} component={UserAdmin}/>
                    <Route exact path={auditAdminRoute} component={AuditAdmin}/>
                    <Route exact path="/groups/" component={GroupAdmin}/>
                    <Route exact path="/group/:id" component={GroupEdit}/>
                    <Route exact path="/profile/" component={UserProfile}/>
                    <Route component={NotFound}/>
                </Switch>
            </div>
        </Router>
    </AppContext.Provider>)
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
