import React, {useContext} from "react";
import {AppContext} from './context';

export function NewServerForm(props) {
    const setNewServer = props.setNewServer;
    const getItems = props.getItems;

    const context = useContext(AppContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        return context.api.post('/server/', {name: formData.get('name'), port: formData.get('port')}).then(items => {
                context.setMessage(`${formData.get("name")} added`);
                setNewServer(false);
                getItems();
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        )
    };

    function clickTestConnection(e) {
        return context.api.json('/server_test_connection/', {
            name: $('input[name=name]').val(),
            port: $('input[name=port]').val()
        }).then(result => context.setMessage(`${result.message}`)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        )
    }

    const clickCancel = (evt) => {
        setNewServer(false);
    }

    return (<div>
            <form onSubmit={handleSubmit}>
                <div className={"form-group"}>
                    <label htmlFor="name">Name</label>
                    <input autoFocus={true}
                           required={true}
                           id="name"
                           name="name"
                           className={"form-control"}
                    />
                </div>
                <div className={"form-group"}>
                    <label htmlFor="port">Port</label>
                    <input
                        type="number"
                        required={true}
                        id="port"
                        name="port"
                        className={"form-control"}
                    />
                </div>
                <button className="ml-1 btn btn-default" type={"submit"}>Create</button>
                <button className="ml-1 btn btn-danger" onClick={evt => clickCancel(evt)}>Cancel</button>
                <button className="ml-1 btn btn-success" onClick={evt => clickTestConnection(evt)}>Test Connection</button>
            </form>
        </div>
    );
}