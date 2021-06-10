import ApiService from "./ApiService";


export default class ProfileService extends ApiService {
    constructor() {
        super();
        this.setPrefix('profile')
    }

    login(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('login'), data).then(result => {
            {
                context.setAnon(result.anon);
                context.setAdmin(result.admin);

                return result;
            }
        });
    }

    logout() {
        return this.post(this.urlJoin('logout'), {});
    }

    update(evt) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin('user'), data);
    }
}
