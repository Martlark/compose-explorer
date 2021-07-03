import React, {useContext, useEffect, useState} from 'react'
import {AppContext} from "../context";
import Project from "./Project";
import LoginRequired from "../LoginRequired";
import LoadingMessage from "../LoadingMesssage";

export const route = '/server/:id/';

export default function ManageServer(props) {
    const [projects, setProjects] = useState([]);
    const [server, setServer] = useState({});

    const server_id = props.match.params.id;
    const context = useContext(AppContext);
    const [loadingStatus, setLoadingStatus] = useState('loading');

    function getProjects() {
        if (context.anon) {
            return Promise.resolve;
        }
        setLoadingStatus('loading');
        return context.api.projects(server_id
        ).then(projects => {
                setProjects(projects);
            }
        ).fail((xhr, textStatus, errorThrown) => {
                setLoadingStatus(xhr.responseText);
                context.setErrorMessage(`Error getting projects: ${xhr.responseText}`);
            }
        );
    }

    function getServer() {
        if (context.anon) {
            return Promise.resolve;
        }
        return context.api.json(`/server/${server_id}/`
        ).then(item => {
                setServer(item);
            }
        ).fail((xhr, textStatus, errorThrown) => {
                setLoadingStatus(xhr.responseText);
                context.setErrorMessage(`Error getting server: ${xhr.responseText}`);
            }
        )
    }

    useEffect(() => {
        context.setErrorMessage('');
        Promise.all([getServer(), getProjects()]).then(result => setLoadingStatus('done'));
    }, [server_id]);

    if (context.anon) {
        return <LoginRequired/>;
    }

    if (loadingStatus === 'loading') {
        return <LoadingMessage/>;
    }

    if (loadingStatus !== 'done') {
        return <h3>Error {loadingStatus}</h3>;
    }

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
