import React, {Component} from "react";
import {NavLink} from "react-router-dom";
import {AppContext} from "./context";

export class Nav extends Component {
    constructor(props) {
        super(props);
        this.state = {projects: [], server_id: null}
    }

    static contextType = AppContext;

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.context.server_id === prevState.server_id) {
            return null;
        }
        this.setState({server_id: this.context.server_id}, () => {
            this.context.api.json(`/server/${this.context.server_id}`).then(result=>this.context.setServerName(result.name))
            this.context.api.projects(this.state.server_id
            ).then(projects => this.setState({projects})
            ).fail((xhr, textStatus, errorThrown) =>
                this.context.setErrorMessage(`Error getting projects: ${textStatus} - ${errorThrown}`))
        });
    }

    render() {
        const projects = <li className="dropdown">
            <li className="dropdown">
                <a className="nav-link dropdown-toggle" href="http://example.com" id="dropdown08" data-toggle="dropdown"
                   aria-haspopup="true" aria-expanded="false">Projects</a>
                <div className="dropdown-menu" aria-labelledby="dropdown08">
                    {this.state.projects.map(project =>
                        <li key={project}>
                            <NavLink
                                className="dropdown-item"
                                to={`/r/project/${this.context.server_id}/${project.name}`}>{project.name}
                            </NavLink>
                        </li>)}
                </div>
            </li>
        </li>;
        return (

            <nav className="navbar navbar-expand-lg navbar-dark bg-info">
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExample08"
                        aria-controls="navbarsExample08" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarsExample08">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <NavLink className="nav-link" to="/">Servers <span
                                className="sr-only">(current)</span></NavLink>
                        </li>
                        {this.context.server_id && <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to={`/r/server/${this.context.server_id}`}>
                                {this.context.server_name}
                            </NavLink>
                        </li>}
                        {/*<li className="nav-item">*/}
                        {/*    <a className="nav-link disabled" href="#">Disabled</a>*/}
                        {/*</li>*/}
                        {this.state.server_id && projects}
                    </ul>
                </div>
            </nav>

        )
    }
}
