import React, {useContext} from "react";
import {AppContext} from './context';
import {useHistory} from 'react-router-dom';

export function NewServerForm() {
    const context = useContext(AppContext);
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        context.api.post('/server/', {name: formData.get('name'), port: formData.get('port')}).then(items => {

                context.setMessage(`${formData.get(name)} added`);
                history.push('/');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`${xhr.responseText} - ${errorThrown}`)
        )
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                />
            </div>
            <div>
                <label htmlFor="port">Port</label>
                <input
                    type="number"
                    id="port"
                    name="port"
                />
            </div>
            <button type={"submit"}>Create</button>
        </form>
    );
}