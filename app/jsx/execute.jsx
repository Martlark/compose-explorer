import React, {Component} from 'react'
import BootstrapInput from "bootstrap-input-react";
import {AppContext} from "./context";

function ExecEntry(props) {
    const clickCmd = (evt) => {
        evt.preventDefault();
        props.updateState({command: props.entry.cmd});
    }

    return (
        <tr key={props.id}>
            <td className={"w-25"}>
                <a href={'javascript:'} title={'Re-run command'}
                   onClick={evt => props.clickExec(evt, props.entry.cmd)}><span
                    className="material-icons">directions_run</span></a>
                <a href={'javascript:'} title={'Remove from history'}
                   onClick={evt => props.clickExecDelete(evt, props.entry.id)}><span
                    className="material-icons">delete_forever</span></a>
            </td>
            <td className={"w-25"}><a href={'javascript:'} title={'Edit command string'}
                                      onClick={evt => clickCmd(evt)}>{props.entry.cmd}</a></td>
            <td className={"w-50"} title={`${props.entry.naturaldelta} ago`}>
                <pre>{props.entry.result}</pre>
            </td>
        </tr>)
}

export default class Execute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            id: props.id,
            name: props.name,
            command: '',
            commandEntries: [],
        };
    }

    static contextType = AppContext;

    componentDidMount() {
        this.getCommandEntries();
    }

    getCommandEntries() {
        this.context.api.command(
        ).then(result =>
            this.setState({commandEntries: result})
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting commands: ${xhr.responseText} - ${errorThrown}`)
        )
    }

    updateState = (data) => {
        this.setState(data)
    };

    clickExec = (evt, command = null) => {
        const cmd = command || this.state.command;
        this.setState({executing: true, command: cmd}, () => {
            return this.context.api.proxyPost(`/container/${this.state.id}/exec_run`, {
                    name: this.state.name,
                    cmd: cmd,
                }
            ).then(cmd_result => {
                    return this.context.api.command('POST', {
                        result: cmd_result,
                        cmd: cmd,
                    }).then(result => {
                        this.state.commandEntries.unshift(result);
                        this.setState({commandEntries: this.state.commandEntries.slice(0)});
                    })
                }
            ).fail((xhr, textStatus, errorThrown) =>
                this.context.setErrorMessage(`Error exec_run: ${xhr.responseText} - ${errorThrown}`)
            ).always(() => this.setState({executing: false})
            )
        })
    }

    renderMessage(className) {
        if (this.state && this.state.message) {
            return <h3 className="{className} alert alert-warning">{this.state.message}</h3>
        }
        return null;
    }

    clickExecDelete = (evt, command_id) => {
        this.setState({executing: true});
        return this.context.api.command('DELETE', command_id
        ).then(
            result => {
                const commandEntries = this.state.commandEntries.filter(command =>
                    command.id !== command_id
                );
                this.context.setMessage(result.message)
                this.setState({commandEntries})
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error exec delete: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => this.setState({executing: false})
        )
    }

    render() {
        return <div>
            <BootstrapInput name={"command"} parent={this}/>
            <button onClick={(evt) => this.clickExec(evt)}><span className="material-icons">directions_run</span>
            </button>
            <table className={"table"}>
                <tbody>
                {this.state.commandEntries.map(result => <ExecEntry keycmd={result.cmd} clickExec={this.clickExec}
                                                                    clickExecDelete={this.clickExecDelete}
                                                                    updateState={this.updateState}
                                                                    entry={result}/>)}
                </tbody>
            </table>
        </div>
    }
}
