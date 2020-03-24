/* controller for the stock page */

import {ModelBase} from "./models";
import {ViewBase} from "./views";

class ContainerModel extends ModelBase {
    constructor(data) {
        super(data);
        this.name = ko.observable(data.name);
        this.id = ko.observable(data.id);
        this.status = ko.observable(data.status);
        this.data = data;
    }
}

class ServerViewModel extends ViewBase {
    constructor(data) {
        super(data);
        this.id = ko.observable($("input[name=server-id]").val());
        this.name = ko.observable($("input[name=name]").val());
        this.credentials = ko.observable($("input[name=credentials]").val());
        this.containers = ko.observableArray([]);
    }

    init() {
        ko.applyBindings(this);
        $.getJSON(`/proxy/containers/${this.id()}/list`).then(result =>
            result.forEach(data => {
                this.containers.push(new ContainerModel(data))
            })).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting images: ${textStatus} - ${errorThrown}`)
        );
        this.updating = ko.observable(false);
        return this;
    }
}

$(document).ready(() => {
    baseView.pageView = new ServerViewModel().init();
});

