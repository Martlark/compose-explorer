import React, {Component} from "react";
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {ApiService, AppContext, ErrorMessage, Message} from './context'

import {ManageServer} from "./server"
import {ManageContainer} from "./container"
import {FileEdit} from "./container_edit_file";
import LogContent from "./container_log";
import Home from "./home";
import {Project} from "./project";
import {Nav} from "./nav";


class AppProvider extends Component {
    state = {
        api: new ApiService(),
        message: '',
        errorMessage: '',
        projects: [],
        server_id: -1,
        server_name: '',
        setProjects: (projects) => this.setState({projects}),
        setServerId: (id) => this.setState({server_id:id}),
        setServerName: (name) => this.setState({server_name:name}),
        setMessage: (message) => this.setState({message}),
        setErrorMessage: (errorMessage) => this.setState({errorMessage}),
    }

    render() {
        return (<AppContext.Provider value={this.state}>
            <Router>
                <Nav/>
                <Message message={this.state.message}/>
                <ErrorMessage message={this.state.errorMessage}/>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route path="/r/server/:id" component={ManageServer}/>
                    <Route path="/r/project/:id/:project" component={Project}/>
                    <Route path="/r/container/:id/:name" component={ManageContainer}/>
                    <Route path="/r/container_file_edit/:id/:name" component={FileEdit}/>
                    <Route path="/r/container_log/:id/:name" component={LogContent}/>
                </Switch>
            </Router>
        </AppContext.Provider>)
    }
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
