class ViewModel {
  constructor() {
    this.since = 0;
    $("body").on("click", ".close", (evt) => {
      $(evt.currentTarget).parent().slideUp("slow");
    });

    $(".flashed-message-temporary").each((index, item) => {
      setTimeout(() => $(item).slideUp("slow"), 5000);
    });

    this.pageView = null;
  }

  scrollToBottom() {
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
  }

  /**
   * display a modal dialog
   * @param message: the messagetest
   * @param url: url to goto
   * @param urlText: text for url
   * @param timeout: how long to display.
   */
  showModalMessageWithTimeout(
    message,
    url = "",
    urlText = "goto",
    timeout = 5000
  ) {
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
    if ($("input[name=logout_link_active]").val()) {
      $.ajax(`/auth/is_logged_in/`).done((result) => {
        if (result !== "ok") {
          window.location = result;
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
    const data = Object.assign({}, { endpoint: endpoint }, params);
    const cacheKey = JSON.stringify(data);
    let url = sessionStorage.getItem(cacheKey);
    if (url) {
      return Promise.resolve(url);
    }
    return $.get({
      url: "/url_for",
      data: data,
      cache: true,
    }).then((result) => {
      sessionStorage.setItem(cacheKey, result);
      return result;
    });
  }

  init() {
    // every ten minutes
    setInterval(() => this.loggedInHandler(), 60 * 1000 * 10);
    return this;
  }
}

function setCookie(c_name, value, exdays) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + exdays);
  const c_value = escape(value) + "; expires=" + expiryDate.toUTCString();
  document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
  let c_value = document.cookie;
  let c_start = c_value.indexOf(" " + c_name + "=");
  if (c_start == -1) c_start = c_value.indexOf(c_name + "=");
  if (c_start == -1) c_value = null;
  else {
    c_start = c_value.indexOf("=", c_start) + 1;
    let c_end = c_value.indexOf(";", c_start);
    if (c_end == -1) c_end = c_value.length;
    c_value = unescape(c_value.substring(c_start, c_end));
  }
  return c_value;
}

jQuery.each(["put", "delete"], function (i, method) {
  jQuery[method] = function (
    url,
    data,
    callback,
    contentType = "application/json"
  ) {
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
      type: method.toUpperCase(),
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
      checkbox_this.attr("value", "y");
    } else {
      checkbox_this.prop("checked", true);
      checkbox_this.attr("value", "");
    }
  });
});

$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
  if (options.type.toLowerCase() === "post") {
    // initialize `data` to empty string if it does not exist
    options.data = options.data || "";

    // add leading ampersand if `data` is non-empty
    options.data += options.data ? "&" : "";

    // add _token entry
    options.data +=
      "csrf_token=" + encodeURIComponent($("input[name=csrf_token]").val());
  }
});

$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (
      !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
      !this.crossDomain
    ) {
      xhr.setRequestHeader("X-CSRFToken", $("input[name=csrf_token]").val());
    }
  },
});

const baseView = new ViewModel().init();
