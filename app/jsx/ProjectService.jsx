import React, {Component} from "react";
import {AppContext} from "./context";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";


export class ProjectService extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, result: {}, deleteConfirm: false, actioning: '', message: ''};
        this.state.hrefLog = `/r/container_log/${props.server_id}/${this.state.name}`;
        this.state.hrefContainer = `/r/container/${props.server_id}/${this.state.name}`;
        this.actions = ['stop', 'start', 'restart'];
    }
    static contextType = AppContext;

    clickAction = (evt, action) => {
        evt.preventDefault();
        this.setState({actioning: action.action});
        return this.context.api.proxyPost(`/container/${this.state.server_id}/${action.action}`, {
                name: this.state.name,
            }
        ).then(result =>
            this.setState({message: `container: ${result.status}`, status: result.status})
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error with action: ${textStatus} - ${errorThrown}`)
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
                    <a href={this.state.hrefLog} title="Logs"><span className="material-icons">assignment</span></a>
                    <Link to={this.state.hrefContainer} title="Manage container">{this.state.name}</Link>
                    {this.renderMessage()}
                </td>
                <td>{this.state.status}</td>
                <td>{this.renderActions()}</td>
            </tr>)
    }
}
