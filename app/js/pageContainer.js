/* controller for the stock page */

import {ModelBase} from "./models";
import {ViewBase} from "./views";

class ContainerModel extends ModelBase {
    constructor(data) {
        super(data);
        this.name = ko.observable(data.name);
        this.status = ko.observable(data.status);
        this.project = ko.observable(data.labels["com.docker.compose.project"]);
        this.service = ko.observable(data.labels["com.docker.compose.service"]);
        this.data = data;
    }
}

class LogEntryModel extends ModelBase {
    constructor(data) {
        super(data);
        this.text = ko.observable(data);
    }
}

class ContainerViewModel extends ViewBase {
    constructor(data) {
        super(data);
        this.id = ko.observable($("input[name=server-id]").val());
        this.name = ko.observable($("input[name=container-name]").val());
        this.credentials = ko.observable($("input[name=server-credentials]").val());
        this.container = ko.observable();
        this.logs = ko.observableArray([]);
    }

    init() {
        ko.applyBindings(this);

        $.getJSON(`/proxy/container/${this.id()}/get`, {name:this.name()}
        ).then(result => this.container(new ContainerModel(result))
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting container: ${textStatus} - ${errorThrown}`)
        );

        $.getJSON(`/proxy/container/${this.id()}/logs`, {name:this.name()}
        ).then(result =>
            result.forEach(data => {
                this.logs.push(new LogEntryModel(data))
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting log: ${textStatus} - ${errorThrown}`)
        );
        return this;
    }
}

$(document).ready(() => {
    baseView.pageView = new ContainerViewModel().init();
});

