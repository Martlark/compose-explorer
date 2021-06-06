import React, {useContext, useEffect, useState} from "react";
import {ProjectService} from "./ProjectService";
import {AppContext} from "../context";
import {Link} from "react-router-dom";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import 'react-tabs/style/react-tabs.css';
import {AgentActionService} from "./AgentActionService";

export default function Project(props) {
    const [server_id, setServer_id] = useState(props.server_id);
    const [working_dir, setWorking_dir] = useState('');
    const [services, setServices] = useState(props.services ?? []);
    const [project, setProject] = useState(props.project);
    const [gitStatus, setGitStatus] = useState();
    const context = useContext(AppContext)

    function getServices() {
        setServer_id(props.match.params.id);
        setProject(props.match.params.project);
        context.api.proxyGet(`/project/${props.match.params.id}/${props.match.params.project}/`
        ).then(result => {
                setServices(result);
                if (result.length > 0) {
                    setWorking_dir(result[0].labels['com.docker.compose.project.working_dir']);
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting project services: ${xhr.responseText} - ${errorThrown}`)
        );
    }


    useEffect(() => {
        if (props?.match) {
            if (props.match.params.id !== server_id || props.match.params.project !== project) {
                getServices();
            }
        }
    }, [props?.match]);

    function renderGitTab() {
        if (!g.admin) {
            return null;
        }

        return <TabPanel><AgentActionService key={server_id}
                                             working_dir={working_dir}
                                             server_id={server_id}
                                             service={'git'}
                                             actions={['status', 'pull', 'fetch', 'log']}
        /></TabPanel>
    }

    function renderComposeTab() {
        if (!g.admin) {
            return null;
        }
        return <TabPanel><AgentActionService key={server_id}
                                             working_dir={working_dir}
                                             server_id={server_id}
                                             service={'compose'}
                                             actions={['ps', 'up', 'build', 'stop', 'logs', 'restart']}
        /></TabPanel>
    }

    return (
        <div>
            <h2><Link to={`/server/${server_id}/project/${encodeURIComponent(project)}`}
                      title={'Zoom to this project'}>{project}</Link></h2>
            <Tabs>
                <TabList>
                    <Tab>Containers</Tab>
                    {g.admin && <Tab>Git</Tab>}
                    {g.admin && <Tab>Compose</Tab>}
                </TabList>
                <TabPanel>
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
                </TabPanel>
                {renderGitTab()}
                {renderComposeTab()}
            </Tabs>
        </div>)
}

/*
see:
https://www.robinwieruch.de/react-hooks-fetch-data
 */
