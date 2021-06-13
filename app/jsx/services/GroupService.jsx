import ApiService from "./ApiService";

export default class GroupService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('auth')
        this.endPoint = 'group';
    }

    get(id){
        return this.json(this.urlJoin(this.endPoint, id));
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin(this.endPoint, data.id), data);
    }

    remove(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.delete(this.urlJoin(this.endPoint, data.id), data);
    }

    add_server(evt = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('group_add_server'), {
            group_id: formData.get('group_id'),
            server_id: formData.get('server_id'),
        })
    };

    remove_server(evt = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('group_remove_server'), {
            group_id: formData.get('group_id'),
            server_id: formData.get('server_id'),
        })
    };

    add_user(evt = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('group_add_user'), {
            group_id: formData.get('group_id'),
            user_id: formData.get('user_id'),
        })
    };

    remove_user(evt = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin('group_remove_user'), {
            group_id: formData.get('group_id'),
            user_id: formData.get('user_id'),
        })
    };

    create(evt, name = null, description = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin(this.endPoint), {
            name: name ?? formData.get('name'),
            description: description ?? formData.get('description')
        })
    };
}
