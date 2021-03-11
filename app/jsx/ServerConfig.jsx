import React, {useContext, useEffect, useState} from "react";
import {AppContext, ServerService} from "./context";
import InlineConfirmButton from "react-inline-confirm";
import {Link} from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import TempMessage from "./TempMessage";

export function ServerConfig(props) {
    const [item, setItem] = useState(props.item);
    const [edit, setEdit] = useState(false);
    const [waiting, setWaiting] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const getItems = props.getItems;
    const context = useContext(AppContext);
    const api = new ServerService(props.item);

    useEffect(() => {
        getSummary(item);
    }, [props]);

    const clickDeleteServer = (item) => {
        setWaiting('Deleting');
        api.delete().then(response => {
                context.setMessage(`Deleted ${response.item.name}`);
                getItems();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText}`)
        ).always(() => setWaiting(''));
    }

    function getSummary(item) {
        api.getSummary(setItem).fail((xhr, textStatus, errorThrown) => {
                setErrorMessage(`getSummary: ${xhr.responseText}`);
            }
        );
    }

    function clickSubmit(evt) {
        setWaiting('Updating');
        return api.update(evt, setItem).then(result => {
                setEdit(false);
                setMessage('updated');
                getSummary(item);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        ).always(() => setWaiting(null));
    }

    function clickTestConnection(evt) {
        evt.preventDefault();
        setWaiting('Testing');
        setErrorMessage('');
        const formData = Object.fromEntries(new FormData(evt.target.form));

        api.testConnection(formData.name, formData.port).then(result => setMessage('Connected')).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        ).always(() => setWaiting(null));
    }

    function renderEditButton() {
        const text = edit ? 'Cancel' : 'Edit';

        function click(evt) {
            setEdit(!edit);
            setErrorMessage('');
            setMessage('');
            setItem(props.item);
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

    function renderItem() {
        if (waiting) {
            return null;
        }

        const testButton = <button className="btn btn-sm btn-warning"
                                   onClick={(evt) => clickTestConnection(evt)}
        >Test connection</button>
        const form = <form onSubmit={(evt) => clickSubmit(evt)}>
            <input name={"name"} defaultValue={item.name}/>
            :
            <input name={"port"} defaultValue={item.port}/>
            {testButton}
            <button className={"btn btn-sm btn-success"} type={"submit"}>✔</button>
        </form>
        const link = <Link to={`/server/${item.id}`}>{item.name}</Link>;

        if (edit) {
            return (<div>{form}</div>);
        }
        return (<div>{link}</div>);
    }


    function renderSummary() {
        if (waiting){
            return <p>{waiting}... <progress/></p>;
        }
        return (<span>{item?.summary?.containers}</span>);
    }

    return (<tr key={item.id}>
        <td>
            {renderButtons()}
        </td>
        <td>
            {renderItem()}
            <TempMessage message={message} setMessage={setMessage}/>
            <ErrorMessage errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>
        </td>
        <td>
            {renderSummary()}
        </td>
    </tr>)
}