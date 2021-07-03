import ApiService from "./ApiService";
import {AppContext} from "../context";
import {useContext, useEffect, useState} from "react";

export function useAudit() {
    const auditService = new AuditService();
    const context = useContext(AppContext);
    const [results, setResults] = useState([]);
    const [records, setRecords] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoadingAudit, setIsLoadingAudit] = useState(true);

    function filterResult(item) {
        return (
            item.action.includes(searchText) ||
            item.container_name.includes(searchText) ||
            item.email.includes(searchText) ||
            item.action_type.includes(searchText)
        )
    }

    function remove(record_id) {
        return auditService.delete(record_id).then(() =>
            setResults(
                results.filter(record => record.id !== record_id)
            )
        );
    }

    function refresh() {
        setIsLoadingAudit(true);
        return auditService.json(''
        ).then(result => {
                setResults(result);
                setIsLoadingAudit(false);
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting audit records: ${xhr.responseText} - ${errorThrown}`)
        );

    }

    useEffect(() => {
        setRecords(results.filter(item => !searchText || filterResult(item)))
    }, [results, searchText])

    useEffect(() => {
        refresh();
    }, []);


    return {records, remove, refresh, searchText, setSearchText, isLoadingAudit}
}

export default class AuditService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('audit')
    }

    create(evt, formData) {
        const data = formData || Object.fromEntries(new FormData(evt.target));

        return this.post('/', data);
    };
}
