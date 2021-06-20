import React, {useContext, useState} from "react";
import {useHistory} from "react-router-dom";
import Button from "react-bootstrap/Button";
import {AppContext,} from "../context";
import ProfileService from "../services/ProfileService";

export function Logout(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = new ProfileService();

    const context = useContext(AppContext)
    const history = useHistory();

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    function clickLogout(event) {
        event.preventDefault();
        api.logout(event, {}).then(result => {
                context.setAnon(true);
                context.setAdmin(false);
                context.setUserId(null);
                context.setMessage(result);
                history.push('/login');
            }
        ).fail((xhr, textStatus, errorThrown) =>
            context.setErrorMessage(`Error login: ${xhr.responseText} - ${errorThrown}`))
    }

    return (
        <div className="Login">
            <h3>Confirm Logout</h3>
            <Button block size="lg" onClick={clickLogout}>
                Logout
            </Button>
        </div>
    );
}