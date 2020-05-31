import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import BootstrapInput from "./BootstrapInput";

export class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            radio: 1,
            numeric: 100,
            select: 2,
            checkbox: true,
            checkboxNoLabel: false,
            textArea: 'Hello there.\nGoodbye.'
        };
    }

    render() {
        return (<div>
                <BootstrapInput parent={this} name="radio" type="radio" label={"radio"} options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <hr/>
                <BootstrapInput parent={this} name="select" type="select" label="Label value select" options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <BootstrapInput parent={this} name="selectSimple" type="select" label="Simple select" options={[5,6,7]}/>
                <hr/>
                <BootstrapInput parent={this} name="numeric" type="number" label="numeric:" min="1" />
                <hr/>
                <BootstrapInput parent={this} name="checkbox" type="checkbox" label="Checkbox"/>
                <BootstrapInput parent={this} name="checkboxNoLabel" type="checkbox"/>
                <hr/>
                <BootstrapInput parent={this} name="textArea" type="textarea" label="Text Area:"/>
                <hr/>
                <h3>Output</h3>
                <table>
                    <tr><td>radio:</td><td>{this.state.radio}</td></tr>
                    <tr><td>select:</td><td>{this.state.select}</td></tr>
                    <tr><td>select simple:</td><td>{this.state.selectSimple}</td></tr>
                    <tr><td>numeric:</td><td>{this.state.numeric}</td></tr>
                    <tr><td>checkbox:</td><td>{this.state.checkbox ? 'true': 'false'}</td></tr>
                    <tr><td>checkboxNoLabel:</td><td>{this.state.checkboxNoLabel ? 'true': 'false'}</td></tr>
                    <tr><td>textArea:</td><td><pre>{this.state.textArea}</pre></td></tr>
                </table>
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
