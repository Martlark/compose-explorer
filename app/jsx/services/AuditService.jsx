import ApiService from "./ApiService";
import {AppContext} from "../context";
import {useContext, useEffect, useState} from "react";

export function useAudit() {
    const auditService = new AuditService();
    const context = useContext(AppContext);
    const [results, setResults] = useState([]);
    const [records, setRecords] = useState([]);
    const [searchText, setSearchText] = useState('');

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

    useEffect(() => {
        setRecords(results.filter(item => !searchText || filterResult(item)))
    }, [results, searchText])

    useEffect(() => {
        auditService.json(''
        ).then(result => {
                setResults(result)
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting audit records: ${xhr.responseText} - ${errorThrown}`)
        );
    }, []);


    return {records, remove, searchText, setSearchText}
}

export default class AuditService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('audit')
    }
}
