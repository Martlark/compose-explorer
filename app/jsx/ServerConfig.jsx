import React, {useContext, useState} from "react";
import {AppContext} from "./context";
import InlineConfirmButton from "react-inline-confirm";
import {Link} from "react-router-dom";

export function ServerConfig(props) {
    const [item, setItem] = useState(props.item);
    const [edit, setEdit] = useState(false);
    const [message, setMessage] = useState('');
    const getItems = props.getItems;
    const context = useContext(AppContext);

    const clickDeleteServer = (item) => {
        context.api.delete(`/server/${item.id}`).then(response => {
                context.setMessage(`Deleted ${response.item.name}`);
                getItems();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText}`)
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

    function updateMessage(msg) {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    }

    function clickSubmit(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target))

        return context.api.put(`/server/${item.id}`, data).then(result => {
                setItem(result.item);
                setEdit(false);
                updateMessage('updated')
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        )
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

    function renderMessage() {
        if (!message) {
            return null;
        }
        return (<span className={"alert alert-warning"}>{message}</span>);
    }

    return (<tr key={item.id}>
        <td>
            {renderButtons()}
        </td>
        <td>
            {renderItem()}
        </td>
        <td>
            {item.summary.containers || item.summary.error}{renderMessage()}
        </td>
    </tr>)
}