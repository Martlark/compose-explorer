import {ApiService, urlJoin} from "../context";


export default class ProfileService extends ApiService {
    constructor() {
        super();
        this.setPrefix('profile')
    }

    login(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target));

        return this.post(urlJoin('login'), data).then(result => {
            {
                window.g = result;
                return result;
            }
        });
    }

    logout() {
        return this.post(urlJoin('logout'), {});
    }

    update(evt) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(urlJoin('user'), data);
    }
}
