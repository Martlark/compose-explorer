import React, {useContext, useEffect, useState} from "react";
import {AppContext, ServerService} from "./context";
import InlineConfirmButton from "react-inline-confirm";
import {Link} from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import TempMessage from "./TempMessage";

function EditShowItem(props) {
    const [item, setItem] = useState(props.item)
    const [waiting, setWaiting] = useState('');
    const [message, setMessage] = useState('');
    const api = new ServerService(props.item);
    const context = useContext(AppContext);

    useEffect(() => {
        setMessage('');
        setWaiting('');
    }, [props])

    function clickSubmit(evt) {
        setWaiting('Updating');
        return api.update(evt, setItem
        ).then(result => {
                props.setEdit(false);
                context.setMessage('updated');
                setItem(result.item);
                props.setItem(result.item);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setMessage(`${xhr.responseText} - ${errorThrown}`)
        ).always(() => setWaiting(null));
    }

    function clickTestConnection(evt) {
        evt.preventDefault();
        setWaiting('Testing');
        setMessage('');
        const formData = Object.fromEntries(new FormData(evt.target.form));

        api.testConnection(formData.name, formData.port, formData.credentials
        ).then(result => setMessage('Connected')
        ).fail((xhr, textStatus, errorThrown) =>
            setMessage(`${xhr.responseText} - ${errorThrown}`)
        ).always(() => setWaiting(null));
    }

    if (props.edit) {
        const testButton = <button className="btn btn-sm btn-warning" title="Test the connection"
                                   onClick={(evt) => clickTestConnection(evt)}
        >Test connection</button>
        const form = <form onSubmit={(evt) => clickSubmit(evt)}>
            <label> Agent Server:
                <input name={"name"} defaultValue={item.name}/>
            </label>
            <label> Port:
                <input name={"port"} defaultValue={item.port}/>
            </label>
            <br/>
            <label>Credentials:
                <input name={"credentials"} defaultValue={item.credentials}/>
            </label>
            <br/>
            {testButton}
            <br/>
            <button className={"btn btn-sm btn-success"} type={"submit"} title="Update values">✔</button>
        </form>

        return (<div>
            {form}
            <h3>{waiting}</h3>
            <TempMessage message={message} setMessage={setMessage}/>
        </div>);
    }
    const link = <Link to={`/server/${item.id}`}>{item.name}</Link>;
    return (<div>{link}</div>);
}

export function ServerConfig(props) {
    const [item, setItem] = useState(props.item);
    const [edit, setEdit] = useState(false);
    const [waiting, setWaiting] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const getItems = props.getItems;
    const context = useContext(AppContext);
    const api = new ServerService(props.item);

    useEffect(() => {
        getSummary(item);
    }, [props]);

    const clickDeleteServer = (item) => {
        setWaiting('Deleting');
        api.delete(

        ).then(response => {
                context.setMessage(`Deleted ${response.item.name}`);
                getItems();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText}`)
        ).always(() => setWaiting(''));
    }

    function getSummary(item) {
        setErrorMessage('');
        api.getSummary(setItem
        ).fail((xhr, textStatus, errorThrown) => {
                setErrorMessage(`getSummary: ${xhr.responseText}`);
            }
        );
    }

    function renderEditButton() {
        const text = edit ? 'Cancel' : 'Edit';

        function click(evt) {
            setEdit(!edit);
            setErrorMessage('');
        }

        return (<button className={"btn btn-sm btn-primary"} onClick={evt => click(evt)}>{text}</button>);
    }

    function renderButtons() {
        if (waiting) {
            return null;
        }
        if (!edit) {
            return (renderEditButton());
        }
        return (<span>{renderEditButton()} <InlineConfirmButton className={"btn-sm btn-danger"}
                                                                textValues={['Delete', 'Confirm', 'Deleting']} showTimer
                                                                onClick={() => clickDeleteServer(item)}/></span>);
    }


    function renderSummary() {
        if (waiting) {
            return <p>{waiting}... <progress/></p>;
        }
        return (<span title="number of containers">{item?.summary?.containers}</span>);
    }

    return (<tr key={item.id}>
        <td>
            {renderButtons()}
        </td>
        <td>
            <EditShowItem item={item} setItem={setItem} edit={edit} setEdit={setEdit}/>
            <ErrorMessage errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
        </td>
        <td>
            {renderSummary()}
        </td>
    </tr>)
}