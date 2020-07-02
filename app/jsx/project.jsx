import React, {useContext, useEffect, useState} from "react";
import {ProjectService} from "./ProjectService";
import {AppContext} from "./context";
import {Link} from "react-router-dom";

export const Project = (props) => {
    const [server_id, setServer_id] = useState(props.server_id);
    const [services, setServices] = useState(props.services ?? []);
    const [project, setProject] = useState(props.project);
    const context = useContext(AppContext)

    function getServices() {
        setServer_id(props.match.params.id);
        setProject(props.match.params.project);
        context.api.proxyGet(`/project/${props.match.params.id}/${props.match.params.project}`
        ).then(result => setServices(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting project services: ${textStatus} - ${errorThrown}`)
        );
    }

    useEffect(() => {
        if (props.match) {
            if (props.match.params.id !== server_id || props.match.params.project !== project) {
                getServices();
            }
        }
    }, [props.match]);

    return (
        <div>
            <h2><Link to={`/server/${server_id}/project/${encodeURIComponent(project)}`}
                      title={'Zoom to this project'}>{project}</Link></h2>
            <table className={"table"}>
                <thead>
                <tr>
                    <th className="w-50">Service</th>
                    <th className="w-25">Status</th>
                    <th className="w-25">Actions</th>
                </tr>
                </thead>
                <tbody>

                {services.map(service => <ProjectService key={service.id}
                                                         server_id={server_id}
                                                         name={service.name}
                                                         details={service}
                                                         status={service.status}/>)}
                </tbody>
            </table>
        </div>)
}
