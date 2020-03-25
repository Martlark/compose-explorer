import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class Server extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, result: {}, deleteConfirm: false, deleted: false};
        this.value = React.createRef(props.item.value);
        this.state.href = `/container/${this.state.item.server_id}/${this.state.item.name}`;
    }

    static propTypes = {
        item: PropTypes.object.isRequired
    };

    render() {
        return (
            <tr>
                <td>{this.state.item.labels["com.docker.compose.project"]}</td>
                <td><a href={this.state.href}>{this.state.item.name}</a></td>
                <td>{this.state.item.status}</td>
            </tr>)
    }
}

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {items: [], add: false, message: '', filter: '', id: $("input[name=server-id]").val()};
    }

    updateState = (data) => {
        this.setState(data)
    };

    getItems() {
        return $.getJSON(`/proxy/container/${this.state.id}/list`
        ).then(result => {
                const items = [];
                result.forEach(data => {
                    data.server_id = this.state.id;
                    items.push(data)
                });
                items.sort((l, r) => l.labels["com.docker.compose.project"].localeCompare(r.labels["com.docker.compose.project"]));

                this.setState({items});

            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting containers: ${textStatus} - ${errorThrown}`})
        );
    }

    componentDidMount() {
        this.getItems().then(result => {
        })
    }

    renderMessage(className) {
        if (this.state && this.state.message) {
            return <h3 className="{className} alert alert-warning">{this.state.message}</h3>
        }
        return null;
    }

    render() {
        return (<div>
                <div className={"columns-1-2-4"}>
                </div>
                <table className={"table"}>
                    <thead>
                    <tr>
                        <th>Project</th>
                        <th>Service</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.items.map((item) => <Server key={item.id}
                                                            updateState={this.updateState}
                                                            item={item}/>)
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
