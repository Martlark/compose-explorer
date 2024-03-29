import React, { useContext, useEffect, useState } from "react";
import { ContentState, Editor, EditorState } from "draft-js";
import { AppContext } from "../context";
import LoginRequired from "../LoginRequired";
import AuditService from "../services/AuditService";

export default function FileEdit(props) {
  const [originalContent, setOriginalContent] = useState(
    ContentState.createFromText("")
  );
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [server, setServer] = useState({});

  let editor = null;
  const u = new URLSearchParams(props.location.search);
  const file_name = u.get("filename").split("#")[0];
  const name = props.match.params.name;
  const id = props.match.params.id;
  const context = useContext(AppContext);
  const auditServer = new AuditService();

  const onChange = (editorState) => setEditorState(editorState);
  const setEditor = (e) => {
    editor = e;
  };

  function focusEditor() {
    if (editor) {
      editor.focus();
    }
  }

  useEffect(() => {
    context.api
      .json(context.api.urlJoin("server", id))
      .then((result) => setServer(result));
    context.api
      .container(id, name)
      .then((result) => {})
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error getting container: ${xhr.responseText} - ${errorThrown}`
        )
      );
    getContent();
  }, [id, name, file_name]);

  function getContent() {
    return context.api
      .proxyPost(`/container/${id}/download/`, {
        name: name,
        filename: file_name,
      })
      .then((result, textStatus, request) => {
        focusEditor();
        const content = ContentState.createFromText(result);
        setEditorState(EditorState.createWithContent(content));
        setOriginalContent(content);
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(`Error: ${xhr.responseText} - ${errorThrown}`)
      );
  }

  function renderTitle() {
    return (
      <div>
        <h3 className="">{name}</h3>
        <p className="alert alert-warning">{file_name}</p>
      </div>
    );
  }

  function clickSave(evt) {
    return context.api
      .proxyPost(`/container/${id}/upload/`, {
        name: name,
        filename: file_name,
        content: editorState.getCurrentContent().getPlainText(),
      })
      .then((result, textStatus, request) => {
        context.setMessage(`Saved: ${result.base_filename}`);
        auditServer.create(evt, {
          action_type: "file-save",
          action: `${result.dest_path}/${result.base_filename}`,
          container_name: props.container_name,
          server_name: server.name,
        });
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
      );
  }

  function clickRestore(evt) {
    setEditorState(EditorState.createWithContent(originalContent));
  }

  const editorContainerStyles = {
    border: "1px solid gray",
    padding: "5px",
    minHeight: "20em",
  };

  if (context.anon) {
    return <LoginRequired />;
  }

  if (!server.write) {
    return <h3>Server write access required</h3>;
  }

  return (
    <div>
      {renderTitle()}
      <button
        className={"btn btn-sm"}
        onClick={(evt) => clickSave(evt)}
        title={"Save"}
      >
        Save <span className="material-icons">save</span>
      </button>
      <button
        className={"btn btn-sm"}
        onClick={(evt) => clickRestore(evt)}
        title={"Undo changes"}
      >
        Reload <span className="material-icons">cached</span>
      </button>
      <div style={editorContainerStyles} onClick={focusEditor}>
        <Editor ref={setEditor} editorState={editorState} onChange={onChange} />
      </div>
    </div>
  );
}
