/* view base classes */

import {AddressModel, MessageModel} from "./models";

export class ViewBase {
    constructor(props = {}) {
        this.message = ko.observable(props.message || "");
        this.updating = ko.observable(props.updating || true);
        this.mode = ko.observable(props.mode || 'view');
        this.isMobile = ko.observable($(".navbar-toggle:visible").length);
        this.search = ko.observable('');
        this.search.subscribe(newValue => this.searchText(newValue));
        this.searchConfig = null;
        setInterval(() => this.isMobile($(".navbar-toggle:visible").length), 5000);
    }



    /**
     * check multiple csv states
     * @param modeValues
     * @returns {boolean}
     */
    hasMode(modeValues) {
        const modes = modeValues.split(',');
        return modes.includes(this.mode());
    }

    /**
     * add a message to the view and then
     * remove it after 5 seconds
     * @param msg
     */
    tempMessage(msg) {
        this.message(msg);
        setTimeout(() => {
            this.message('')
        }, 5000);
    }
}
