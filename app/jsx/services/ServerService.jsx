import ApiService from  "./ApiService"
export default class ServerService extends ApiService {
    constructor(props) {
        super();
        this.item = props;
    }

    remove() {
        return this.delete(this.urlJoin(`server`, this.item.id));
    }

    getSummary(setItem) {
        return this.json(this.urlJoin('server_summary', this.item.id)).then(response => {
                setItem({...this.item, summary: response});
            }
        )
    }

    update(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.put(this.urlJoin(`server`, this.item.id), data).then(result => {
            this.item = result.item;
            setItem(result.item);
        });
    }

    testConnection(name, port, credentials) {
        return this.json('server_test_connection', {name, port, credentials});
    }

    create(evt) {
        evt?.preventDefault();

        const data = Object.fromEntries(new FormData(evt.target));

        return this.post('server', data).then(result => this.item = result);
    };
}
