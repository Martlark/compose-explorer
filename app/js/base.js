const gCurrentUser = {
    id: $("input[name=base-current_user_id]").val(),
    email: $("input[name=base-current_user_email]").val(),
    userType: $("input[name=base-current_user_type]").val(),
    isLoggedIn: $("input[name=base-current_user_logged_in]").val() == "True",
    features: $("input[name=base-config_features]").val()
};

class ViewModel {
    constructor() {
        this.since = 0;
        $(".flashed-message").on("click", ".close", (evt) => {
            $(evt.currentTarget).parent().slideUp('slow');
        });

        $(".flashed-message-temporary").each((index, item) => {
            setTimeout(() => $(item).slideUp('slow'), 5000)
        });

        this.pageView = null;
    }

    hasFeature(feature) {
        return gCurrentUser.features.includes(feature);
    }

    scrollToBottom() {
        setTimeout(() =>
            window.scrollTo(0, document.body.scrollHeight), 500);
    }

    /**
     * display a modal dialog
     * @param message: the messagetest
     * @param url: url to goto
     * @param urlText: text for url
     * @param timeout: how long to display.
     */
    showModalMessageWithTimeout(message, url = "", urlText = "goto", timeout = 5000) {
        $("#message_alert_text").text(message);

        if (url) {
            timeout *= 2;
            const $url = $("#message_alert_url");
            $url.attr("href", url).text(urlText);
        }
        $("#message_alert_Modal").modal();
        setTimeout(() => {
            $("#message_alert_Modal").modal("hide");
            $("#message_alert_text").text("");
        }, timeout);
    }

    loggedInHandler() {
        if ($("#logout_link").length) {
            $.ajax(`/auth/is_logged_in`).done((result) => {
                if (result != 'ok') {
                    window.location = '/auth/auto_logged_out';
                }
            });
        }
    }

    /**
     * get the url for an endpoint from flask
     * @param endpoint
     * @param params ...
     * @return {*}
     */
    url_for(endpoint, params) {
        const data = Object.assign({}, {endpoint: endpoint}, params);
        const cacheKey = JSON.stringify(data);
        let url = sessionStorage.getItem(cacheKey);
        if (url) {
            return Promise.resolve(url)
        }
        return $.get({
            url: '/url_for',
            data: data,
            cache: true,
        }).then(result => {
            sessionStorage.setItem(cacheKey, result);
            return result;
        });
    }

    init() {
        // every ten minutes
        setInterval(() =>
            this.loggedInHandler, 60000 * 10);
        return this;
    }
}

ko.bindingHandlers.hidden = {
    update: function (element, valueAccessor) {
        const isHidden = ko.unwrap(valueAccessor());
        if (isHidden) {
            $(element).hide();
        } else {
            $(element).show();
        }
    }
};

ko.bindingHandlers.fadeHide = {
    update: function (element, valueAccessor) {
        const isHide = ko.unwrap(valueAccessor());
        if (isHide) {
            $(element).fadeOut("slow");
        } else {
            $(element).fadeIn("slow");
        }
    }
};
ko.bindingHandlers.fadeShow = {
    update: function (element, valueAccessor) {
        const isShow = ko.unwrap(valueAccessor());
        if (isShow) {
            $(element).fadeIn("slow");
        } else {
            $(element).fadeOut("slow");
        }
    }
};

ko.bindingHandlers.slideHide = {
    update: function (element, valueAccessor) {
        const isHidden = ko.unwrap(valueAccessor());
        if (isHidden) {
            $(element).slideUp("slow");
        } else {
            $(element).slideDown("slow");
        }
    }
};
ko.bindingHandlers.slideShow = {
    update: function (element, valueAccessor) {
        const isShow = ko.unwrap(valueAccessor());
        if (isShow) {
            $(element).slideDown("slow");
        } else {
            $(element).slideUp("slow");
        }
    }
};

// http://stackoverflow.com/a/32879912/72668
ko.observable.fn.increment = function (value) {
    this(this() + (value || 1));
};

ko.observable.fn.decrement = function (value) {
    this(this() - (value || 1));
};

ko.components.register('confirm-widget', {
    /*

    .confirm-widget {
        border-radius: 0.5em;
        background: #eeeeee;
        border: 3px solid #444444;
        width: 90%;
    }

    // example

    <confirm-widget
        params="visible: confirmRemove, model: $data, prompt:'Confirm removal', confirm: remove, context: $context">
    </confirm-widget>


     */
    viewModel: function (params) {
        this.promptValue = params.prompt || '';
        this.model = params.model;
        this.visibleValue = params.visible;
        $.extend(this, this.model || params.context.$data);

        // Behaviors
        this.clickConfirm = params.confirm.bind(this.model);
        if (params.cancel) {
            this.clickCancel = params.cancel.bind(this.model);
        } else {
            this.clickCancel = function () {
                this.visibleValue(false)
            };
        }

    },
    template:
        `   <div class="confirm-widget" data-bind="visible: visibleValue">
            <h5 data-bind="visible: promptValue, text: promptValue"></h5>
            <a href="#" title="confirm" data-bind="click: clickConfirm">&#10004;</a>
            <a href="#" title="cancel" data-bind="click: clickCancel, hotkey: '27'">&#10005;</a>
        </div>
    `
});

// see: https://codepen.io/krisravishankar/pen/phyok
ko.bindingHandlers.progressBar = {
    init: function (element) {
        return {controlsDescendantBindings: true};
    },
    update: function (element, valueAccessor, bindingContext) {
        let options = ko.unwrap(valueAccessor());
        let value = options.value();

        $(element).addClass("progressBar");

        ko.applyBindingsToNode(element, {
            html: `<div data-bind="style: { width: '${value}%' }"></div><div class="progressText" data-bind="text: '${value}%'"></div>`
        });

        ko.applyBindingsToDescendants(bindingContext, element);
    }
};

/**
 * attaches a hotkey to a button or etc
 * action default is: click()
 * example:
 * <button data-bind="click: save, hotkey: 'ctrl+s'">Save</button>
 * example with action:
 * <button data-bind="click: save, hotkey: {trigger: 'ctrl+s', action: save.bind(this)}">Save</button>
 * @type {{init: ko.bindingHandlers.hotkey.init}}
 */
ko.bindingHandlers.hotkey = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        let options = ko.utils.unwrapObservable(valueAccessor());
        let trigger = options;
        let action = null;

        if (typeof options === "object") {
            trigger = options.trigger.toLowerCase();
            action = options.action;
        }

        let keys = trigger.split('+');
        let modifiers = '';
        let keyCode = '';

        if (keys.length > 1) {
            modifiers = keys.slice(0, -1).join('+');
            keyCode = keys[keys.length - 1]
        } else {
            keyCode = keys[0]
        }

        let shift = modifiers.indexOf("shift") > -1;
        let ctrl = modifiers.indexOf("ctrl") > -1;
        let alt = modifiers.indexOf("alt") > -1;
        if (isNaN(keyCode)) {
            keyCode = keyCode.toUpperCase().charCodeAt(0);
        } else {
            keyCode = Number(keyCode);
        }

        $(document).on("keydown", function (e) {
            if (e.shiftKey === shift && e.ctrlKey === ctrl && e.altKey === alt && e.keyCode === keyCode) {
                // hotkey hit

                // console.log(action);
                if (action && typeof action === "function") {
                    action(element);
                } else {
                    $(element).click(); // trigger the element click event
                }
                e.preventDefault();
            }
        });
    }
};

// see: http://jsfiddle.net/norepro/bVB96/
ko.bindingHandlers.sort = {
    init: function (element, valueAccessor) {

        ko.utils.registerEventHandler(element, 'click', function (event) {
            let value = ko.utils.unwrapObservable(valueAccessor()),
                sortBy = event.target.getAttribute('data-sort-by'),
                list = value.list,
                alwaysBy = value.alwaysBy;

            let th = event.target;
            // default is ascending
            let asc = th.getAttribute("data-sort-by-asc") == "true";
            asc = !asc;
            Array.from(element.getElementsByClassName("table-sorted-by")).forEach(e => e.classList.remove('table-sorted-by'));

            th.setAttribute("data-sort-by-asc", asc);
            th.classList.add("table-sorted-by");

            list.sort(function (left, right) {
                let leftValue = left[sortBy],
                    rightValue = right[sortBy];

                if (typeof leftValue != 'function')
                    return 0;  // ignore non observables

                if (typeof leftValue() === 'string' && typeof rightValue() === 'string') {
                    leftValue = leftValue().toLowerCase();
                    rightValue = rightValue().toLowerCase();
                } else {
                    leftValue = leftValue();
                    rightValue = rightValue();
                }

                let x = 0;
                if (leftValue < rightValue) {
                    x = -1;
                } else if (leftValue > rightValue) {
                    x = 1;
                }
                x = asc ? x : -1 * x;
                if (alwaysBy) {
                    x = x ? x : left[alwaysBy]() - right[alwaysBy]();
                }

                return x;
            });
        });
    }
};

function setCookie(c_name, value, exdays) {
    const exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    const c_value = escape(value) + "; expires=" + exdate.toUTCString();
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    let c_value = document.cookie;
    let c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1)
        c_start = c_value.indexOf(c_name + "=");
    if (c_start == -1)
        c_value = null;
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        let c_end = c_value.indexOf(";", c_start);
        if (c_end == -1)
            c_end = c_value.length;
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

jQuery.each(["put", "delete"], function (i, method) {
    jQuery[method] = function (url, data, callback, contentType = "application/json") {
        if (contentType == "application/json") {
            // make sure is json
            try {
                JSON.parse(data);
            } catch (err) {
                data = JSON.stringify(data);
            }
        }
        return jQuery.ajax({
            url: url,
            type: method,
            contentType: contentType,
            data: data,
            cache: false,
        });
    };
});

$("form").submit(() => {
    /**
     * make sure any submit with a checkbox has an actual value when
     * unchecked, rather than being missing from the post serialization
     *   https://stackoverflow.com/a/20570060/72668
     */
    const this_master = $(this);

    this_master.find('input[type="checkbox"]').each(function () {
        const checkbox_this = $(this);


        if (checkbox_this.is(":checked") == true) {
            checkbox_this.attr('value', 'y');
        } else {
            checkbox_this.prop('checked', true);
            checkbox_this.attr('value', '');
        }
    })
});


$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", $("input[name=base-csrf_token]").val());
        }
    }
});

const baseView = new ViewModel().init();
