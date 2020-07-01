import React, {Component} from 'react'
import Collapsible from 'react-collapsible'
import Directory from './directory'
import Execute from './execute'
import LogContent from './container_log'
import {AppContext} from "./context";

export class ManageContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            id: this.props.match.params.id,
            name: this.props.match.params.name,
            pwd: '.',
            hrefLog: `/server/${this.props.match.params.id}/container_log/${this.props.match.params.name}`
        };
        this.actions = [{cmd: 'stop', icon: 'stop'}, {cmd: 'start', icon: 'play_arrow'}, {
            cmd: 'restart',
            icon: 'replay'
        }];
    }

    static contextType = AppContext;

    componentDidMount() {
        this.getContainerProps();
    }

    getContainerProps() {
        this.context.api.container(this.state.id, this.state.name).then(result => {
                this.setState({status: result.status, container: result});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting container: ${textStatus} - ${errorThrown}`)
        );
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
        this.setState({actioning: action});
        this.context.api.proxyPost(`/container/${this.state.id}/${action}`, {name: this.state.name}
        ).then(result => {
                this.context.setMessage(`container: ${result.status}`);
                this.setState({status: result.status});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error with action: ${textStatus} - ${errorThrown}`)
        ).always(() => {
            this.setState({actioning: ''});
        });
    }


    clickDownloadLogs = (evt) => {
        const filename = 'logs.txt';

        return this.context.api.proxyPost(`/proxy/container/${this.state.id}/logs`, {
                name: this.state.name,
                filename,
            }
        ).then((result, textStatus, request) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([result]));
                a.download = filename;
                a.click();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage({message: `Error: ${textStatus} - ${errorThrown}`})
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
                    <button className={'btn btn-sm'} onClick={evt => window.open(this.state.hrefLog)} title={"Logs"}>
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
                    onClick={evt => this.clickAction(evt, action.cmd)}>{action.cmd}<span
                className="material-icons">{action.icon}</span></button>
        </li>
    }

    onChange = (evt, stateProp) => {
        this.setState({[stateProp]: evt.target.value})
    }

    renderExecute() {
        return <Collapsible trigger="Execute">
            <Execute id={this.state.id} name={this.state.name}/>
        </Collapsible>
    }

    renderStatus() {
        let badgeClass = 'warning';
        switch (this.state) {
            case 'running':
                badgeClass = 'success';
                break
            case 'exited':
            case 'stopped':
                badgeClass = 'danger';
                break
        }
        return (
            <h3 title={"status"}>{this.state.name}: <span
                className={`badge badge-${badgeClass}`}>{this.state.status}</span>
            </h3>);
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

                <LogContent id={this.state.id}
                            name={this.state.name}/>
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
