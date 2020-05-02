import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

class LogEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {...props, dirty: false, result: {}, deleteConfirm: false, deleted: false};
        this.value = React.createRef(props.item);
        this.state.timeStamp = props.item.split(' ')[0];
        this.state.text = props.item.substr(this.state.timeStamp.length);
    }

    static propTypes = {
        item: PropTypes.object.isRequired
    };

    render() {
        return (
            <tr>
                <td>{this.state.timeStamp}</td>
                <td>{this.state.text}</td>
            </tr>)
    }
}

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            add: false,
            message: '',
            filter: '',
            id: $("input[name=server-id]").val(),
            name: $("input[name=container-name]").val()
        };
        $.getJSON(`/proxy/container/${this.state.id}/get`, {name: this.state.name}
        ).then(result => {
                this.state.status = result.status;
                this.state.project = result.labels["com.docker.compose.project"];
                this.state.service = result.labels["com.docker.compose.service"];
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.state.message = `Error getting container: ${textStatus} - ${errorThrown}`
        );
        this.refreshLogsInteval = setInterval(() => {
            this.getLogs();
        }, 10000);
    }

    getLogs() {
        return $.getJSON(`/proxy/container/${this.state.id}/logs`, {name: this.state.name}
        ).then(result => {
                if (this.previousLogHash !== result.hash) {
                    const items = [];
                    result.logs.forEach(data => items.push(data));
                    this.setState({previousLogHash: result.hash, logs: items});
                    baseView.scrollToBottom();
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting log: ${textStatus} - ${errorThrown}`})
        );
    }

    updateState = (data) => {
        this.setState(data)
    };

    componentDidMount() {
        this.getLogs().then(result => {});
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
                    <tbody>
                    {this.state.logs.map((item) => <LogEntry key={item}
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
