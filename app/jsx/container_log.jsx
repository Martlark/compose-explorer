import React, {Component} from 'react'
import BootstrapInput from "bootstrap-input-react";
import {AppContext} from "./context";

function LogEntry(props) {
    const parts = props.item.split(' ')[0].split('.')[0].split('T');
    if (parts.length < 2) {
        return null;
    }
    const datePart = parts[0];
    const timePart = parts[1];
    const text = props.item.substr(props.item.split(' ')[0].length);

    return (
        <tr key={props.item}>
            <td>{datePart} {timePart}</td>
            <td>{text}</td>
        </tr>)
}

export default class LogContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            message: '',
            tail: 100,
            autoUpdate: false,
            id: props.id || this.props.match.params.id,
            name: props.name || this.props.match.params.name
        };
    }

    static contextType = AppContext;

    getLogs() {
        return this.context.api.proxyGet(`/container/${this.state.id}/logs`, {
                name: this.state.name,
                tail: this.state.tail
            }
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
            this.context.setErrorMessage(`Error getting log: ${textStatus} - ${errorThrown}`)
        );
    }

    updateState = (data) => {
        this.setState(data)
    };

    componentDidMount() {
        this.context.api.container(this.state.id, this.state.name).then(result => {
                this.setState({status: result.status, container: result});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting container: ${textStatus} - ${errorThrown}`)
        );

        this.refreshLogsInteval = setInterval(() => {
            if (this.state.autoUpdate) {
                this.getLogs();
            }
        }, 10000);
        this.getLogs();
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
                <BootstrapInput name="tail" type="number" min="1" parent={this} label="Tail:"/>
                <BootstrapInput name="autoUpdate" type="checkbox" parent={this} label="Auto update:"/>
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
