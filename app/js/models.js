/* models for DTOs */

export class ModelBase {
    constructor(data) {
        this.dirtyList = []; // put props here to check if changed
        this.id = ko.observable(data && data.id);
        this.message = ko.observable("");
        this.mode = ko.observable('view');
        this.visible = ko.observable(true);
        this.isRemoved = ko.observable(false);
        this.selected = ko.observable(false);

        this.previousState = '';
        this.clearDirty();
        this.isMobile = ko.observable($(".navbar-toggle:visible").length);
        this.apiUrl = null;
        setInterval(() => this.isMobile($(".navbar-toggle:visible").length), 5000);
    }

    /**
     * 1. add a ko.observable or observableArray
     * 2. add it to the class and push to the dirtyList
     *
     * Notes: start a property name with "." to create an observable but do not add to
     * dirty list.
     * clearDirty() is called after observable is created.
     * @param data - object or single item to populate the model instance with
     * @param propertyNames - one name or list of names of the property to create and prop in data
     * @return {*} - the observable
     */
    koSerializable(data, propertyNames) {
        if (!Array.isArray(propertyNames))
            propertyNames = [propertyNames];

        propertyNames.forEach(propertyName => {
            if (propertyName.startsWith(".")) {
                propertyName = propertyName.slice(1)
            } else {
                this.dirtyList.push(propertyName);
            }
            // set the value
            if (typeof data == 'object') {
                // from data packet
                if (Array.isArray(data[propertyName])) {
                    // array
                    this[propertyName] = ko.observableArray(data[propertyName]);
                } else {
                    this[propertyName] = ko.observable(data[propertyName]);
                }
            } else {
                this [propertyName] = ko.observable(data);
            }
        });
        this.clearDirty();
    }

    /**
     * return a json serialization of dirty fields or the specific fields
     * @param fields: (optional) - list of fields to serialize, or this, replaces this.dirtyList
     * @return {*}: json object
     */
    serialize(fields = null) {
        const data = {};
        if (fields) {
            if (!Array.isArray(fields)) {
                // check if it is this
                if (Array.isArray(fields.dirtyList)) {
                    fields = fields.dirtyList;
                } else {
                    fields = [fields];
                }
            }
        } else {
            fields = this.dirtyList;
        }

        fields.forEach(f => {
            if (typeof this[f] == 'function') {
                data[f] = this[f]();
            } else {
                data[f] = this[f];
            }
        });
        return JSON.stringify(data)
    }

    /**
     * return a url encode of dirty fields or the specific fields
     * for use with form data
     * @param fields: (optional) - list of fields to encode, replaces this.dirtyList
     * @return {*}: json object
     */
    urlEncode(fields = null) {
        const values = [];

        if (!fields || !Array.isArray(fields)) {
            fields = this.dirtyList;
        }
        fields.forEach(f => {
            if (typeof this[f] == 'function') {
                values.push(`${f}=${encodeURIComponent(this[f]())}`);
            } else {
                values.push(`${f}=${encodeURIComponent(this[f])}`);
            }
        });
        return values.join('&');
    }

    /**
     * return datetime utc short as local time
     * @param value: utc datetime
     */
    toLocalTime(value) {
        return moment.utc(value).local().format('YYYY-MM-DD HH:mm')
    }

    /**
     * generate a string to see if props have changed
     * @returns {string}
     */
    getStaticState() {
        let value = {};
        for (const prop in this) {
            if (ko.isObservable(this[prop])) {
                if (this.dirtyList.includes(prop)) {
                    value[prop] = this[prop]();
                }
            }
        }
        return value;
    }

    /**
     * return true if state has changed since last clearDirty
     */
    isDirty() {
        let prev = '';
        for (const prop in this.previousState) {
            prev += `${prop}=${this.previousState[prop]}`;
        }
        let cur = '', current = this.getStaticState();
        for (const prop in current) {
            cur += `${prop}=${current[prop]}`;
        }
        return prev != cur;
    }

    /**
     * set or reset the dirty state.
     */
    clearDirty() {
        this.previousState = this.getStaticState();
    }

    undoDirty() {
        this.dirtyList.forEach(prop => {
            if (ko.isObservable(this[prop])) {
                this[prop](this.previousState[prop]);
            }
        });
        this.clearDirty();
    }

    /**
     * create an observable for each item in the data/model
     * lists are created as observableArray
     */
    createObservablesFromData(data) {
        for (const prop in data) {
            if (typeof data[prop] == "object") {
                this[prop] = ko.observableArray(data[prop]);
            } else {
                this[prop] = ko.observable(data[prop]);
            }
        }
    }

    /**
     * check multiple csv states
     * @param stateValues
     * @returns {boolean}
     */
    hasMode(modeValues) {
        const modes = modeValues.split(',');
        return modes.includes(this.mode());
    }

    /**
     * add a message to an item and then
     * remove it after 5 seconds
     * @param msg
     */
    tempMessage(msg) {
        this.message(msg);
        setTimeout(() => {
            this.message('')
        }, 5000);
    }

    /**
     * return a json object for the given object
     * @param {string} url
     * @return {Promise}
     */
    static get(url) {
        const apiUrl = url;
        return $.getJSON(url);
    }

    /**
     * save/put any dirtyList items on the current model item to the db.
     * When no errors will add temp message from server and clear dirty
     *
     * @param fields {list)} Optional, single field or list of fields/properties to put
     * @return {promise}
     */
    put(fields = null) {
        if (!this.apiUrl) {
            this.message("this.apiUrl must be set");
        }
        return $.put(`${this.apiUrl}/${this.id()}`, this.serialize(fields)).then(result => {
            if (result.error) {
                this.message(result.error);
            } else {
                this.tempMessage(result.message);
                this.clearDirty();
            }
        }).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error updating: ${xhr.responseText}`)
        );
    }

    /**
     * post the data from a Model instance
     * @param refreshCallBack {function} - optional call back on success
     * @return {promise}
     */
    post(refreshCallBack = null) {
        if (!this.apiUrl) {
            this.message("this.apiUrl must be set");
        }

        const data = this.urlEncode();
        return $.post({url: this.apiUrl, data: data}).then(result => {
            if (result.error) {
                this.message(result.error);
            } else {
                this.tempMessage(result.message);
                if (refreshCallBack) {
                    refreshCallBack(result);
                }
            }
        }).fail((xhr, textStatus, errorThrown) =>
            this.message(`error: ${xhr.responseText}`)
        );
    }

    delete(silent = false) {
        if (!this.apiUrl) {
            this.message("this.apiUrl must be set");
        }
        return $.delete(`${this.apiUrl}/${this.id()}`).then((result) => {
            if (!result.error) {
                this.visible(false);
                this.isRemoved(true);
                if (!silent) {
                    baseView.showModalMessageWithTimeout(result.message);
                }
            } else {
                this.message(`Error deleting: ${result.error}`)
            }
        }).fail((xhr, textStatus, errorThrown) => {
                return this.message(`Error deleting: ${xhr.responseText}`);
            }
        );
    }

    static baseApiUrl() {
        return null;
    }

    /**
     * populate a list with models
     * @param itemsList {Object} ko observable array to populate
     * @param apiUrl {string} the url to use, otherwise get class apiUrl
     * @return {Promise}
     */
    static getItems(itemsList, apiUrl = null) {
        itemsList.removeAll();
        const url = apiUrl || this.baseApiUrl();
        return $.getJSON(url).done(data => {
            data.forEach(item => {
                itemsList.push(new this(item));
            })
        });
    }
}
