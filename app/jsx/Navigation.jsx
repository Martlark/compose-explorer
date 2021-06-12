import React, {useContext, useEffect, useState} from "react";
import {matchPath, useLocation} from "react-router-dom";
import {AppContext} from "./context";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";

export const Navigation = (props) => {
    const location = useLocation();
    const [server_id, setServer_id] = useState(0);
    const [projects, setProjects] = useState([]);
    const context = useContext(AppContext);

    useEffect(() => {
        const match = matchPath(location.pathname, {key: 'id', path: '/server/:id'});
        const current_id = match?.params?.id || 0;
        if (server_id !== current_id && !context.anon) {
            setServer_id(current_id);
            if (current_id) {
                context.api.json(`/server/${current_id}/`).then(result => {
                    if (result) {
                        context.setServerName(result.name);
                        context.setServerId(current_id);
                    }
                });
                context.api.projects(current_id
                ).then(result => setProjects(result)
                ).fail((xhr, textStatus, errorThrown) =>
                    context.setErrorMessage(`Error getting projects: ${xhr.responseText} - ${errorThrown}`))
            }
        }
    }, [location]);

    const profileLinks =
        <NavDropdown title="Profile" id="profile-dropdown">
            {context.anon && <NavDropdown.Item href={`/login/`}>Login</NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item href={`/logout/`}>Logout</NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item href={`/profile/`}>Profile</NavDropdown.Item>}
        </NavDropdown>;

    const adminLinks =
        <NavDropdown title="Admin" id="admin-dropdown">
            <NavDropdown.Item href={`/admin/`}>User Admin</NavDropdown.Item>
        </NavDropdown>;


    const projectLinks =
        <NavDropdown title="Projects" id="projects-dropdown">
            {projects.map(project => {
                return <NavDropdown.Item
                    href={`/server/${server_id}/project/${project.name}`}>{project.name}</NavDropdown.Item>;
            })
            }
        </NavDropdown>;

    return (

        <Navbar expand="lg">
            <Navbar.Brand href="/">Compose Explorer</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="navbar">
                <Nav className="mr-auto">
                    <Nav.Link
                        href={`/server/${server_id}`}>
                        {context.serverName}
                    </Nav.Link>
                    {!context.anon && server_id > 0 && projectLinks}
                    {profileLinks}
                    {context.admin && adminLinks}
                </Nav>
            </Navbar.Collapse>
        </Navbar>

    )
}
