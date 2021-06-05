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


class ApiBase {
    constructor() {

        this.api = new ApiService();

    }

    /**
     * join all urls given as parameters with a / so that
     * it ends up with a leading and trailing slash
     * @type {string}
     */


}

export function urlJoin(...urls) {
    let fullPath = `/${urls.join('/')}/`;
    fullPath = fullPath.replaceAll('//', '/');
    fullPath = fullPath.replace(/[ps]:\//, '://');
    return fullPath;
}

export class ApiService {
    constructor(props) {
        this.csrf_token = $("input[name=base-csrf_token]").val();
        this.prefix_api = `/api`;
    }

    setPrefix(newPrefix) {
        this.prefix_api = newPrefix;
    }

    container(id, name) {
        return this.proxyGet(urlJoin(`container`, id, 'get'), {name})
    }

    /***
     * return a json object according to the ur and params
     *
     * @param url
     * @param params
     * @returns {*|jQuery}
     */
    json(url, params) {
        return $.getJSON(urlJoin(this.prefix_api, url), params)
    }

    put(url, data) {
        data.csrf_token = this.csrf_token;
        const urlPath = urlJoin(this.prefix_api, url);
        return $.ajax({
            url: urlPath,
            type: 'PUT',
            data: data
        });
    }

    post(url, data={}) {
        data.csrf_token = this.csrf_token;
        return $.post(urlJoin(this.prefix_api, url), data);
    }

    delete(url) {
        const urlPath = urlJoin(this.prefix_api, url);
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
                    url: urlJoin(url, data),
                    type: 'DELETE',
                    data: {csrf_token: this.csrf_token}
                });
        }
        // default is get
        return $.getJSON(url, data);
    }

    proxyGet(url, params) {
        return $.getJSON(urlJoin(`proxy`, url), params)
    }

    proxyPost(url, data) {
        data.csrf_token = this.csrf_token;
        return $.post(urlJoin('proxy', url), data);
    }

    projects(server_id) {
        return this.proxyGet(urlJoin(`projects`, server_id)
        ).then(result => {
                return result.map(data => {
                    data.server_id = server_id;
                    return data
                });
            }
        );
    }
}

export class ServerService extends ApiService {
    constructor(props) {
        super();
        this.item = props;
    }

    remove() {
        return this.delete(urlJoin(`server`, this.item.id));
    }

    getSummary(setItem) {
        return this.json(urlJoin('server_summary', this.item.id)).then(response => {
                setItem({...this.item, summary: response});
            }
        )
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(urlJoin(`server`, this.item.id), data).then(result => {
            this.item = result.item;
            setItem(result.item);
        });
    }

    testConnection(name, port, credentials) {
        return this.json('/server_test_connection/', {name, port, credentials});
    }

    create(evt, name, port, credentials) {
        const formData = new FormData(evt?.target);
        evt?.preventDefault();

        return this.post('/server/', {
            credentials: credentials ?? formData.get('credentials'),
            name: name ?? formData.get('name'),
            port: port ?? formData.get('port')
        }).then(result => this.item = result
        );
    };
}


export class AuthService extends ApiService {
    constructor(props) {
        super();
        this.item = props;
        this.setPrefix('auth')
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(urlJoin('user', data.id), data);
    }

    remove(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.delete(urlJoin('user', data.id), data);
    }

    set_password(evt=null) {
        const formData = new FormData(evt?.target);

        return this.post(urlJoin('user_set_password', formData.get('id')), {
            id: formData.get('id'),
            password: formData.get('password')
        })
    };

    create(evt, email=null, password=null) {
        const formData = new FormData(evt?.target);

        return this.post(urlJoin('user'), {
            email: email ?? formData.get('email'),
            password: password ?? formData.get('password')
        })
    };
}

export class ProfileService extends ApiService {
    constructor() {
        super();
        this.setPrefix('profile')
    }

    login(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target));

        return this.api.post(urlJoin('login'), data).then(result => {
            {
                console.log('login', result);
                window.g = result;
                return result;
            }
        });
    }

    logout() {
        return this.post(urlJoin('logout'), {});
    }

    update(evt) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(urlJoin('user'), data);
    }
}

// https://www.robinwieruch.de/react-function-component
// https://www.taniarascia.com/using-context-api-in-react/
export const
    AppContext = React.createContext({});
