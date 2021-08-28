import React, { useContext, useEffect, useState } from "react";
import ApiService from "./services/ApiService";
import toast, { Toaster } from "react-hot-toast";

export const ContextErrorMessage = ({ message }) => {
  const context = useContext(AppContext);
  if (!message) {
    return null;
  }
  return (
    <div className="alert alert-danger" role="alert">
      <a
        href="#"
        title="close"
        className="close"
        onClick={() => context.setErrorMessage(null)}
        aria-label="Close"
        aria-hidden="true"
      >
        &times;
      </a>
      <span id="flash-message">{message}</span>
    </div>
  );
};

export const ContextMessage = ({ message }) => {
  useEffect(() => {
    if (message) {
      toast.success(message);
    }
  }, [message]);

  return <Toaster toastOptions={{ duration: 15000 }} />;
};

function useStorage(key, initialValue = null) {
  const [value, setValue] = useState(
    localStorage.getItem(key) === null || window.g.anon
      ? initialValue
      : localStorage.getItem(key)
  );

  function setter(newValue) {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  }

  return [value, setter];
}

export function useContextState() {
  const [projects, setProjects] = useState([]);
  const [serverId, setServerId] = useStorage("serverId", 0);
  const [serverName, setServerName] = useStorage("serverName", "");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [anon, setAnon] = useState(window.g?.anon);
  const [admin, setAdmin] = useState(window.g?.admin);
  const [userId, setUserId] = useState(window.g?.id);
  const [ldap] = useState(window.g?.LDAP);

  return {
    api: new ApiService(),
    projects,
    setProjects,
    serverId,
    setServerId,
    serverName,
    setServerName,
    message,
    setMessage,
    errorMessage,
    setErrorMessage,
    anon,
    setAnon,
    admin,
    setAdmin,
    userId,
    setUserId,
    ldap,
  };
}

// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const AppContext = React.createContext({});
