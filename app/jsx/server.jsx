import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import $ from "jquery"

class Service extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, result: {}, deleteConfirm: false, actioning: '', message: ''};
        this.state.hrefLog = `/container_log/${props.server_id}/${this.state.name}`;
        this.state.hrefContainer = `/container/${props.server_id}/${this.state.name}`;
        this.actions = ['stop', 'start', 'restart'];
    }

    clickAction = (evt, action) => {
        evt.preventDefault();
        this.setState({actioning: action.action});
        return $.post(`/proxy/container/${this.state.server_id}/${action.action}`, {
                name: this.state.name,
                csrf_token: $("input[name=base-csrf_token]").val()
            }
        ).then(result =>
            this.setState({message: `container: ${result.status}`, status: result.status})
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error with action: ${textStatus} - ${errorThrown}`})
        ).always(() => {
            this.setState({actioning: ''});
        });
    }

    renderActions() {
        if (this.state.actioning) {
            return <p>Action under way</p>
        }
        return <ul className="list-inline">{this.actions.map(action => this.renderActionListItem(action))}</ul>
    }

    renderActionListItem(action) {
        const style = {textTransform: "capitalize"};

        return <li key={action} className={"list-inline-item"}>
            <a style={style} href="#"
               onClick={evt => this.clickAction(evt, {action})}>{action}</a>
        </li>
    }

    renderMessage() {
        if (this.state.message) {
            return <p className={"alert"}>{this.state.message}</p>
        }
        return null;
    }

    static propTypes = {
        name: PropTypes.object.isRequired,
        details: PropTypes.object.isRequired,
        server_id: PropTypes.object.isRequired
    };

    render() {
        return (
            <tr>
                <td>
                    <a href={this.state.hrefLog} title={"Logs"}><span className="material-icons">assignment</span></a>
                    <a href={this.state.hrefContainer} title={"Manage container"}>{this.state.name}</a>
                    {this.renderMessage()}
                </td>
                <td>{this.state.status}</td>
                <td>{this.renderActions()}</td>
            </tr>)
    }
}

class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            dirty: false,
            server_id: props.details.server_id,
            services: props.services,
            name: props.details.name
        };
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
                        <th className="w-50">Service</th>
                        <th className="w-25">Status</th>
                        <th className="w-25">Actions</th>
                    </tr>
                    </thead>
                    <tbody>

                    {this.state.services.map(service => <Service key={service.id}
                                                                 server_id={this.state.server_id}
                                                                 updateState={this.updateState}
                                                                 name={service.name}
                                                                 details={service}
                                                                 status={service.status}/>)}
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
