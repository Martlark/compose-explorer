/* controller for the stock page */

import {ModelBase} from "./models";
import {ViewBase} from "./views";

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
        this.status = ko.observable();
        this.project = ko.observable();
        this.service = ko.observable();
        this.logs = ko.observableArray([]);
        this.refreshLogs = ko.observable(true);
        this.previousLogHash = '';
    }

    getLogs() {
        $.getJSON(`/proxy/container/${this.id()}/logs`, {name: this.name()}
        ).then(result => {
                if (this.previousLogHash !== result.hash) {
                    this.logs([]);
                    result.logs.forEach(data => {
                        this.logs.push(new LogEntryModel(data))
                    });
                    this.previousLogHash = result.hash;
                    if (this.refreshLogs()) {
                        baseView.scrollToBottom();
                    }
                }
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting log: ${textStatus} - ${errorThrown}`)
        );
    }

    init() {
        ko.applyBindings(this);

        $.getJSON(`/proxy/container/${this.id()}/get`, {name: this.name()}
        ).then(result => {
                this.status(result.status);
                this.project(result.labels["com.docker.compose.project"]);
                this.service(result.labels["com.docker.compose.service"]);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting container: ${textStatus} - ${errorThrown}`)
        );
        this.getLogs();
        this.refreshLogsInteval = setInterval(() => {
            this.getLogs();
        }, 10000);
        this.refreshLogs.subscribe(newValue => {
            if (newValue) {
                this.refreshLogsInteval = setInterval(() => {
                    this.getLogs();
                }, 10000);

            } else {
                clearInterval(this.refreshLogsInteval);
            }
        });
        return this;
    }
}

$(document).ready(() => {
    baseView.pageView = new ContainerViewModel().init();
});

