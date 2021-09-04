import ApiService from "./ApiService";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context";

export function useProfile() {
  const [user, setUser] = useState({});
  const [loadingStatus, setLoadingStatus] = useState("loading");
  const context = useContext(AppContext);
  const profileService = new ProfileService();

  function update(evt) {
    profileService
      .update(evt)
      .then((result) => {
        context.setMessage(`${result.message} ${result.item.email}`);
        getUser();
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error update: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  function updatePassword(evt) {
    profileService
      .updatePassword(evt)
      .then((result) => {
        context.setMessage(`${result}`);
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error change password: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  function getUser() {
    setLoadingStatus("loading");
    profileService
      .json("user")
      .then((result) => {
        setUser(result);
        setLoadingStatus("done");
      })
      .fail((xhr, textStatus, errorThrown) => {
        setLoadingStatus(xhr.responseText);
        context.setErrorMessage(
          `Error getting user: ${xhr.responseText} - ${errorThrown}`
        );
      });
  }

  useEffect(() => {
    getUser();
  }, []);

  return [user, loadingStatus, update, updatePassword, profileService];
}

export default class ProfileService extends ApiService {
  constructor() {
    super();
    this.setPrefix("profile");
  }

  login(evt) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.post(this.urlJoin("login"), data);
  }

  logout() {
    return this.post(this.urlJoin("logout"), {});
  }

  update(evt) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.put(this.urlJoin("user"), data);
  }

  updatePassword(evt) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.post(this.urlJoin("update_password"), data);
  }
}
