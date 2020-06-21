import React from "react";
import $ from "jquery";

export class ApiService {
    constructor(props) {
        this.csrf = $("input[name=base-csrf_token]").val();
        this.prefix_api = `/api`;
        this.prefix_command = `/command`;
    }

    json(url, params) {
        return $.getJSON(this.prefix_api + url, params)
    }

    post(url, data) {
        data.csrf = this.csrf;
        return $.post(this.prefix_api, data);
    }

    command(method = 'GET', data = {}) {
        const url = '/command'
        switch (method) {
            case "POST":
                data.csrf_token = this.csrf;
                return $.post(url, data);
            case "PUT":
                data.csrf_token = this.csrf;
                return $.put(url, data);
            case "DELETE":
                return $.ajax({
                    url: `${url}/${data}`,
                    type: 'DELETE',
                    data: {csrf_token: this.csrf}
                });
        }
        return $.getJSON(url, data);
    }

    proxyGet(url, params) {
        return $.getJSON('/proxy' + url, params)
    }

    proxyPost(url, data) {
        data.csrf_token = this.csrf;
        return $.post('/proxy' + url, data);
    }
}

// https://www.taniarascia.com/using-context-api-in-react/
export const AppContext = React.createContext({});
