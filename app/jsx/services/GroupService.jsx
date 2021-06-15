import ApiService from "./ApiService";
import {useEffect, useState} from "react";

/**
 * use hook to return a list of server access groups
 * @returns {*[groups, refreshFunction]}
 */
export function useGroups() {
    const groupService = new GroupService();
    const [refreshCount, setRefreshCount] = useState(1);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        groupService.getGroups().then(result => setGroups(result));
    }, [refreshCount]);

    function refresh() {
        setRefreshCount(c => c + 1);
    }

    return [groups, refresh];
}

export default class GroupService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('auth')
        this.endPoint = 'group';
    }

    get(id) {
        return this.json(this.urlJoin(this.endPoint, id));
    }

    getGroups() {
        return this.json('group'
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting groups: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin(this.endPoint, data.id), data);
    }

    remove(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.delete(this.urlJoin(this.endPoint, data.id), data);
    }

    add_server(evt = null, formData) {
        const data = formData || Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('group_add_server'), data);
    };

    remove_server(evt = null, formData) {
        const data = formData || Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('group_remove_server'), data);
    };

    add_user(evt = null) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('group_add_user'), data);
    };

    remove_user(evt = null) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.post(this.urlJoin('group_remove_user'), data);
    };

    create(evt, name = null, description = null) {
        const formData = new FormData(evt?.target);

        return this.post(this.urlJoin(this.endPoint), {
            name: name ?? formData.get('name'),
            description: description ?? formData.get('description')
        })
    };
}
