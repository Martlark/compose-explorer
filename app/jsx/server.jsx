import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "./context";
import {Project} from "./project";

export function ManageServer(props) {
    const [projects, setProjects] = useState([]);
    const server_id = props.match.params.id;
    const context = useContext(AppContext);

    function getItems() {
        context.api.projects(server_id
        ).then(projects => {
                context.setMessage(`${projects.length} projects`);
                setProjects(projects);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting projects: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(() => {
                console.log(5);

        getItems();
    }, [server_id]);

    return (<div>
            {projects.map(project => <Project key={project.name}
                                              server_id={server_id}
                                              project={project.name}
                                              services={project.services} name={''}/>)
            }
        </div>
    )
}
