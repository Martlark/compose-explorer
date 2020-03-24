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

export class AddressModel extends ModelBase {
    constructor(data) {
        super(data);
        this.apiUrl = data.apiUrl || '';
        this.user_id = data.user_id;
        this.id(data.id || -Date.now());
        this.koSerializable(false, 'active');
        this.koSerializable(data, ["description", "created", "line1", "line2", "line3", "city",
            "state", "postal_code", "country",
            "instructions", "phone", "person", "use"]);
        // --- non save items
        this.selectedCountry = ko.observable(data.country);
        this.selectedState = ko.observable(data.state);
        this.newItem = ko.observable(data.newItem);
        this.deleteConfirmState = ko.observable(false);
        this.mode(this.newItem() ? "edit" : "display");
        this.visible(true);
        // -- selection
        this.cartSelection = ko.observable(data.cartSelection);
        this.billingAddress = ko.observable(this.use() && this.use().indexOf("b") > -1);
        this.deliveryAddress = ko.observable(this.use() && this.use().indexOf("d") > -1);
        this.editAllowed = ko.observable(data.editAllowed);
        // -- computed
        this.formId = ko.computed(() => {
            return `address-form-${this.id()}`;
        });
        this.cartTitle = ko.observable(data.title);
        this.countries = ko.observableArray([]);
        this.states = ko.observableArray([]);

        $.getJSON('/address/countries').then(result => result.forEach(item => this.countries.push(item))).then(() => {
            this.selectSetCountry();
        }).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting address countries: ${textStatus} - ${errorThrown}`));
    }

    updateStates() {
        this.states([]);
        let country = this.selectedCountry();
        if (!country) {
            country = this.countries()[0];
        }
        $.getJSON(`/address/states/${country}`).then(result => {
                this.state(result[0]); // set default state to first item.
                result.forEach(item => this.states.push(item));
            }
        ).then(() => this.selectSetState()).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error getting address states: ${textStatus} - ${errorThrown}`));
    }

    /***
     * set the choice drop down to the default value
     * is called after choices populate by setTimeout
     * defaults to first item if no selected/default item
     */
    selectSetCountry() {
        setTimeout(_ => {
            const country = this.country();
            this.selectedCountry(country);
            this.countries().some(item => {
                if (item == country) {
                    $(`#select-country-${this.id()} option[value="${item}"]`).attr("selected", "selected");
                    return true;
                }
            });
            this.updateStates();
            this.selectedCountry.subscribe(newValue => {
                this.updateStates();
            });
        }, 50);
    }


    /***
     * set the choice drop down to the default value
     * is called after choices populate by setTimeout
     * defaults to first item if no selected/default item
     */
    selectSetState() {
        setTimeout(_ => {
            const state = this.state();
            this.selectedState(state);
            this.states().some(item => {
                if (item == state) {
                    $(`#select-state-${this.id()} option[value="${item}"]`).attr("selected", "selected");
                    return true;
                }
            });
        }, 50);
    }

    updateCartSelection(clickedItem) {
        if (clickedItem == 'delivery') {
            this.deliveryAddress(true);
        }

        if (clickedItem == 'billing') {
            this.billingAddress(true);
        }

        $(".plates-address-edit").each((eachIndex, form) => {
            const address = ko.dataFor(form);
            if (address.id() > 0) {
                // is a saved address
                let changed = false;
                if (address.id() != this.id()) {
                    // remove from other addresses
                    if (clickedItem == 'delivery' && address.deliveryAddress()) {
                        address.deliveryAddress(false);
                        changed = true;
                    }
                    if (clickedItem == 'billing' && address.billingAddress()) {
                        address.billingAddress(false);
                        changed = true;
                    }
                } else {
                    // always save clicked address
                    changed = true;
                }
                if (changed) {
                    address.use(`${address.billingAddress() ? 'b' : ''}${address.deliveryAddress() ? 'd' : ''}`);
                    address.submit(form, ['use'], true);
                }
            } else {
                // is a non-saved new address
            }
        });
    }

    clickDeliveryAddress() {
        this.updateCartSelection('delivery');
    }

    clickBillingAddress() {
        this.updateCartSelection('billing');
    }

    editAddress() {
        this.mode('edit');
    }

    cancelEditButton() {
        if (this.newItem()) {
            this.visible(false);
        }
        this.mode('display');
    }


    cancelDeleteButton() {
        this.deleteConfirmState(false);
    }

    deleteButton() {
        this.deleteConfirmState(true);
    }

    confirmDeleteButton() {
        $.delete(`${this.apiUrl}/address/${this.id()}`).then(result => {
            this.visible(false);
            baseView.showModalMessageWithTimeout(result.message);
        })
    }

    async submit(form, event, silent = false) {
        this.country(this.selectedCountry());
        this.state(this.selectedState());
        if (this.newItem()) {
            let url = `${this.apiUrl}/address/create`;
            if (this.user_id) {
                url += `/${this.user_id}`
            }
            const result = await $.post(
                url,
                $(form).serialize()
            );
            this.newItem(false);
            this.id(result.id);
            if (baseView.pageView.parentAddressList) {
                baseView.pageView.parentAddressList.valueHasMutated();
            }
            if (!silent)
                baseView.showModalMessageWithTimeout(result.message || result.error);
        } else {
            let result = await $.put(`${this.apiUrl}/address/${this.id()}`, this.serialize(event));
            this.cartTitle(result.properties['title']);
            if (silent) {
                this.tempMessage(result.error);
            } else {
                baseView.showModalMessageWithTimeout(result.message || result.error);
            }
        }
        this.mode('display');
    }

    /**
     * populate a list of addresses from the current user
     * @param knockout array - destination list
     * @param extraData - object of settings to be merged with the data that populates the address m
     * @returns {Promise<void>}
     */
    static async getAddressesForCurrentUser(list, extraData = {}) {
        const result = await $.get(`/address/list`);
        list.removeAll();
        result.forEach((data) => {
            $.extend(data, extraData);
            list.push(new AddressModel(data));
        });
    }

    static visibleCount(list) {
        return list.filter(item => item.visible()).length;
    }

}

export class ImageModel extends ModelBase {
    constructor(data) {
        super(data);
        this.baseUrl = "/profile/api";
        this.apiUrl = data.apiUrl || "/profile/api";
        this.created = ko.observable(data.created);
        this.description = ko.observable(data.description);
        this.url = ko.observable(data.static_url);
        this.thumbnail_url = ko.observable(data.thumbnail_url);
        this.in_use = ko.observable(data.in_use);
        this.active = ko.observable(false);

        if (this.in_use()) {
            this.message(baseView.translate('Image is being used'));
        }
        this.visible(true);
    }
}

export class MessageModel extends ModelBase {
    constructor(data, mode = "view") {
        super(data);
        this.mode(mode);
        this.apiUrl = data.apiUrl || '/cart/purchase_message';
        this.koSerializable(data, ["message_type", "sender_id", "sender_name", "purchase_id",
            "recipient_id", ".sent_since", "body"]);
        // non serializable
        this.relates_to = ko.observable(data.relates_to || {});
        this.currentUserId = ko.observable(data.currentUserId);
        this.timestamp = ko.observable(this.toLocalTime(data.timestamp));
        this.deleteConfirm = ko.observable(false);
        this.minimumBodyLength = 5;
        this.isFromMe = ko.computed(() => gCurrentUser.id === this.sender_id());
        this.isOnRelated = ko.computed(() => this.purchase_id() === $("#purchase_id").val());
        this.can_edit_delete = ko.observable(this.isFromMe() && data.can_edit_delete);
    }

    clickRemove() {
        this.deleteConfirm(true);
    }

    clickConfirmRemove() {
        $.delete(
            `${this.apiUrl}/${this.id()}`)
            .done((result) => {
                    if (!result.error) {
                        this.mode("removed");
                        baseView.showModalMessageWithTimeout(result.message);
                    } else {
                        this.deleteConfirm(false);
                        this.message(result.error);
                    }
                }
            ).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error: ${errorThrown}`)
        )
    }

    clickEdit() {
        this.mode("edit");
    }

    async submit(formParent) {
        if (!this.hasMode("new,reply,edit")) {
            return;
        }
        if (this.body().length < this.minimumBodyLength) {
            this.tempMessage(`Minimum of ${this.minimumBodyLength} characters required`);
            return "error";
        }
        let response = null;
        switch (this.mode()) {
            case "new":
            case "reply":
                try {
                    let url = `${this.apiUrl}`;
                    response = await $.ajax({
                        url: url,
                        method: "POST",
                        data: $("form", formParent).serialize()
                    });
                    this.id(response.id);
                    this.sender_name(response.sender_name);
                    this.sender_id(response.sender_id);
                    this.mode("view");
                } catch (e) {
                    this.message(`Error: ${e.responseText}`);
                    return;
                }
                break;
            case "edit":
                try {
                    response = await $.put(
                        `${this.apiUrl}/${this.id()}`,
                        {body: this.body()}
                    );
                    if (!response.error) {
                        this.tempMessage(response.message);
                        this.mode("view");
                        return;
                    } else {
                        this.message(response.error);
                        return;
                    }
                } catch (e) {
                    this.message(`Error: ${e.responseText}`);
                    return;
                }
        }
        this.message("");
        this.mode("view");
        return response;
    }

    clickCancel() {
        if (this.hasMode("new")) {
            this.mode("hidden");
        } else {
            this.mode("view");
        }
    }
}

export class StockModel extends ModelBase {
    constructor(data) {
        super(data);
        this.koSerializable(data.active == "y", "active");
        this.koSerializable(data, ["description", "short", "categories", "pages", "sku", "tax_classes",
            "weight", "height", "width", "price", "in_stock", "categories", ".static_url", "stock_type"]);
        this.confirmRemove = ko.observable(false);
        this.apiUrl = StockModel.baseApiUrl();
    }


    static baseApiUrl() {
        return "/admin_bp/api/stock";
    }

    clickEdit() {
        window.location = `/admin_bp/stock/${this.id()}`;
    }

    clickConfirmRemove() {
        this.message('');
        this.confirmRemove(true);
    }

    clickConfirmConfirmRemove() {
        this.confirmRemove(false);
        this.delete();
    }
}

export class PurchaseModel extends ModelBase {
    constructor(data) {
        super(data);
        this.koSerializable(data, ["quote", "freight", "tax", "status", ".created",
            ".message_count", ".customer", ".status_options", ".message_requires_reply"]);
        this.customer_url = ko.observable();
        this.apiUrl = "/admin_bp/api/purchase";
        this.updateRequired = ko.computed(() =>
            this.isDirty()
        );
    }

    clickEdit() {
        window.location = `/admin_bp/purchase/${this.id()}`;
    }

    put(fields) {
        if (this.isDirty()) {
            return super.put(this.dirtyList);
        }
        return Promise.resolve('nothing to update');
    }
}


export class ProductModel extends ModelBase {
    constructor(data) {
        super(data);
        this.quantity = ko.observable(1);
        this.description = ko.observable(data && data.description);
        this.slug = ko.observable(data && data.slug);
        this.stock_id = ko.observable(-1);
        this.imageUrl = ko.observable('/static/loading.gif');
        this.custom_settings = ko.observable(data && data.custom_settings);
        this.stock_type = ko.observable(data && data.stock_type);
        this.url = ko.observable(data && data.url);
        this.product_type = 'stock';
    }

    /**
     * return a json object for the given object
     * @param product_type
     * @param id
     * @return {*|jQuery}
     */
    static get(product_type, id) {
        return super.get(`/api/product/${product_type}/${id}`);
    }

    clickAddToCart(quantity = 1) {
        // customers can adjust quantity in the cart.
        this.quantity(quantity);
        $.post(`/cart/api/${this.id()}`, {
            quantity: this.quantity(),
            product_type: this.product_type
        }).then(result => {
            if (result.error) {
                baseView.showModalMessageWithTimeout(result.error);
            } else {
                baseView.updateCartCount();
                baseView.showModalMessageWithTimeout(result.message, '/cart/cart', 'Open Cart');
            }
        }).fail((xhr, textStatus, errorThrown) =>
            this.message(`Error adding item to cart: ${textStatus} - ${errorThrown}`));
    }
}
