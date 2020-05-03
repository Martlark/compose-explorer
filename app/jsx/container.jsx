import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import join from 'join-path'
import $ from "jquery"

class DirectoryEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.entry,
            message: '',
        };
    }

    clickDirectory = (evt, fileName) => {
        evt.preventDefault();
        this.props.parentChangeDirectory(fileName);
    }

    renderFilename() {
        if (this.state.dir_type === 'd') {
            return (<a href={"#"}
                       onClick={evt => this.clickDirectory(evt, this.state.file_name)}>{this.state.file_name}</a>)
        }
        return this.state.file_name;
    }

    render() {
        return (
            <tr>
                <td>{this.state.modes}</td>
                <td>{this.state.size}</td>
                <td>{this.renderFilename()}</td>
                <td>{this.state.linked_file_name}</td>
            </tr>)
    }
}

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            id: $("input[name=server-id]").val(),
            name: $("input[name=container-name]").val(),
            pwd: '.',
            directoryPath: '',
            directoryParent: '..',
            directoryEntries: []
        };
        this.actions = ['stop', 'start', 'restart'];
    }

    componentDidMount() {
        this.getContainerProps();
        this.getDirectory(this.state.pwd);
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

    changeDirectory = (directoryName) => {
        const pwd = join(this.state.directoryPath, directoryName);
        this.getDirectory(pwd);
    }

    getDirectory(pwd) {
        this.setState({directoryGetting: true})
        $.getJSON(`/proxy/container/${this.state.id}/ls`, {name: this.state.name, pwd: pwd}
        ).then(result =>
            this.setState({
                pwd: result.pwd,
                directoryPath: result.path,
                directoryParent: result.parent,
                directoryTotal: result.total,
                directoryEntries: result.entries,
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting container: ${textStatus} - ${errorThrown}`})
        ).always(() => this.setState({directoryGetting: false})
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

    clickUpDirectory = (evt) => {
        this.getDirectory('..');
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

    renderCurrentPath() {
        const upButton = this.state.directoryPath !== '/' ?
            <button className={"btn"} onClick={evt => this.clickUpDirectory(evt)}>Up</button> : null;
        const getting = this.state.directoryGetting ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
        </div> : null;

        return (
            <div>
                {upButton}
                <span> {this.state.directoryPath}</span>
                {getting}
            </div>);
    }

    renderDirectory() {
        return (
            <div>
                {this.renderCurrentPath()}

                <table className={"table"}>
                    <thead>
                    <tr>
                        <th>Modes</th>
                        <th>Size</th>
                        <th>Name</th>
                        <th>link</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.directoryEntries.map(entry => <DirectoryEntry entry={entry}
                                                                              key={entry.file_name}
                                                                              parentChangeDirectory={this.changeDirectory}
                                                                              updateState={this.updateState}/>)}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        return (
            <div>
                <h3>{this.state.status}</h3>
                {this.renderMessage()}
                {this.renderActions()}
                {this.renderDirectory()}
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
