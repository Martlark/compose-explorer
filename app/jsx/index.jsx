import React, {Component} from "react";
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {ApiService, AppContext} from './context'

import {ManageServer} from "./server"
import {ManageContainer} from "./container"

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {items: [], message: ''};
    }

    static contextType = AppContext;

    componentDidMount() {
        this.context.api.json('/servers').then(items =>
            this.setState({items})
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `${xhr.responseText}`})
        );
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
                        <Link to={`/server/${item.id}`}>{item.name}</Link>
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
        api: new ApiService()
    }

    render() {
        return (<AppContext.Provider value={this.state}>
            <h1>{this.state.name}</h1>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Route path="/server/:id" component={ManageServer}/>
                    <Route path="/container/:id/:name" component={ManageContainer}/>
                </Switch>
            </Router>
        </AppContext.Provider>)
    }
}

ReactDOM.render(<AppProvider/>, document.getElementById('jsx_content'));
