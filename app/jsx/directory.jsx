import React, {Component} from 'react'
import join from 'join-path'
import $ from "jquery"

const Checkbox = props => (
    <input type="checkbox" {...props} />
)

class DirectoryEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props.entry,
            message: '',
            selected: false,
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

    checkboxOnChange = (event) => {
        this.setState({selected: event.target.checked});
        this.props.selectEntry(this.state.file_name, event.target.checked);
    }

    render() {
        return (
            <tr>
                <td><Checkbox checked={this.state.selected} onChange={evt => this.checkboxOnChange(evt)}/></td>
                <td>{this.state.modes}</td>
                <td>{this.state.size}</td>
                <td>{this.renderFilename()}</td>
                <td>{this.state.linked_file_name}</td>
            </tr>
        )
    }
}

export default class Directory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pwd: props.pwd,
            id: props.id,
            name: props.name,
            status: props.status,
            updateState: props.updateState,
            directoryPath: '',
            directoryParent: '..',
            directoryEntries: [],
        }
    }

    componentDidMount() {
        this.getDirectory(this.state.pwd);
    }

    clickUpDirectory = (evt) => {
        this.getDirectory(join(this.state.pwd, '..'));
    }

    clickDirectory = (evt, dir = '/') => {
        this.getDirectory(dir);
    }

    clickDeleteSelected = (evt) => {
        this.setState({directoryGetting: true})

        const selected = this.state.directoryEntries.filter(dir => dir.selected);

        return $.post(`/proxy/container/${this.state.id}/exec_run`, {
                name: this.state.name,
                cmd: `(cd ${this.state.pwd} && rm ${selected.map(dir => '"' + dir.file_name + '"').join(' ')})`,
                csrf_token: $("input[name=base-csrf_token]").val(),
            }
        ).then(result => {
                this.state.updateState({message: result});
                return this.getDirectory(this.state.pwd);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.state.updateState({message: `Error: ${textStatus} - ${errorThrown}`})
        ).always(() => this.setState({directoryGetting: false})
        )
    }

    changeDirectory = (directoryName) => {
        const pwd = join(this.state.directoryPath, directoryName);
        this.getDirectory(pwd);
    }

    getDirectory(pwd) {
        this.setState({directoryGetting: true})
        return $.getJSON(`/proxy/container/${this.state.id}/ls`, {name: this.state.name, pwd: pwd}
        ).then(result =>
            this.setState({
                pwd: result.pwd,
                directoryPath: result.path,
                directoryParent: result.parent,
                directoryTotal: result.total,
                directoryEntries: result.entries,
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.state.updateState({message: `Error: ${textStatus} - ${errorThrown}`})
        ).always(() => this.setState({directoryGetting: false})
        )
    }

    renderActions() {
        if (this.state.status !== 'running') {
            return <h3>Container is not running</h3>
        }
        if (!this.state.directoryPath) {
            return <h3>No directory found</h3>
        }

        const upButton = (this.state.directoryPath !== '/') ?
            <a href={"#"} className={"btn"} onClick={evt => this.clickUpDirectory(evt)}
               title={"Up one level of directory"}><span
                className="material-icons">reply</span></a> : null;
        const deleteButton = <a href={"#"} className={"btn"} onClick={evt => this.clickDeleteSelected(evt)}
                                title={"Remove selected files"}><span
            className="material-icons">delete</span></a>;
        const refreshButton = <a href={"#"} className={"btn"} onClick={evt => this.clickDirectory(evt, this.state.pwd)}
                                 title={"Refresh"}><span
            className="material-icons">cached</span></a>;
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
                {deleteButton}
                {upButton}
                {directoryLinks.map(d => {
                    return <a href={"#"} onClick={(evt) => this.clickDirectory(evt, d.cwd)}
                              title={d.cwd}>{d.dir}&nbsp;/&nbsp;</a>
                })}
                {getting}
            </div>
        );
    }

    selectEntry = (fileName, state) => {
        let data = this.state.directoryEntries;
        data.forEach(entry => {
            if (entry.file_name === fileName) {
                entry.selected = state;
            }
        })
        this.setState({directoryEntries: data})
    };

    render() {
        return (
            <div>
                {this.renderActions()}

                <table className={"table"}>
                    <thead>
                    <tr>
                        <th>&nbsp;</th>
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
                                                                              selectEntry={this.selectEntry}/>)}
                    </tbody>
                </table>
            </div>
        )
    }
}