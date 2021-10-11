import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  AppContext,
  ContextErrorMessage,
  ContextMessage,
  useContextState,
} from "./context";

import ManageServer, {
  route as manageServerRoute,
} from "./server/ManageServer";
import ManageContainer from "./server/ManageContainer";
import FileEdit from "./server/FileEdit";
import LogContent from "./server/LogContent";
import Home from "./Home";
import Project, { route as projectRoute } from "./server/Project";
import { Navigation } from "./Navigation";
import { Login } from "./auth/Login";
import { Logout } from "./auth/Logout";
import UserAdmin, { route as userAdminRoute } from "./admin/user/UserAdmin";
import UserProfile from "./auth/UserProfile";
import GroupAdmin from "./admin/group/GroupAdmin";
import GroupEdit, { routeGroupEdit } from "./admin/group/GroupEdit";
import NotFound from "./NotFound";
import AuditAdmin, { route as auditAdminRoute } from "./admin/audit/AuditAdmin";

export function Index() {
  const contextState = useContextState();
  return (
    <AppContext.Provider value={contextState}>
      <Router>
        <Navigation />
        <ContextMessage message={contextState.message} />
        <ContextErrorMessage message={contextState.errorMessage} />
        <div className={"container-fluid"}>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path={manageServerRoute} component={ManageServer} />
            <Route exact path={projectRoute} component={Project} />
            <Route
              exact
              path="/server/:id/container/:name"
              component={ManageContainer}
            />
            <Route
              exact
              path="/server/:id/container_file_edit/:name"
              component={FileEdit}
            />
            <Route
              exact
              path="/server/:id/container_log/:name"
              component={LogContent}
            />
            <Route exact path="/login/" component={Login} />
            <Route exact path="/logout/" component={Logout} />
            <Route exact path={userAdminRoute} component={UserAdmin} />
            <Route exact path={auditAdminRoute} component={AuditAdmin} />
            <Route exact path="/groups/" component={GroupAdmin} />
            {routeGroupEdit.Route()}
            <Route exact path="/profile/" component={UserProfile} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

ReactDOM.render(<Index />, document.getElementById("jsx_content"));
