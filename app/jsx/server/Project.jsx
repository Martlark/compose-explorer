import React, { useContext, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Link } from "react-router-dom";
import { ProjectService } from "./ProjectService";
import { AppContext } from "../context";
import { AgentAction } from "./AgentAction";
import LoginRequired from "../LoginRequired";
import LoadingMessage from "../LoadingMesssage";

export const route = "/server/:id/project/:project/";

export default function Project(props) {
  const [server_id, setServer_id] = useState(
    props?.match?.params?.id || props.server_id
  );
  const [working_dir, setWorking_dir] = useState("");
  const [services, setServices] = useState(props.services ?? []);
  const [project, setProject] = useState(
    props?.match?.params?.project || props.project
  );
  const [gitStatus, setGitStatus] = useState();
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const [server, setServer] = useState({});
  const context = useContext(AppContext);

  useEffect(() => {
    if (props.match) {
      setServer_id(props.match?.params.id);
      setProject(props.match?.params.project);
    }
  }, [props.match?.params]);

  useEffect(() => {
    setLoadingStatus("loading");
    Promise.all([getServer(), getServices()]).then(() =>
      setLoadingStatus("done")
    );
  }, [server_id, project]);

  function getServer() {
    return context.api
      .json(`/server/${server_id}/`)
      .then((result) => setServer(result))
      .fail((xhr, textStatus, errorThrown) => {
        setLoadingStatus(xhr.responseText);
      });
  }

  function getServices() {
    if (context.anon) {
      return Promise.resolve();
    }
    context.api
      .json(`/server/${server_id}/`)
      .then((result) => setServer(result));
    return context.api
      .proxyGet(`/project/${server_id}/${project}/`)
      .then((result) => {
        setServices(result);
        if (result.length > 0) {
          setWorking_dir(
            result[0].labels["com.docker.compose.project.working_dir"]
          );
        }
      })
      .fail((xhr, textStatus, errorThrown) => {
        setLoadingStatus(xhr.responseText);
        context.setErrorMessage(
          `Error getting project services: ${xhr.responseText} - ${errorThrown}`
        );
      });
  }

  function renderGitTab() {
    if (!context.admin) {
      return null;
    }

    return (
      <TabPanel>
        <AgentAction
          key={server_id}
          working_dir={working_dir}
          server_id={server_id}
          server={server}
          service={"git"}
          actions={["status", "pull", "fetch", "log", "branch", "clear"]}
        />
      </TabPanel>
    );
  }

  function renderComposeTab() {
    if (!context.admin) {
      return null;
    }
    return (
      <TabPanel>
        <AgentAction
          key={server_id}
          working_dir={working_dir}
          server_id={server_id}
          server={server}
          service={"compose"}
          actions={[
            "ps",
            "up",
            "up-build",
            "build",
            "stop",
            "logs",
            "restart",
            "clear",
          ]}
        />
      </TabPanel>
    );
  }

  if (context.anon) {
    return <LoginRequired />;
  }

  if (loadingStatus === "loading") {
    return <LoadingMessage title={project} />;
  }

  if (loadingStatus !== "done") {
    return <h3>Error {loadingStatus}</h3>;
  }

  return (
    <div>
      <h2>
        <Link
          to={`/server/${server_id}/project/${encodeURIComponent(project)}`}
          title={"Zoom to this project"}
        >
          {project}
        </Link>
      </h2>
      <Tabs>
        <TabList>
          <Tab>Containers</Tab>
          {context.admin && <Tab>Git</Tab>}
          {context.admin && <Tab>Compose</Tab>}
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
              {services.map((service) => (
                <ProjectService
                  key={service.id}
                  server_id={server_id}
                  server={server}
                  name={service.name}
                  details={service}
                  status={service.status}
                />
              ))}
            </tbody>
          </table>
        </TabPanel>
        {renderGitTab()}
        {renderComposeTab()}
      </Tabs>
    </div>
  );
}
