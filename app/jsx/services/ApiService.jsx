import $ from "jquery";
import { useContext } from "react";
import { AppContext } from "../context";

export default class ApiService {
  constructor(props) {
    this.csrf_token = $("input[name=base-csrf_token]").val();
    this.prefix_api = `/api`;
  }

  urlJoin(...urls) {
    let fullPath = `/${urls.join("/")}/`;
    while (fullPath.includes("//")) {
      fullPath = fullPath.replaceAll("//", "/");
    }
    fullPath = fullPath.replace(/[ps]:\//, "://");
    return fullPath;
  }

  setPrefix(newPrefix) {
    this.prefix_api = newPrefix;
  }

  container(id, name) {
    return this.proxyGet(this.urlJoin(`container`, id, "get"), { name });
  }

  /***
   * return a json object according to the url and params
   *
   * @param url
   * @param params
   * @returns {*|jQuery}
   */
  json(url, params) {
    return $.getJSON(this.urlJoin(this.prefix_api, url), params);
  }

  put(url, data) {
    data.csrf_token = this.csrf_token;
    const urlPath = this.urlJoin(this.prefix_api, url);
    return $.ajax({
      url: urlPath,
      type: "PUT",
      data: data,
    });
  }

  post(url, data = {}) {
    data.csrf_token = this.csrf_token;
    return $.post(this.urlJoin(this.prefix_api, url), data);
  }

  delete(url) {
    const urlPath = this.urlJoin(this.prefix_api, url);
    return $.ajax({
      url: urlPath,
      type: "DELETE",
      data: { csrf_token: this.csrf_token },
    });
  }

  command(method = "GET", data = {}) {
    const url = "/command/";
    switch (method.toUpperCase()) {
      case "POST":
        data.csrf_token = this.csrf_token;
        return $.post(url, data);
      case "PUT":
        data.csrf_token = this.csrf_token;
        return $.put(url, data);
      case "DELETE":
        return $.ajax({
          url: this.urlJoin(url, data),
          type: "DELETE",
          data: { csrf_token: this.csrf_token },
        });
    }
    // default is get
    return $.getJSON(url, data);
  }

  proxyGet(url, params) {
    return $.getJSON(this.urlJoin(`proxy`, url), params);
  }

  proxyPost(url, data) {
    data.csrf_token = this.csrf_token;
    return $.post(this.urlJoin("proxy", url), data);
  }

  projects(server_id) {
    return this.proxyGet(this.urlJoin(`projects`, server_id)).then((result) => {
      return result.map((data) => {
        data.server_id = server_id;
        return data;
      });
    });
  }
}
