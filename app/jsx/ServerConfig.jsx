import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "./context";
import InlineConfirmButton from "react-inline-confirm";
import {Link} from "react-router-dom";
import TempMessage from "./TempMessage";

export function ServerConfig(props) {
    const [item, setItem] = useState(props.item);
    const [edit, setEdit] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const getItems = props.getItems;
    const context = useContext(AppContext);

    useEffect(() => {
        getSummary(item);
    }, [props]);

    const clickDeleteServer = (item) => {
        context.api.delete(`/server/${item.id}`).then(response => {
                context.setMessage(`Deleted ${response.item.name}`);
                getItems();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText}`)
        )
    }

    function getSummary(item) {
        context.api.json(`/server_summary/${item.id}`).then(response => {
                setItem({...item, summary: response});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`getSummary: ${xhr.responseText}`)
        )
    }

    function clickSubmit(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target))

        return context.api.put(`/server/${item.id}`, data).then(result => {
                setItem(result.item);
                setEdit(false);
                setMessage('updated');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        )
    }

    function renderEditButton() {
        const text = edit ? 'Cancel' : 'Edit';

        function click(evt) {
            setEdit(!edit);
            setItem(props.item);
        }

        return (<button className={"btn btn-sm btn-primary"} onClick={evt => click(evt)}>{text}</button>);
    }

    function renderButtons() {
        if (!edit) {
            return (renderEditButton());
        }
        return (<span>{renderEditButton()} <InlineConfirmButton className={"btn-sm btn-danger"}
                                                                textValues={['Delete', 'Confirm', 'Deleting']} showTimer
                                                                onClick={() => clickDeleteServer(item)}/></span>);
    }

    function renderItem() {
        if (edit) {
            return (<form onSubmit={(evt) => clickSubmit(evt)}>
                <input name={"name"} defaultValue={item.name}/>
                :
                <input name={"port"} defaultValue={item.port}/>
                <button className={"btn btn-sm btn-success"} type={"submit"}>✔</button>
            </form>);
        }
        return (<Link to={`/server/${item.id}`}>{item.name}</Link>);
    }

    function renderErrorMessage() {
        if (!errorMessage) {
            return null;
        }

        return (<p className={"alert alert-danger"}>{errorMessage}</p>);
    }

    function renderSummary() {
        if (!item?.summary) {
            if (errorMessage) {
                return null;
            }
            return <progress/>;
        }
        return (<span>{item?.summary?.containers}<TempMessage message={message} setMessage={setMessage}/></span>);
    }

    return (<tr key={item.id}>
        <td>
            {renderButtons()}
        </td>
        <td>
            {renderItem()}
            {renderErrorMessage()}
        </td>
        <td>
            {renderSummary()}
        </td>
    </tr>)
}