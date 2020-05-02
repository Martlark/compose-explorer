import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import $ from "jquery"

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            id: $("input[name=server-id]").val(),
            name: $("input[name=container-name]").val()
        };
        this.actions = ['stop', 'start', 'restart'];
        $.getJSON(`/proxy/container/${this.state.id}/get`, {name: this.state.name}
        ).then(result =>
            this.setState({
                status: result.status,
                project: result.labels["com.docker.compose.project"],
                service: result.labels["com.docker.compose.service"]
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting container: ${textStatus} - ${errorThrown}`})
        )
    }

    updateState = (data) => {
        this.setState(data)
    };

    renderMessage(className) {
        if (this.state && this.state.message) {
            return <h3 className="{className} alert alert-warning">{this.state.message}</h3>
        }
        return null;
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

    render() {
        return (
            <div>
                <h3>{this.state.status}</h3>
                {this.renderMessage()}
                {this.renderActions()}
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
