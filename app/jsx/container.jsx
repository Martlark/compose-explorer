import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import $ from "jquery"
import Directory from './directory'

class ExecEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: Math.random()
        };
    }

    clickExec = (evt, fileName) => {
        evt.preventDefault();
        this.props.clickExec(this.state.cmd);
    }

    render() {
        return (
            <tr key={this.state.key}>
                <td>{this.props.cmd}</td>
                <td>
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

    exec_run(cmd) {
        this.setState({executing: true});
        return $.post(`/proxy/container/${this.state.id}/exec_run`, {
                name: this.state.name,
                csrf_token: $("input[name=base-csrf_token]").val(),
                cmd: cmd,
            }
        ).then(result => result
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

    clickExec = (evt) => {
        this.exec_run(this.state.command).then(result => {
            this.state.commandEntries.unshift(<ExecEntry cmd={this.state.command} result={result}/>);
            this.setState({commandEntries: this.state.commandEntries})
        })
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
