import React, {useContext} from "react";
import {AppContext} from '../../context';
import AuditService, {useAudit} from "../../services/AuditService";

export const route = '/audit_admin/';

export default function AuditAdmin() {
    const auditService = new AuditService({})
    const context = useContext(AppContext);
    const {records, getRecords} = useAudit();

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    return (<div>
        <h2>Audit Records</h2>
        <table className={"table"}>
            <thead>
            <tr>
                <th className="w-20">Date</th>
                <th className="w-20">User</th>
                <th className="w-60">Action</th>
            </tr>
            </thead>
            <tbody>
            {records.map(record => <tr key={`record-${record.id}`}>
                <td>{record.created}</td>
                <td>{record.email}</td>
                <td>{record.action}</td>
            </tr>)}
            </tbody>
        </table>
    </div>)
}
