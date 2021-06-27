import React, {useContext, useEffect, useState} from 'react'
import join from 'join-path'
import {AppContext} from "../context";
import {Link} from "react-router-dom";
import AuditService from "../services/AuditService";

function DirectoryEntry(props) {
    const [entry, setEntry] = useState(props.entry);

    const editButton = <a href={"#"} className={"btn"} onClick={evt => clickEditSelected(evt)}
                          title={"Edit selected files"}><span
        className="material-icons">edit</span></a>;

    /***
     * download_container_file any selected that are not directories.  they will download_container_file as tar
     * @param evt
     */
    function linkToEdit() {
        const fileName = join(props.directoryPath, entry.linked_file_name || entry.file_name);
        const encodedFileName = encodeURIComponent(fileName)
        return <Link to={`/server/${props.id}/container_file_edit/${props.name}?filename=${encodedFileName}`}
                     target="_blank">
            <span className="material-icons">edit</span>
        </Link>;
    }

    function clickDirectory(evt, fileName) {
        evt.preventDefault();
        props.parentChangeDirectory(fileName);
    }

    function renderFilename() {
        if (entry.dir_type === 'd') {
            return (<a href={"#"}
                       onClick={evt => clickDirectory(evt, entry.file_name)}>{entry.file_name}</a>)
        }
        return entry.file_name;
    }

    function checkboxOnChange(event) {
        props.selectEntry(entry.file_name, event.target.checked);
    }

    function renderSelectionMode() {
        if (entry.dir_type !== 'd') {
            return (<>
                <td>
                    <input type="checkbox" name="selected" onChange={checkboxOnChange}/>
                    {linkToEdit()}
                </td>
                <td>{entry.modes}</td>
            </>)
        } else {
            return <>
                <td>&nbsp;</td>
                <td>{entry.modes}</td>
            </>
        }
    }

    return (
        <tr>
            {renderSelectionMode()}
            <td>{entry.size}</td>
            <td>{entry.modified}</td>
            <td>{renderFilename()}</td>
            <td>{entry.linked_file_name}</td>
        </tr>
    )
}

export default function Directory(props) {
    const [pwd, setPwd] = useState(props.pwd);
    const [directoryPath, setDirectoryPath] = useState('');
    const [directoryParent, setDirectoryParent] = useState('..');
    const [directoryEntries, setDirectoryEntries] = useState([]);
    const [directoryGetting, setDirectoryGetting] = useState(false);

    const context = useContext(AppContext);
    const auditService = new AuditService();
    const id = props.id;
    const name = props.name;

    useEffect(() => {
        getDirectory(pwd);
    }, [pwd]);

    function clickUpDirectory(evt) {
        getDirectory(join(pwd, '..'));
    }

    function clickDirectory(evt, dir = '/') {
        getDirectory(dir);
    }

    function clickDeleteSelected(evt) {
        setDirectoryGetting(true);

        const selected = directoryEntries.filter(dir => dir.selected);
        const cmd = `(cd ${directoryPath} && rm ${selected.map(dir => '"' + dir.file_name + '"').join(' ')})`;
        return context.api.proxyPost(`/container/${id}/exec_run/`, {
                name,
                cmd,
            }
        ).then(result => {
                context.setMessage(result);
                auditService.create(evt, {
                    action_type: 'file-delete',
                    action: cmd,
                    container_name: props.container_name
                });

                return getDirectory(pwd);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error: ${xhr.responseText} - ${errorThrown}`)
        ).always(() => setDirectoryGetting(false)
        )
    }

    /***
     * download_container_file any selected that are not directories.  they will download_container_file as tar
     * @param evt
     */
    function clickDownloadSelected(evt) {
        const selected = directoryEntries.filter(dir => dir.selected && dir.dir_type !== 'd');
        selected.forEach(dir => {
            const filename = join(directoryPath, dir.linked_file_name || dir.file_name)
            return context.api.proxyPost(`/container/${id}/download/`, {
                    name: name,
                    filename,
                }
            ).then((result, textStatus, request) => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob([result]));
                    a.download = dir.file_name;
                    a.click();
                }
            ).fail((xhr, textStatus, errorThrown) =>
                context.setErrorMessage(`Error: ${xhr.responseText} - ${errorThrown}`)
            )
        });
    }

    function changeDirectory(directoryName) {
        const pwd = join(directoryPath, directoryName);
        getDirectory(pwd);
    }

    function getDirectory(pwd) {
        setDirectoryGetting(true);
        return context.api.proxyGet(`/container/${id}/ls/`, {name: name, pwd: pwd}
        ).then(result => {
                setPwd(result.pwd);
                setDirectoryPath(result.path);
                setDirectoryParent(result.parent);
                setDirectoryEntries(result.entries);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
        ).always(() => setDirectoryGetting(false)
        )
    }

    function renderActions() {
        if (!directoryPath) {
            return <h3>No directory found</h3>
        }

        const upButton = (directoryPath !== '/') ?
            <a href={"#"} className={"btn"} onClick={evt => clickUpDirectory(evt)}
               title={"Up one level of directory"}><span
                className="material-icons">reply</span></a> : null;
        const deleteButton = <a href={"#"} className={"btn"} onClick={evt => clickDeleteSelected(evt)}
                                title={"Remove selected files"}><span
            className="material-icons">delete</span></a>;
        const downloadButton = <a href={"#"} className={"btn"} onClick={evt => clickDownloadSelected(evt)}
                                  title={"Download selected files"}><span
            className="material-icons">arrow_downward</span></a>;
        const refreshButton = <a href={"#"} className={"btn"} onClick={evt => clickDirectory(evt, pwd)}
                                 title={"Refresh"}><span
            className="material-icons">cached</span></a>;
        const getting = directoryGetting ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
        </div> : null;
        let cwd = '/';
        const directoryLinks = [];
        directoryPath.split('/').forEach((dir, index) => {
            if (index === 0 || dir.length) {
                cwd = join(cwd, dir);
                directoryLinks.push({cwd: cwd, dir: dir});
            }
        });

        return (
            <div>
                {refreshButton}
                {props.server.write && downloadButton}
                {props.server.write && deleteButton}
                {upButton}
                {directoryLinks.map(d =>
                    <a href={"#"} onClick={(evt) => clickDirectory(evt, d.cwd)}
                       title={d.cwd}>{d.dir}&nbsp;/&nbsp;</a>
                )}
                {getting}
            </div>
        );
    }

    function selectEntry(fileName, state) {
        let data = directoryEntries;
        data.some(entry => {
            if (entry.file_name === fileName) {
                entry.selected = state;
                return true;
            }
        })
        setDirectoryEntries(data)
    }

    return (
        <div>
            {renderActions()}

            <table className={"table"}>
                <thead>
                <tr>
                    <th>&nbsp;</th>
                    <th>Modes</th>
                    <th>Size</th>
                    <th>Modified</th>
                    <th>Name</th>
                    <th>link</th>
                </tr>
                </thead>
                <tbody>
                {directoryEntries.map(entry => <DirectoryEntry entry={entry}
                                                               id={id}
                                                               name={name}
                                                               key={entry.file_name}
                                                               parentChangeDirectory={changeDirectory}
                                                               directoryPath={directoryPath}
                                                               selectEntry={selectEntry}/>)}
                </tbody>
            </table>
        </div>
    )
}
