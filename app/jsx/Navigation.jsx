import React, {useContext, useEffect, useState} from "react";
import {matchPath, useLocation} from "react-router-dom";
import {AppContext} from "./context";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {route as userAdminRoute} from "./admin/user/UserAdmin";
import AuditAdmin, {route as auditAdminRoute} from "./admin/audit/AuditAdmin";

export const Navigation = (props) => {
    const [servers, setServers] = useState([]);
    const [projects, setProjects] = useState([]);
    const location = useLocation();
    const context = useContext(AppContext);

    useEffect(() => {
        const match = matchPath(location.pathname, {key: 'id', path: '/server/:id'});
        const current_id = match?.params?.id || context.serverId;
        if (!context.anon && context.serverId !== current_id) {
            if (current_id) {
                context.setServerId(current_id);
                context.api.json(`/server/${current_id}/`).then(result => {
                    if (result) {
                        context.setServerName(result.name);
                    }
                });
                context.api.projects(current_id
                ).then(result => setProjects(result)
                ).fail((xhr, textStatus, errorThrown) =>
                    context.setErrorMessage(`Error getting projects: ${xhr.responseText} - ${errorThrown}`))
            }
        }
    }, [location]);

    useEffect(() => {
        context.api.json('/servers/', {_: new Date().getTime()}).then(items => setServers(items))
    }, [context.anon]);

    const serverLinks =
        <NavDropdown title="Servers" id="server-dropdown">
            {servers.map(item => <NavDropdown.Item
                href={`/server/${item.id}`}>{item.name}</NavDropdown.Item>
            )}
        </NavDropdown>;

    const profileLinks =
        <NavDropdown title="Profile" id="profile-dropdown">
            {context.anon && <NavDropdown.Item href={`/login/`}>Login</NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item href={`/logout/`}>Logout</NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item href={`/profile/`}>Profile</NavDropdown.Item>}
        </NavDropdown>;

    const adminLinks =
        <NavDropdown title="Admin" id="admin-dropdown">
            <NavDropdown.Item href={userAdminRoute}>User Admin</NavDropdown.Item>
            <NavDropdown.Item href={auditAdminRoute}>Audit Admin</NavDropdown.Item>
            <NavDropdown.Item href={`/groups/`}>Group Admin</NavDropdown.Item>
        </NavDropdown>;


    const projectLinks =
        <NavDropdown title="Projects" id="projects-dropdown">
            {projects.map(project => {
                return <NavDropdown.Item
                    href={`/server/${context.serverId}/project/${project.name}`}>{project.name}</NavDropdown.Item>;
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
                        href={`/server/${context.serverId}`}>
                        <span title="Active server">{context.serverName}</span>
                    </Nav.Link>
                    {!context.anon && serverLinks}
                    {!context.anon && context.serverId > 0 && projectLinks}
                    {context.admin && adminLinks}
                    {profileLinks}
                </Nav>
            </Navbar.Collapse>
        </Navbar>

    )
}
