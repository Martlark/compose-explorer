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
        this.server_id = $("input[name=server-id]").val();
        this.name = $("input[name=container-name]").val();
        this.state = {
            message: '',
            exploring: false,
            id: this.server_id,
            name: this.name,
            pwd: '.',
            directoryPath: '',
            directoryParent: '..',
            directoryEntries: [],
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
        this.getDirectory(join(this.state.pwd, '..'));
    }

    clickDirectory = (evt, dir = '/') => {
        this.getDirectory(dir);
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
        this.setState({exploring: true});
        this.getDirectory(this.state.pwd);
    }

    renderActions() {
        if (this.state.actioning) {
            return <p>Action under way</p>
        }

        return (
            <ul className="list-inline">
                <li className={"list-inline-item"}><a href={this.state.hrefLog} title={"Logs"}><span
                    className="material-icons">assignment</span></a></li>
                <li className={"list-inline-item"}>
                    <a href="#" onClick={evt => this.clickExplore()} title={"Explore directory"}><span
                        className="material-icons">
explore
</span></a>
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

    renderCurrentPath() {
        const upButton = (this.state.directoryPath !== '/' && this.state.status === 'running') ?
            <a href={"#"} className={"btn"} onClick={evt => this.clickUpDirectory(evt)}
               title={"Up one level of directory"}><span
                className="material-icons">reply</span></a> : null;
        const refreshButton = (this.state.status === 'running') ?
            <a href={"#"} className={"btn"} onClick={evt => this.clickUpDirectory(evt)} title={"Refresh"}><span
                className="material-icons">cached</span></a> : null;
        const getting = this.state.directoryGetting ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
        </div> : null;
        let cwd = '/';
        const directoryLinks = [];
        this.state.directoryPath.split('/').forEach((dir, index) => {
            if (index === 0 || dir.length) {
                cwd = join(cwd, dir);
                let thisCwd = cwd.toString();
                directoryLinks.push({cwd: cwd, dir: dir});
            }
        });

        return (
            <div>
                {refreshButton}
                {upButton}
                {directoryLinks.map(d => {
                    return <a href={"#"} onClick={(evt) => this.clickDirectory(evt, d.cwd)}
                              title={d.cwd}>{d.dir}/&nbsp;</a>
                })}
                {getting}
            </div>);
    }

    renderDirectory() {
        if (!this.state.exploring) {
            return null;
        }
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
                {this.renderStatus()}
                {this.renderMessage()}
                {this.renderActions()}
                {this.renderDirectory()}
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
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
