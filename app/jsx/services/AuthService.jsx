import ApiService from "./ApiService";

export default class AuthService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('auth')
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin('user', data.id), data);
    }

    remove(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.delete(this.urlJoin('user', data.id), data);
    }

    set_password(evt=null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('user_set_password', formData.get('id')), {
            id: formData.get('id'),
            password: formData.get('password')
        })
    };

    create(evt, email=null, password=null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('user'), {
            email: email ?? formData.get('email'),
            password: password ?? formData.get('password')
        })
    };
}
