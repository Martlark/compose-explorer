import ApiService from "./ApiService";
import {useContext, useEffect, useState} from "react";
import {AppContext} from "../context";

/**
 * use hook to return a list of server access groups
 * @returns {*[groups, refreshFunction]}
 */
export function useGroups() {
    const groupService = new GroupService();
    const context = useContext(AppContext);
    const [refreshCount, setRefreshCount] = useState(1);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        groupService.getGroups()
            .then(result => setGroups(result))
            .fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting groups: ${xhr.responseText} - ${errorThrown}`)
        );
    }, [refreshCount]);

    function refresh() {
        setRefreshCount(c => c + 1);
    }

    return [groups, refresh];
}

/**
 * use hook to return a list of server access groups
 * @returns {*[groups, refreshFunction]}
 */
export function useGroup(group_id) {
    const groupService = new GroupService();
    const context = useContext(AppContext);
    const [group, setGroup] = useState(null);

    useEffect(() => {
        groupService.json(group_id)
            .then(result => setGroup(result))
            .fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting group: ${xhr.responseText} - ${errorThrown}`)
        );
    }, [group_id]);

    function update() {
        groupService.update(group).then(result=>setGroup(result.item));
    }

    return [group, setGroup, update];
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
        return this.json('group');
    }

    update(evt) {
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

    create(evt) {
        const formData = Object.fromEntries(new FormData(evt?.target));

        return this.post(this.urlJoin(this.endPoint), formData)
    };
}
