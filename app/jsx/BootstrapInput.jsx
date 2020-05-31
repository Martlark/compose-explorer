import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class BootstrapInput extends Component {
    constructor(props) {
        super(props);
        this.inputProps = {};
        this.props.id = props.id || Math.random();
        this.state = {value: props.parent.state[props.name]};
        // remove specific props and pass rest to the input control
        Object.keys(this.props).filter(prop => !BootstrapInput.propTypes.hasOwnProperty(prop)).forEach(prop => this.inputProps[prop] = this.props[prop]);
    }

    stringToNumber(str) {
        return [...str].reduce((accum, c) => accum += c.charCodeAt(), 0);
    }

    /**
     * https://reactjs.org/docs/typechecking-with-proptypes.html
     * @type {{parent: Validator<NonNullable<React.Component<P, S>>>, name: Validator<NonNullable<string>>, label: Requireable<string>, type: Requireable<string>}}
     */
    static propTypes = {
        name: PropTypes.string.isRequired,
        parent: PropTypes.instanceOf(Component).isRequired,
        type: PropTypes.string,
        label: PropTypes.string,
        onChange: PropTypes.func,
        options: PropTypes.array,
    };

    static defaultProps = {
        type: 'text',
        label: '',
        inputClassName: "form-control",
        inlineClassName: "form-check-inline",
        labelClassName: "form-check-label",
        options: ['set', 'options=[1,2,3]', 'for selections'],
    }

    onChange = (evt) => {
        let {value, tagName, type, checked} = evt.target;
        const {name, parent} = this.props;
        const currentValue = parent.state[name];
        if (!isNaN(currentValue)) {
            value = Number(value)
        }
        switch (type) {
            case 'checkbox':
                value = checked;
                break;
        }
        parent.setState({[name]: value});
        this.setState({value: value});
        // call any extra onChange
        if (this.props.onChange) {
            this.props.onChange(evt, value);
        }
    }

    renderWithLabel(inputControl) {
        if (this.props.label) {
            return <div className={this.props.inlineClassName}>
                <label
                    className={this.props.labelClassName}
                    htmlFor={this.props.id}>{this.props.label}{inputControl}</label>
            </div>;
        }
        return inputControl;
    }

    render() {
        const state = this.props.parent.state;
        const {name, type, label, options} = this.props;

        switch (type) {
            case 'textarea':
                return this.renderWithLabel(<textarea className={"form-control"} value={state[name]}
                                                      onChange={evt => this.onChange(evt)} {...this.inputProps} />);
            case 'checkbox':
                return (<div className={"form-check"}>
                    <label className="form-check-label">
                        <input className="form-check-input" type={type} value={state[name]}
                               onChange={evt => this.onChange(evt)} {...this.inputProps} />{this.props.label}
                    </label>
                </div>);
            case 'radio':
                return options.map(option =>
                    <div className={"form-check"}>
                        <label className={this.props.labelClassName}>
                            <input className={"form-check-input"} name={name} type={type} value={option.value}
                                   checked={option.value == this.state.value}
                                   onChange={evt => this.onChange(evt)} {...this.inputProps} />{option.label}
                        </label>
                    </div>
                );
            case 'select':
                return <div className={"form-group"}>
                    <label className={this.props.labelClassName} htmlFor={this.props.id}>{label}</label>
                    <select name={name} value={state[name]} className={"form-control"}
                            onChange={evt => this.onChange(evt)} {...this.inputProps}>
                        {options.map(option => <option
                            value={option.value || option}>{option.label || option}</option>)}
                    </select>
                </div>;
            default:
                return this.renderWithLabel(<input className={this.props.inputClassName} type={type} value={state[name]}
                                                   checked={state[name]}
                                                   onChange={evt => this.onChange(evt)} {...this.inputProps} />)
        }
    }

}
