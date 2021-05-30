import React, {useContext, useEffect} from "react";
import $ from "jquery";

export const ContextErrorMessage = ({message}) => {
    const context = useContext(AppContext);
    if (!message) {
        return null;
    }
    return (<div
        className="alert alert-danger"
        role="alert">
        <a href="#" title="close" className="close" onClick={() => context.setErrorMessage(null)}
           aria-label="Close"
           aria-hidden="true">&times;</a>
        <span id="flash-message">{message}</span>
    </div>)
}

export const ContextMessage = ({message}) => {
    const context = useContext(AppContext);
    useEffect(() => {
        if (message)
            setTimeout(() => context.setMessage(null), 5000);
    }, [message])
    return (message && <h3 className={"alert alert-info"}>{message}</h3>)
}

class ApiBase{

    urlJoin(base, url) {
        let fullPath = `${base}/${url}/`;
        fullPath = fullPath.replaceAll('//', '/');
        fullPath = fullPath.replaceAll(/[ps]:\//g, '://');
        return fullPath;
    }

}

export class ApiService extends ApiBase{
    constructor(props) {
        super();
        this.csrf_token = $("input[name=base-csrf_token]").val();
        this.prefix_api = `/api`;
        this.prefix_command = `/command`;
    }

    container(id, name) {
        return this.proxyGet(`/container/${id}/get/`, {name})
    }

    json(url, params) {
        return $.getJSON(this.urlJoin(this.prefix_api, url), params)
    }

    put(url, data) {
        data.csrf_token = this.csrf_token;
        const urlPath = this.urlJoin(this.prefix_api, url);
        return $.ajax({
            url: urlPath,
            type: 'PUT',
            data: data
        });
    }

    post(url, data) {
        data.csrf_token = this.csrf_token;
        return $.post(this.urlJoin(this.prefix_api, url), data);
    }

    delete(url) {
        const urlPath = this.urlJoin(this.prefix_api, url);
        return $.ajax({
            url: urlPath,
            type: 'DELETE',
            data: {csrf_token: this.csrf_token}
        });
    }

    command(method = 'GET', data = {}) {
        const url = '/command/'
        switch (method.toUpperCase()) {
            case "POST":
                data.csrf_token = this.csrf_token;
                return $.post(url, data);
            case "PUT":
                data.csrf_token = this.csrf_token;
                return $.put(url, data);
            case "DELETE":
                return $.ajax({
                    url: this.urlJoin(url, data),
                    type: 'DELETE',
                    data: {csrf_token: this.csrf_token}
                });
        }
        return $.getJSON(url, data);
    }

    proxyGet(url, params) {
        return $.getJSON(this.urlJoin(`/proxy`, url), params)
    }

    proxyPost(url, data) {
        data.csrf_token = this.csrf_token;
        return $.post(this.urlJoin('/proxy', url), data);
    }

    projects(server_id) {
        return this.proxyGet(this.urlJoin(`/projects/`, server_id)
        ).then(result => {
                return result.map(data => {
                    data.server_id = server_id;
                    return data
                });
            }
        );
    }
}

export class ServerService extends ApiBase{
    constructor(props) {
        super();
        this.item = props;
        this.api = new ApiService();
    }

    delete() {
        return this.api.delete(this.urlJoin(`/server/`,this.item.id));
    }

    getSummary(setItem) {
        return this.api.json(`/server_summary/${this.item.id}/`).then(response => {
                setItem({...this.item, summary: response});
            }
        )
    }

    update(evt, setItem) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target));

        return this.api.put(this.urlJoin(`/server/`, this.item.id), data).then(result => {
            this.item = result.item;
            setItem(result.item);
        });
    }

    testConnection(name, port, credentials) {
        return this.api.json('/server_test_connection/', {name, port, credentials});
    }

    create(evt, name, port, credentials) {
        const formData = new FormData(evt?.target);
        evt?.preventDefault();

        return this.api.post('/server/', {
            credentials: credentials ?? formData.get('credentials'),
            name: name ?? formData.get('name'),
            port: port ?? formData.get('port')
        }).then(result => this.item = result
        );
    };
}

// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const
    AppContext = React.createContext({});
