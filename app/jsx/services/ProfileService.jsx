import ApiService from "./ApiService";
import AuthService from "./AuthService";


export default class ProfileService extends ApiService {
    constructor() {
        super();
        this.setPrefix('profile')
    }

    login(evt) {
        evt.preventDefault();
        const data = Object.fromEntries(new FormData(evt.target));
        const authService = new AuthService();

        return this.post(this.urlJoin('login'), data).then(result => {
            {
                authService.json('/g/').then(g_result => {
                    context.setAnon(g_result.anon);
                    context.setAdmin(g_result.admin);
                });
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
