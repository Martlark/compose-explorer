import ApiService from "./ApiService";
import { AppContext } from "../context";
import { useContext, useEffect, useState } from "react";

export function useUsers() {
  const authService = new AuthService();
  const context = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  function getUsers() {
    authService
      .json("user")
      .then((result) => {
        setUsers(result);
        setIsLoadingUsers(false);
      })
      .fail((xhr, textStatus, errorThrown) =>
        context.setErrorMessage(
          `Error getting users: ${xhr.responseText} - ${errorThrown}`
        )
      );
  }

  useEffect(() => {
    getUsers();
  }, []);

  return { users, getUsers, isLoadingUsers };
}

export default class AuthService extends ApiService {
  constructor(props) {
    super();
    this.setPrefix("auth");
    this.user_types = ["admin", "user"];
  }

  update(evt, setItem) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.put(this.urlJoin("user", data.id), data);
  }

  remove(evt, setItem) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.delete(this.urlJoin("user", data.id), data);
  }

  set_password(evt = null) {
    const formData = new FormData(evt?.target);

    return this.post(this.urlJoin("user_set_password", formData.get("id")), {
      id: formData.get("id"),
      password: formData.get("password"),
    });
  }

  create(evt) {
    const data = Object.fromEntries(new FormData(evt.target));

    return this.post(this.urlJoin("user"), data);
  }
}
