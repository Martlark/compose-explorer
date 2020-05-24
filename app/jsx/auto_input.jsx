import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import AutoInput from "./AutoInput";

export class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            radio: 1,
            tail: 100,
            select: 2,
            autoUpdate: true,
        };
    }

    render() {
        return (<div>
                <AutoInput name={"radio"} type="radio" parent={this} label={"radio"} options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <AutoInput name={"select"} type="select" parent={this} label="select" options={[{label: 'a',value:1}, {label: 'b',value: 2}, {label: 'c',value: 3}]}/>
                <AutoInput name="tail" type="number" min="1" parent={this} label="Tail:"/>
                <AutoInput name="autoUpdate" type="checkbox" parent={this} label="Auto update:"/>
            </div>
        )
    }
}

ReactDOM.render(<Content/>, document.getElementById('jsx_content'));
