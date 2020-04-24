import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class Service extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, result: {}, deleteConfirm: false, deleted: false};
        this.state.href = `/container/${props.server_id}/${this.state.name}`;
    }

    static propTypes = {
        name: PropTypes.object.isRequired,
        details: PropTypes.object.isRequired,
        server_id: PropTypes.object.isRequired
    };

    render() {
        return (
            <tr>
                <td>{this.state.details.labels["com.docker.compose.project"]} -</td>
                <td><a href={this.state.href}>{this.state.name}</a></td>
                <td>{this.state.details.status}</td>
            </tr>)
    }
}

class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, server_id:props.details.server_id, services: props.services, name: props.details.name};
    }

    static propTypes = {
        name: PropTypes.object.isRequired,
        details: PropTypes.object.isRequired
    };

    render() {
        return (
            <div>
                <h2>{this.state.name}</h2>
                <table className={"table"}>
                    <thead>
                    <tr>
                        <th>Project</th>
                        <th>Service</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>

                    {this.state.services.map(service => <Service key={service.id}
                                                                 server_id={this.state.server_id}
                                                                 updateState={this.updateState}
                                                                 name={service.name}
                                                                 details={service}/>)}
                    </tbody>
                </table>
            </div>)
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
        return $.getJSON(`/proxy/projects/${this.state.id}`
        ).then(result => {
                const items = [];
                result.forEach(data => {
                    data.server_id = this.state.id;
                    items.push(data)
                });
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
                    {this.state.items.map(item => <Project key={item.name}
                                                           updateState={this.updateState}
                                                           details={item}
                                                           services={item.services}/>)
                    }
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
