import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Collapsible from 'react-collapsible'
import $ from "jquery"
import Directory from './directory'
import {LogContent} from './container_log'
import BootstrapInput from "bootstrap-input-react";

class ExecEntry extends Component {
    constructor(props) {
        super(props);
    }

    clickCmd = (evt) => {
        evt.preventDefault();
        this.props.updateState({command: this.props.cmd});
    }

    render() {
        return (
            <tr key={this.props.id}>
                <td className={"w-25"}>
                    <a href={'javascript:'} title={'Re-run command'} onClick={evt => this.props.clickExec(evt, this.props.cmd)}><span
                        className="material-icons">directions_run</span></a>
                    <a href={'javascript:'} title={'delete from history'} onClick={evt => this.props.clickExecDelete(evt, this.props.id)}><span
                        className="material-icons">delete_forever</span></a>
                </td>
                <td className={"w-25"}><a href={'javascript:'} title={'Edit command string'} onClick={evt => this.clickCmd(evt)}>{this.props.cmd}</a></td>
                <td className={"w-50"} title={this.props.created}>
                    <pre>{this.props.result}</pre>
                </td>
            </tr>)
    }
}

class Content extends Component {
    constructor(props) {
        super(props);
        this.server_id = $("input[name=server-id]").val();
        this.name = $("input[name=container-name]").val();
        this.state = {
            message: '',
            id: this.server_id,
            name: this.name,
            pwd: '.',
            command: '',
            commandEntries: [],
            hrefLog: `/container_log/${this.server_id}/${this.name}`
        };
        this.actions = [{cmd:'stop',icon: 'stop'}, {cmd:'start', icon:'play_arrow'}, {cmd:'restart', icon:'replay'}];
    }

    componentDidMount() {
        this.getContainerProps();
        this.getCommandEntries();
    }

    getCommandEntries() {
        $.getJSON(`/command`
        ).then(result =>
            this.setState({
                commandEntries: result.map(result => <ExecEntry cmd={result.cmd} clickExec={this.clickExec}
                                                                clickExecDelete={this.clickExecDelete}
                                                                updateState={this.updateState}
                                                                created={result.created}
                                                                result={result.result} id={result.id}/>)
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting commands: ${textStatus} - ${errorThrown}`})
        )
    }

    getContainerProps() {
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

    clickExec = (evt, command = null) => {
        console.log(command);
        const cmd = command || this.state.command;
        this.setState({executing: true, command: cmd}, () => {
            return $.post(`/proxy/container/${this.state.id}/exec_run`, {
                    name: this.state.name,
                    csrf_token: $("input[name=base-csrf_token]").val(),
                    cmd: cmd,
                }
            ).then(cmd_result => {
                    return $.post(`/command`, {
                        csrf_token: $("input[name=base-csrf_token]").val(),
                        result: cmd_result,
                        cmd: cmd,
                    }).then(result => {
                        this.state.commandEntries.unshift(<ExecEntry cmd={cmd} clickExec={this.clickExec}
                                                                     clickExecDelete={this.clickExecDelete}
                                                                     updateState={this.updateState}
                                                                     created={result.created}
                                                                     result={cmd_result} id={result.id}/>)
                        this.setState({commandEntries: this.state.commandEntries});
                    })
                }
            ).fail((xhr, textStatus, errorThrown) =>
                this.setState({message: `Error exec_run: ${textStatus} - ${errorThrown}`})
            ).always(() => this.setState({executing: false})
            )
        })
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
        $.ajax({
                type: 'POST', url: `/proxy/container/${this.server_id}/${action.action}`, data: {
                    name: this.name,
                    csrf_token: $("input[name=base-csrf_token]").val(),
                }
            }
        ).then(result =>
            this.setState({message: `container: ${result.status}`, status: result.status})
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error with action: ${textStatus} - ${errorThrown}`})
        ).always(() => {
            this.setState({actioning: ''});
        });
    }


    clickDownloadLogs = (evt) => {
        const filename = 'logs.txt';

        return $.post(`/proxy/container/${this.state.id}/logs`, {
                name: this.state.name,
                filename,
                csrf_token: $("input[name=base-csrf_token]").val(),
            }
        ).then((result, textStatus, request) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([result]));
                a.download = filename;
                a.click();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.state.updateState({message: `Error: ${textStatus} - ${errorThrown}`})
        )
    }

    clickToggleVisible = (evt, item) => {
        this.setState({[`visible-${item}`]: !this.state[`visible-${item}`]});
    }

    renderActions() {
        if (this.state.actioning) {
            return <p>Action under way</p>
        }

        return (
            <ul className="list-inline">
                <li className={"list-inline-item"}>
                    <button className={'btn btn-sm'} onClick={evt=>window.open(this.state.hrefLog)} title={"Logs"}>
                        Logs <span className="material-icons">assignment</span>
                    </button>
                </li>
                <li className={"list-inline-item"}>
                    <button className={'btn btn-sm'} onClick={evt => this.clickDownloadLogs()} title={"Download logs"}>
                        Download Logs <span className="material-icons">texture</span>
                    </button>
                </li>
                {this.actions.map(action => this.renderActionListItem(action))}
            </ul>
        )
    }

    renderActionListItem(action) {
        const style = {textTransform: "capitalize"};

        return <li key={action.cmd} className={"list-inline-item"}>
            <button style={style} className={"btn btn-sm"}
                    onClick={evt => this.clickAction(evt, action.cmd)}>{action.cmd}<span className="material-icons">{action.icon}</span></button>
        </li>
    }

    onChange = (evt, stateProp) => {
        this.setState({[stateProp]: evt.target.value})
    }

    clickExecDelete = (evt, command_id) => {
        this.setState({executing: true});
        return $.ajax({
                url: `/command/${command_id}`,
                type: 'DELETE',
                data: {csrf_token: $("input[name=base-csrf_token]").val()}
            }
        ).then(
            result => {
                const commandEntries = this.state.commandEntries.filter(entry =>
                    entry.props.id !== command_id
                );

                this.setState({message: result.message, commandEntries})
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error exec delete: ${textStatus} - ${errorThrown}`})
        ).always(() => this.setState({executing: false})
        )
    }

    renderExecute() {
        return <div>
            <Collapsible trigger="Execute">
                <BootstrapInput name={"command"} parent={this} label={"Command: "}/>
                <button onClick={(evt) => this.clickExec(evt)}><span className="material-icons">directions_run</span>
                </button>
                <table className={"table"}>
                    <tbody>
                    {this.state.commandEntries}
                    </tbody>
                </table>
            </Collapsible>
        </div>
    }

    renderStatus() {
        let textClass = 'text-warning';
        switch (this.state) {
            case 'running':
                textClass = 'text-success';
                break
            case 'exited':
            case 'stopped':
                textClass = 'text-danger';
                break
        }
        return <h3 className={textClass} title={"status"}>{this.state.status}</h3>;
    }

    renderDirectory() {
        return <div>
            <Collapsible trigger="Directory">

                <Directory
                    id={this.state.id}
                    pwd={'.'}
                    name={this.state.name}
                    updateState={this.updateState}
                />
            </Collapsible>
        </div>
    }

    renderLog() {
        return <div>
            <Collapsible trigger="Logs">

                <LogContent/>
            </Collapsible>
        </div>
    }

    render() {
        return (
            <div>
                {this.renderStatus()}
                {this.renderMessage()}
                {this.renderActions()}
                {this.renderExecute()}
                {this.renderDirectory()}
                {this.renderLog()}
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
