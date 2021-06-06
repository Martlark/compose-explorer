import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "../context";
import Project from "./Project";

export default function ManageServer(props) {
    const [projects, setProjects] = useState([]);
    const [server, setServer] = useState({});

    const server_id = props.match.params.id;
    const context = useContext(AppContext);

    function getItems() {
        context.api.projects(server_id
        ).then(projects => {
                setProjects(projects);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting projects: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    function getServer() {
        return context.api.json(`/server/${server_id}/`
        ).then(item => {
                setServer(item);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
        )
    }

    useEffect(() => {
        context.setErrorMessage('');
        getServer();
        getItems();
    }, [server_id]);

    return (<div>
            <h1>{server.name} - {projects.length} projects</h1>
            {projects.map(project => <Project key={project.name}
                                              server_id={server_id}
                                              project={project.name}
                                              services={project.services} name={''}/>)
            }
        </div>
    )
}
