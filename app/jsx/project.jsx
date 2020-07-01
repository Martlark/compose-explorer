import React, {Component} from "react";
import PropTypes from "prop-types";
import {ProjectService} from "./ProjectService";
import {AppContext} from "./context";

export class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props,
            dirty: false,
            server_id: (props.details && props.details.server_id) || props.match.params.id,
            services: props.services || [],
            project: (props.details && props.details.name) || props.match.params.project
        };
    }

    static contextType = AppContext;

    static propTypes = {
        name: PropTypes.object.isRequired,
        details: PropTypes.object.isRequired
    };

    getServices() {
        if (this.props.match) {
            this.context.api.proxyGet(`/project/${this.state.server_id}/${this.state.project}`
            ).then(result => this.setState({services: result})
            ).fail((xhr, textStatus, errorThrown) =>
                this.context.setErrorMessage(`Error getting project services: ${textStatus} - ${errorThrown}`)
            );
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.match) {
            if (this.props.match.params.id !== prevState.server_id || this.props.match.params.project !== prevState.project) {
                this.setState({server_id: this.props.match.params.id, project: this.props.match.params.project},
                    () => this.getServices())
            }
        }
    }

    componentDidMount() {
        this.getServices();
    }

    render() {
        return (
            <div>
                <h2>{this.state.name}</h2>
                <table className={"table"}>
                    <thead>
                    <tr>
                        <th className="w-50">Service</th>
                        <th className="w-25">Status</th>
                        <th className="w-25">Actions</th>
                    </tr>
                    </thead>
                    <tbody>

                    {this.state.services.map(service => <ProjectService key={service.id}
                                                                        server_id={this.state.server_id}
                                                                        updateState={this.updateState}
                                                                        name={service.name}
                                                                        details={service}
                                                                        status={service.status}/>)}
                    </tbody>
                </table>
            </div>)
    }
}
