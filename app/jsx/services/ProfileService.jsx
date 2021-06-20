import ApiService from "./ApiService";
import AuthService from "./AuthService";


export default class ProfileService extends ApiService {
    constructor() {
        super();
        this.setPrefix('profile')
    }

    login(evt) {
        const data = Object.fromEntries(new FormData(evt.target));
        const authService = new AuthService();

        return this.post(this.urlJoin('login'), data);
    }

    logout() {
        return this.post(this.urlJoin('logout'), {});
    }

    update(evt) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin('user'), data);
    }

    updatePassword(evt) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('update_password'), data);
    }
}
