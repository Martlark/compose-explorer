import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import $ from "jquery"
import Directory from './directory'

class ExecEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: props.id || Math.random(),
            ...props
        };
    }

    clickExec = (evt, fileName) => {
        evt.preventDefault();
        this.props.clickExec(this.state.cmd);
    }


    onChange = (evt, stateProp) => {
        this.setState({[stateProp]: evt.target.value})
    }

    render() {
        return (
            <tr key={this.state.key}>
                <td className={"w-25"}>
                    <button onClick={evt => this.state.clickExec(evt, this.props.cmd)}>Run</button>
                    <button onClick={evt => this.state.clickExecDelete(evt, this.props.id)}>Del</button>
                </td>
                <td className={"w-25"}>{this.props.cmd}</td>
                <td className={"w-50"}>
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
            mode: '',
            id: this.server_id,
            name: this.name,
            pwd: '.',
            command: '',
            commandEntries: [],
            hrefLog: `/container_log/${this.server_id}/${this.name}`
        };
        this.actions = ['stop', 'start', 'restart'];
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
        const cmd = command || this.state.command;
        console.log(cmd);
        this.setState({executing: true, command: cmd});
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
                                                                 result={cmd_result} id={result.id}/>)
                    this.setState({commandEntries: this.state.commandEntries});
                })
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error exec_run: ${textStatus} - ${errorThrown}`})
        ).always(() => this.setState({executing: false})
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


    clickExplore = (evt) => {
        this.setState({mode: 'explore'});
    }

    clickExecute = (evt) => {
        this.setState({mode: 'execute'});
    }

    renderActions() {
        if (this.state.actioning) {
            return <p>Action under way</p>
        }

        return (
            <ul className="list-inline">
                <li className={"list-inline-item"}>
                    <a href={this.state.hrefLog} title={"Logs"}>
                        <span className="material-icons">assignment</span>
                    </a>
                </li>
                <li className={"list-inline-item"}>
                    <a href="#" onClick={evt => this.clickExplore()} title={"Explore directory"}>
                        <span className="material-icons">explore</span>
                    </a>
                </li>
                <li className={"list-inline-item"}>
                    <a href="#" onClick={evt => this.clickDownloadLogs()} title={"Download logs"}>
                        <span className="material-icons">texture</span>
                    </a>
                </li>
                <li className={"list-inline-item"}>
                    <a href="#" onClick={evt => this.clickExecute()} title={"Run application"}>
                        <span className="material-icons">directions_run</span>
                    </a>
                </li>
                {this.actions.map(action => this.renderActionListItem(action))}
            </ul>
        )
    }

    renderActionListItem(action) {
        const style = {textTransform: "capitalize"};

        return <li key={action} className={"list-inline-item"}>
            <button style={style} className={"btn btn-sm"}
                    onClick={evt => this.clickAction(evt, {action})}>{action}</button>
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
        if (this.state.mode !== 'execute') {
            return null;
        }
        return (
            <div>
                <label>Command: <input name={"command"}
                                       onChange={evt => this.onChange(evt, 'command')}
                                       value={this.state.command}/></label>
                <button onClick={(evt) => this.clickExec(evt)}>exec</button>
                <table className={"table"}>
                    <tbody>
                    {this.state.commandEntries}
                    </tbody>
                </table>
            </div>
        )
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
        if (this.state.mode === 'explore') {
            return <Directory
                id={this.state.id}
                pwd={'.'}
                name={this.state.name}
                status={this.state.status}
                updateState={this.updateState}
            />
        }
        return null
    }

    render() {
        return (
            <div>
                {this.renderStatus()}
                {this.renderMessage()}
                {this.renderActions()}
                {this.renderExecute()}
                {this.renderDirectory()}
            </div>
        )
    }
}

ReactDOM.render(
    <Content/>
    , document.getElementById('jsx_content'));
