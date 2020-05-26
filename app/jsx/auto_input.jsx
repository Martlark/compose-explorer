import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import AutoInput from "./AutoInput";

export class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            radio: 1,
            numeric: 100,
            select: 2,
            checkbox: true,
            textArea: 'Hello there.\nGoodbye.'
        };
    }

    render() {
        return (<div>
                <AutoInput parent={this} name="radio" type="radio" label={"radio"} options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <hr/>
                <AutoInput parent={this} name="select" type="select" label="select" options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <hr/>
                <AutoInput parent={this} name="numeric" type="number" label="numeric:" min="1" />
                <hr/>
                <AutoInput parent={this} name="checkbox" type="checkbox" label="Checkbox:"/>
                <hr/>
                <AutoInput parent={this} name="textArea" type="textarea" label="Text Area:"/>
                <hr/>
                <h3>Output</h3>
                <table>
                    <tr><td>radio:</td><td>{this.state.radio}</td></tr>
                    <tr><td>select:</td><td>{this.state.select}</td></tr>
                    <tr><td>numeric:</td><td>{this.state.numeric}</td></tr>
                    <tr><td>checkbox:</td><td>{this.state.checkbox ? 'true': 'false'}</td></tr>
                    <tr><td>textArea:</td><td><pre>{this.state.textArea}</pre></td></tr>
                </table>
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
