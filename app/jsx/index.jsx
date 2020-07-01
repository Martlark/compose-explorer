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
        setServerId: (id) => this.setState({server_id: id}),
        setServerName: (name) => this.setState({server_name: name}),
        setMessage: (message) => this.setState({message}),
        setErrorMessage: (errorMessage) => this.setState({errorMessage}),
    }

    render() {
        return (<AppContext.Provider value={this.state}>
            <Router>
                <Nav/>
                <Message message={this.state.message}/>
                <ErrorMessage message={this.state.errorMessage}/>
                <div className={"container"}>
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                        </Route>
                        <Route exact path="/server/:id" component={ManageServer}/>
                        <Route exact path="/server/:id/project/:project" component={Project}/>
                        <Route exact path="/server/:id/container/:name" component={ManageContainer}/>
                        <Route exact path="/server/:id/container_file_edit/:name" component={FileEdit}/>
                        <Route exact path="/server/:id/container_log/:name" component={LogContent}/>
                    </Switch>
                </div>
            </Router>
        </AppContext.Provider>)
    }
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
