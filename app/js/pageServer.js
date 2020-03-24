/* controller for the stock page */

import {ModelBase} from "./models";
import {ViewBase} from "./views";

class ContainerModel extends ModelBase {
    constructor(data) {
        super(data);
        this.server_id = ko.observable(data.server_id);
        this.name = ko.observable(data.name);
        this.status = ko.observable(data.status);
        this.project = ko.observable(data.labels["com.docker.compose.project"]);
        this.service = ko.observable(data.labels["com.docker.compose.service"]);
        this.href = ko.observable(`/container/${this.server_id()}/${this.name()}`);
        this.data = data;
    }
}

class VolumeModel extends ModelBase {
    constructor(data) {
        super(data);
        this.name = ko.observable(data.name);
        this.data = data;
    }
}

class ServerViewModel extends ViewBase {
    constructor(data) {
        super(data);
        this.id = ko.observable($("input[name=server-id]").val());
        this.name = ko.observable($("input[name=server-name]").val());
        this.credentials = ko.observable($("input[name=server-credentials]").val());
        this.containers = ko.observableArray([]);
        this.volumes = ko.observableArray([]);
    }

    init() {
        ko.applyBindings(this);
        $.getJSON(`/proxy/container/${this.id()}/list`
        ).then(result => {
                result.forEach(data => {
                    data.server_id = this.id();
                    this.containers.push(new ContainerModel(data))
                });
                this.containers.sort((l, r) => l.project().localeCompare(r.project()));
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting containers: ${textStatus} - ${errorThrown}`)
        );
        $.getJSON(`/proxy/volume/${this.id()}/list`
        ).then(result =>
            result.forEach(data => {
                this.volumes.push(new VolumeModel(data))
            })
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting volumes: ${textStatus} - ${errorThrown}`)
        );
        return this;
    }
}

$(document).ready(() => {
    baseView.pageView = new ServerViewModel().init();
});

