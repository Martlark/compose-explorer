import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import $ from "jquery"
import AutoInput from "./AutoInput";

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

export class LogContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            add: false,
            message: '',
            radio: 1,
            tail: 100,
            autoUpdate: true,
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
            if (this.state.autoUpdate) {
                this.getLogs();
            }
        }, 10000);
    }

    getLogs() {
        return $.getJSON(`/proxy/container/${this.state.id}/logs`, {name: this.state.name, tail: this.state.tail}
        ).then(result => {
                if (this.state.previousLogHash !== result.hash) {
                    const items = [];
                    result.logs.forEach(data => items.push(data));
                    this.setState({previousLogHash: result.hash, logs: items});
                    if (this.state.autoUpdate) {
                        baseView.scrollToBottom();
                    }
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
        this.getLogs().then(result => {
        });
    }

    renderMessage(className) {
        if (this.state && this.state.message) {
            return <h3 className="{className} alert alert-warning">{this.state.message}</h3>
        }
        return null;
    }

    clickRefresh = (evt) => {
        this.getLogs();
    }

    render() {
        return (<div>
                <button className={'btn btn-sm'} onClick={evt => this.clickRefresh(evt)} title={"Refresh"}>
                    Refresh <span className="material-icons">replay</span>
                </button>
                <AutoInput name="tail" type="number" min="1" parent={this} label="Tail:"/>
                <AutoInput name="autoUpdate" type="checkbox" parent={this} label="Auto update:"/>
                <table className={"table table-bordered table-striped"}>
                    <thead>
                    <tr>
                        <th className={"w-25"}>Time stamp</th>
                        <th className={"w-75"}>&nbsp;</th>
                    </tr>
                    </thead>
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

ReactDOM.render(<LogContent/>, document.getElementById('jsx_content'));
