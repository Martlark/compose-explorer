import ApiService from "./ApiService";
import {AppContext} from "../context";
import {useContext, useEffect, useState} from "react";

export function useAudit(searchTerm){
    const auditService = new AuditService();
    const context = useContext(AppContext);
    const [records, setRecords] = useState([]);

    function getRecords() {
        auditService.json(''
        ).then(result => setRecords(result)
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error getting audit records: ${xhr.responseText} - ${errorThrown}`)
        );
    }

    useEffect(()=>{
        getRecords()
    }, [searchTerm])

    return {records, getRecords}
}

export default class AuditService extends ApiService {
    constructor(props) {
        super();
        this.setPrefix('audit')
    }

    remove(evt, setItem) {
        const data = Object.fromEntries(new FormData(evt.target));

        return this.delete(this.urlJoin('audit', data.id), data);
    }
}
