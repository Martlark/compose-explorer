import React, {Component} from 'react'
import {AppContext} from "./context";
import {Project} from "./project";

export class ManageServer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            id: props.match.params.id,
        };
    }

    static contextType = AppContext;

    updateState = (data) => {
        this.setState(data)
    };

    getItems() {
        return this.context.api.projects(this.state.id
        ).then(projects => {
                this.context.setMessage(`${projects.length} projects`);
                this.setState({projects});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting projects: ${textStatus} - ${errorThrown}`)
        );
    }

    componentDidMount() {
        this.getItems();
    }

    render() {
        return (<div>
                {this.state.projects.map(project => <Project key={project.name}
                                                             updateState={this.updateState}
                                                             details={project}
                                                             services={project.services} name={''}/>)
                }
            </div>
        )
    }
}
