import React, {Component} from 'react'
import PropTypes from 'prop-types'

export default class AutoInput extends Component {
    constructor(props) {
        super(props);
        this.props.name = props.name;
        this.props.parent = props.parent;
        this.props.type = props.type || 'text';
        this.props.label = props.label || '';
        this.inputProps = {};
        // remove specific props and pass rest to the input control
        Object.keys(this.props).filter(prop => !AutoInput.propTypes.hasOwnProperty(prop)).forEach(prop => this.inputProps[prop] = this.props[prop]);
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
    };

    static defaultProps = {
        type: 'text',
    }

    onChange = (evt) => {
        let {value, tagName, type, checked} = evt.target;
        const {name, parent} = this.props;
        const currentValue = parent.state[name];
        switch (type) {
            case 'checkbox':
                parent.setState({[name]: checked});
                break;
            default:
                if (!isNaN(currentValue)) {
                    value = Number(value)
                }
                parent.setState({[name]: value});
        }
    }

    renderWithLabel(inputControl) {
        if (this.props.label) {
            return <label>{this.props.label}{inputControl}</label>;
        }
        return inputControl;
    }

    render() {
        const state = this.props.parent.state;
        const {name, type, label} = this.props;
        switch (type) {
            case 'textarea':
                return this.renderWithLabel(<textarea value={state[name]}
                                                      onChange={evt => this.onChange(evt)} {...this.inputProps} />)
            default:
                return this.renderWithLabel(<input type={type} value={state[name]} checked={state[name]}
                                                   onChange={evt => this.onChange(evt)} {...this.inputProps} />)
        }
    }

}
