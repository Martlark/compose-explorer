import {ApiService, urlJoin} from "../context";

export default class ServerService extends ApiService {
    constructor(props) {
        super();
        this.item = props;
    }

    remove() {
        return this.delete(urlJoin(`server`, this.item.id));
    }

    getSummary(setItem) {
        return this.json(urlJoin('server_summary', this.item.id)).then(response => {
                setItem({...this.item, summary: response});
            }
        )
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(urlJoin(`server`, this.item.id), data).then(result => {
            this.item = result.item;
            setItem(result.item);
        });
    }

    testConnection(name, port, credentials) {
        return this.json('/server_test_connection/', {name, port, credentials});
    }

    create(evt, name, port, credentials) {
        const formData = new FormData(evt?.target);
        evt?.preventDefault();

        return this.post('/server/', {
            credentials: credentials ?? formData.get('credentials'),
            name: name ?? formData.get('name'),
            port: port ?? formData.get('port')
        }).then(result => this.item = result
        );
    };
}
