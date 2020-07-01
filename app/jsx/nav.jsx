import React, {useContext, useState} from "react";
import {matchPath, NavLink, useLocation} from "react-router-dom";
import {AppContext} from "./context";

export const Nav = (props) => {
    const location = useLocation();
    const [server_id, setServer_id] = useState();
    const [projects, setProjects] = useState([]);
    const match = matchPath(location.pathname, {key: 'id', path: '/server/:id'});
    const context = useContext(AppContext);
    const current_id = match && match.params && match.params.id || 0;

    if (server_id !== current_id) {
        setServer_id(current_id)
        context.api.json(`/server/${current_id}`).then(result => {
            if (result) {
                context.setServerName(result.name);
                context.setServerId(current_id);
            }
        });
        context.api.projects(current_id
        ).then(projects => setProjects(projects)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting projects: ${textStatus} - ${errorThrown}`))
    }

    const adminLinks =
        <li className="nav-item dropdown">
            <a id="dropdown1" className="nav-link dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
               aria-expanded="false" href="#">Admin</a>
            <div className="dropdown-menu" aria-labelledby="dropdown1">
                {g.admin && <a className="dropdown-item" href="/admin">Flask Admin</a>}
                {g.anon && <a className="dropdown-item" href="/login">Login</a>}
                {!g.anon && <a className="dropdown-item" href="/logout">Logout</a>}
            </div>
        </li>;


    const projectLinks = <li className="dropdown">
        <li className="dropdown">
            <a className="nav-link dropdown-toggle" href="http://example.com" id="dropdown08" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">Projects</a>
            <div className="dropdown-menu" aria-labelledby="dropdown08">
                {projects.map(project =>
                    <li key={project}>
                        <NavLink
                            className="dropdown-item"
                            to={`/server/${current_id}/project/${project.name}`}>{project.name}
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
                        <NavLink className="nav-link" to="/">Compose Explorer <span
                            className="sr-only">(current)</span></NavLink>
                    </li>
                    {current_id > 0 && <li className="nav-item">
                        <NavLink
                            className="nav-link"
                            to={`/server/${current_id}`}>
                            {context.server_name}
                        </NavLink>
                    </li>}
                    {/*<li className="nav-item">*/}
                    {/*    <a className="nav-link disabled" href="#">Disabled</a>*/}
                    {/*</li>*/}
                    {current_id > 0 && projectLinks}
                    {adminLinks}
                </ul>
            </div>
        </nav>

    )
}
