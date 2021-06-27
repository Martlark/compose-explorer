import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import {Button} from "react-bootstrap";
import {useAudit} from "../../services/AuditService";

export const route = '/audit_admin/';

function AuditRecord({record, clickSelected}) {
    const [selected, setSelected] = useState(false);

    return <tr key={`record-${record.id}`}>
        <td>
            <label><input type="checkbox" name="selected" value={selected} onChange={(evt) => {
                clickSelected(evt.target.checked, record.id, setSelected(evt.target.checked))
            }}/>
                {record.created}</label>
        </td>
        <td>{record.email}</td>
        <td>{record.action_type}</td>
        <td>{record.action}</td>
    </tr>;
}

export default function AuditAdmin() {
    const context = useContext(AppContext);
    const {records, remove, searchText, setSearchText} = useAudit();
    let selected = {};

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    function clickSelected(value, id) {
        selected[id] = value;
    }

    function clickDeleteSelected(evt) {
        let deletedCount = 0
        for (const [id, value] of Object.entries(selected)) {
            if (value) {
                remove(Number(id));
                deletedCount++;
            }
        }
        selected = {};
        context.setMessage(`Deleted ${deletedCount} records`);
    }

    return (<div>
        <h2>Audit Records</h2>
        <Button style={{marginRight:'1em'}} onClick={clickDeleteSelected}>Delete selected</Button>
        <label>Search: <input value={searchText} onChange={(evt)=>setSearchText(evt.target.value)}/></label>
        <table className={"table"}>
            <thead>
            <tr>
                <th className="w-10">Date</th>
                <th className="w-20">User</th>
                <th className="w-10">Type</th>
                <th className="w-60">Action</th>
            </tr>
            </thead>
            <tbody>
            {records.map(record => <AuditRecord record={record} clickSelected={clickSelected}/>)}
            </tbody>
        </table>
    </div>)
}