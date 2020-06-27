import React, {Component} from "react";
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {ApiService, AppContext, ErrorMessage, Message} from './context'

import {ManageServer} from "./server"
import {ManageContainer} from "./container"
import Redirect from "react-router-dom/es/Redirect";
import {FileEdit} from "./container_edit_file";
import LogContent from "./container_log";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {items: []};
    }

    static contextType = AppContext;

    componentDidMount() {
        this.context.api.json('/servers').then(items =>
            this.setState({items})
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setMessage(`${xhr.responseText}`)
        ).always(() => {
            this.context.setMessage(`${this.state.items.length} servers`);
        })
    }

    render() {
        return (<table className={"table"}>
            <thead>
            <tr>
                <th>Docker Server</th>
                <th>Containers</th>
            </tr>
            </thead>

            <tbody>
            {this.state.items.map(item =>
                <tr>
                    <td>
                        <Link to={`/r/server/${item.id}?name=${item.name}`}>{item.name}</Link>
                    </td>
                    <td>
                        {item.summary.containers}
                    </td>
                </tr>)}
            </tbody>
        </table>)
    }
}


class AppProvider extends Component {
    state = {
        api: new ApiService(),
        message: '',
        errorMessage: '',
        setMessage: (message) => this.setState({message}),
        setErrorMessage: (errorMessage) => this.setState({errorMessage}),
    }

    render() {
        return (<AppContext.Provider value={this.state}>
            <Message message={this.state.message}/>
            <ErrorMessage message={this.state.errorMessage}/>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route path="/r/server/:id" component={ManageServer}/>
                    <Route path="/r/container/:id/:name" component={ManageContainer}/>
                    <Route path="/r/container_file_edit/:id/:name" component={FileEdit}/>
                    <Route path="/r/container_log/:id/:name" component={LogContent}/>
                </Switch>
            </Router>
        </AppContext.Provider>)
    }
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
