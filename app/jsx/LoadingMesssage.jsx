import React from "react";

export default function LoadingMessage(props) {
  const status = props?.status || "loading";

  if ("loading" === status) {
    return (
      <div>
        <h2>Loading...{props.title}</h2>
        <img alt="loading..." src="/static/images/loading.gif" />
      </div>
    );
  }

  return <h3 className={"alert alert-danger"}>Error {status}</h3>;
}
