import React, {useContext, useEffect, useState} from "react";
import {Link, matchPath, useLocation} from "react-router-dom";
import {AppContext} from "./context";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {route as userAdminRoute} from "./admin/user/UserAdmin";
import {route as auditAdminRoute} from "./admin/audit/AuditAdmin";

export const Navigation = (props) => {
    const [servers, setServers] = useState([]);
    const [projects, setProjects] = useState([]);
    const location = useLocation();
    const context = useContext(AppContext);

    useEffect(() => {
        if (context.serverId < 1) {
            return;
        }
        context.api.json(`/server/${context.serverId}/`).then(result => {
            if (result) {
                context.setServerName(result.name);
            }
        });
        context.api.projects(context.serverId
        ).then(result => setProjects(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting projects: ${xhr.responseText} - ${errorThrown}`))
    }, [context.serverId]);

    useEffect(() => {
        const match = matchPath(location.pathname, {key: 'id', path: '/server/:id'});
        const current_id = match?.params?.id || context.serverId;
        if (!context.anon && context.serverId !== current_id) {
            if (current_id) {
                context.setServerId(current_id);
            }
        }
    }, [location.pathname]);

    useEffect(() => {
        context.api.json('/servers/', {_: new Date().getTime()}).then(items => setServers(items))
    }, [context.anon]);

    const serverLinks =
        <NavDropdown title="Servers" id="server-dropdown">
            {servers.map(item => <NavDropdown.Item>
                <Link to={`/server/${item.id}`}>{item.name}</Link></NavDropdown.Item>
            )}
        </NavDropdown>;

    const profileLinks =
        <NavDropdown title="Profile" id="profile-dropdown">
            {context.anon && <NavDropdown.Item><Link to={`/login/`}>Login</Link></NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item><Link to={`/logout/`}>Logout</Link></NavDropdown.Item>}
            {!context.anon && <NavDropdown.Item><Link to={`/profile/`}>Profile</Link></NavDropdown.Item>}
        </NavDropdown>;

    const adminLinks =
        <NavDropdown title="Admin" id="admin-dropdown">
            <NavDropdown.Item><Link to={userAdminRoute}>Users</Link></NavDropdown.Item>
            <NavDropdown.Item><Link to={auditAdminRoute}>Audit</Link></NavDropdown.Item>
            <NavDropdown.Item><Link to={`/groups/`}>Groups</Link></NavDropdown.Item>
        </NavDropdown>;


    const projectLinks =
        <NavDropdown title="Projects" id="projects-dropdown">
            {projects.map(project => {
                return <NavDropdown.Item><Link
                    to={`/server/${context.serverId}/project/${project.name}`}>{project.name}</Link></NavDropdown.Item>;
            })
            }
        </NavDropdown>;

    return (

        <Navbar expand="lg">
            <Navbar.Brand><Link to="/">Compose Explorer</Link></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
            <Navbar.Collapse id="navbar">
                <Nav className="mr-auto">
                    <Nav.Link><Link to={`/server/${context.serverId}`}>
                        <span title="Active server">{context.serverName}</span></Link>
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
