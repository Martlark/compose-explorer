import React, {Component} from 'react'
import $ from "jquery"
import BootstrapInput from "bootstrap-input-react";

class ExecEntry extends Component {
    constructor(props) {
        super(props);
    }

    clickCmd = (evt) => {
        evt.preventDefault();
        this.props.updateState({command: this.props.entry.cmd});
    }

    render() {
        return (
            <tr key={this.props.id}>
                <td className={"w-25"}>
                    <a href={'javascript:'} title={'Re-run command'}
                       onClick={evt => this.props.clickExec(evt, this.props.entry.cmd)}><span
                        className="material-icons">directions_run</span></a>
                    <a href={'javascript:'} title={'Remove from history'}
                       onClick={evt => this.props.clickExecDelete(evt, this.props.entry.id)}><span
                        className="material-icons">delete_forever</span></a>
                </td>
                <td className={"w-25"}><a href={'javascript:'} title={'Edit command string'}
                                          onClick={evt => this.clickCmd(evt)}>{this.props.entry.cmd}</a></td>
                <td className={"w-50"} title={`${this.props.entry.naturaldelta} ago`}>
                    <pre>{this.props.entry.result}</pre>
                </td>
            </tr>)
    }
}

export default class Execute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            csrf: $("input[name=base-csrf_token]").val(),
            id: $("input[name=server-id]").val(),
            name: $("input[name=container-name]").val(),
            command: '',
            commandEntries: [],
        };
    }

    componentDidMount() {
        this.getCommandEntries();
    }

    getCommandEntries() {
        $.getJSON(`/command`
        ).then(result =>
            this.setState({commandEntries: result})
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting commands: ${textStatus} - ${errorThrown}`})
        )
    }

    updateState = (data) => {
        this.setState(data)
    };

    clickExec = (evt, command = null) => {
        const cmd = command || this.state.command;
        this.setState({executing: true, command: cmd}, () => {
            return $.post(`/proxy/container/${this.state.id}/exec_run`, {
                    name: this.state.name,
                    csrf_token: this.state.csrf,
                    cmd: cmd,
                }
            ).then(cmd_result => {
                    return $.post(`/command`, {
                        csrf_token: this.state.csrf,
                        result: cmd_result,
                        cmd: cmd,
                    }).then(result => {
                        this.state.commandEntries.unshift(result);
                        this.setState({commandEntries: this.state.commandEntries.slice(0)});
                    })
                }
            ).fail((xhr, textStatus, errorThrown) =>
                this.setState({message: `Error exec_run: ${textStatus} - ${errorThrown}`})
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
        return $.ajax({
                url: `/command/${command_id}`,
                type: 'DELETE',
                data: {csrf_token: this.state.csrf}
            }
        ).then(
            result => {
                const commandEntries = this.state.commandEntries.filter(command =>
                    command.id !== command_id
                );

                this.setState({message: result.message, commandEntries})
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error exec delete: ${textStatus} - ${errorThrown}`})
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
