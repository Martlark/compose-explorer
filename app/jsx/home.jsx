import React, {Component} from "react";
import {Link} from "react-router-dom";
import {AppContext} from './context';

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {items: []};
    }

    static contextType = AppContext;

    componentDidMount() {
        this.context.setServerId(null);

        this.context.api.json('/servers').then(items =>
            this.setState({items})
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`${xhr.responseText}`)
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
                        <Link to={`/r/server/${item.id}`}>{item.name}</Link>
                    </td>
                    <td>
                        {item.summary.containers}
                    </td>
                </tr>)}
            </tbody>
        </table>)
    }
}
