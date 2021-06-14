import React, {useContext, useEffect, useState} from "react";
import {AppContext} from "../context";
import InlineConfirmButton from "react-inline-confirm";
import {Link} from "react-router-dom";
import ErrorMessage from "../ErrorMessage";
import TempMessage from "../TempMessage";
import ServerService from "../services/ServerService";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

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
        const testButton = <Button className="btn btn-sm btn-warning" title="Test the connection"
                                   onClick={(evt) => clickTestConnection(evt)}
        >Test connection</Button>
        const form = <Form onSubmit={(evt) => clickSubmit(evt)}>
            <Form.Group size="lg" controlId="name">
                <Form.Label> Agent Server:</Form.Label>
                <Form.Control autoFocus name="name" defaultValue={item.name}/>

            </Form.Group>
            <Form.Group size="lg" controlId="port">
                <Form.Label> Port: </Form.Label>
                <Form.Control name="port" defaultValue={item.port}/>
            </Form.Group>
            <Form.Group size="lg" controlId="credentials">
                <Form.Label>Credentials:</Form.Label>
                <Form.Control name={"credentials"} defaultValue={item.credentials}/>
            </Form.Group>
            {testButton}{' '}
            <Button className={"btn btn-sm btn-success"} type={"submit"} title="Update values">✔</Button>
        </Form>

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
        api.remove(

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

        return (<Button className={"btn btn-sm btn-primary"} onClick={evt => click(evt)}>{text}</Button>);
    }

    function renderButtons() {
        if (waiting || !context.admin) {
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