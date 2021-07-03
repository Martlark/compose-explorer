import React, {useContext, useState} from "react";
import {AppContext} from '../../context';
import {Button} from "react-bootstrap";
import {useAudit} from "../../services/AuditService";
import LoadingMessage from "../../LoadingMesssage";

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
        <td>{record.container_name}</td>
        <td>{record.action}</td>
    </tr>;
}

export default function AuditAdmin() {
    const context = useContext(AppContext);
    const {records, remove, refresh, searchText, setSearchText, isLoadingAudit} = useAudit();
    let selected = {};

    if (!context.admin) {
        return <h3>Forbidden</h3>;
    }

    function clickSelected(value, id) {
        selected[id] = value;
    }

    function clickRefresh(evt) {
        refresh();
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

    if(isLoadingAudit){
        return <LoadingMessage title={'Audit records'}/>
    }

    return (<div>
        <h2>Audit Records</h2>
        <Button style={{marginRight:'1em'}} onClick={clickDeleteSelected}><span
            className="material-icons">delete</span>Delete selected</Button>
        <Button style={{marginRight:'1em'}} onClick={clickRefresh}><span
            className="material-icons">refresh</span>Refresh</Button>
        <label>Search: <input value={searchText} onChange={(evt)=>setSearchText(evt.target.value)}/></label>
        <table className={"table"}>
            <thead>
            <tr>
                <th className="w-20">Date</th>
                <th className="w-20">User</th>
                <th className="w-10">Type</th>
                <th className="w-20">Container</th>
                <th className="w-30">Action</th>
            </tr>
            </thead>
            <tbody>
            {records.map(record => <AuditRecord record={record} clickSelected={clickSelected}/>)}
            </tbody>
        </table>
    </div>)
}
