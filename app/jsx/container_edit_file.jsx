import React, {Component} from 'react'
import {ContentState, Editor, EditorState} from 'draft-js';
import {AppContext} from "./context";

export class FileEdit extends Component {
    constructor(props) {
        super(props);
        const u = new URLSearchParams(this.props.location.search)
        this.state = {
            file_name: u.get('filename').split('#')[0],
            message: '',
            content: '',
            originalContent: '',
            id: this.props.match.params.id,
            name: this.props.match.params.name,
            editorState: EditorState.createEmpty()
        };

        this.onChange = (editorState) => this.setState({editorState});
        this.setEditor = (editor) => {
            this.editor = editor;
        };

        this.focusEditor = () => {
            if (this.editor) {
                this.editor.focus();
            }
        };

    }

    static contextType = AppContext;

    updateState = (data) => {
        this.setState(data)
    };

    componentDidMount() {
        this.context.api.container(this.state.id, this.state.name).then(result => {
                this.setState({status: result.status, container: result});
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error getting container: ${textStatus} - ${errorThrown}`)
        );
        this.getContent();
    }

    getContent() {
        return this.context.api.proxyPost(`/container/${this.state.id}/download`, {
                name: this.state.name,
                filename: this.state.file_name,
            }
        ).then((result, textStatus, request) => {
                this.focusEditor();
                const content = ContentState.createFromText(result);
                this.setState({editorState: EditorState.createWithContent(content)})
                this.setState({originalContent: content})
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
        )
    }

    renderTitle() {
        return (
            <div>
                <h3 className="">{this.state.container && this.state.container.name}</h3>
                <p className="alert alert-warning">{this.state.file_name}</p>
            </div>
        )
    }


    clickSave = (evt) => {
        return this.context.api.proxyPost(`/container/${this.state.id}/upload`, {
                name: this.state.name,
                filename: this.state.file_name,
                content: this.state.editorState.getCurrentContent().getPlainText(),
            }
        ).then((result, textStatus, request) => {
                this.context.setMessage(`Saved: ${result.base_filename}`)
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.context.setErrorMessage(`Error: ${textStatus} - ${errorThrown}`)
        )
    }


    clickRestore = (evt) => {
        this.setState({editorState: EditorState.createWithContent(this.state.originalContent)})
    }

    static styles = {
        editor: {
            border: '1px solid gray',
            minHeight: '20em'
        }
    };

    render() {
        return (<div>

                {this.renderTitle()}
                <button className={'btn btn-sm'} onClick={evt => this.clickSave(evt)} title={"Save"}>
                    Save <span className="material-icons">save</span>
                </button>
                <button className={'btn btn-sm'} onClick={evt => this.clickRestore(evt)} title={"Undo changes"}>
                    Reload <span className="material-icons">cached</span>
                </button>
                <div style={FileEdit.styles.editor} onClick={this.focusEditor}>
                    <Editor
                        ref={this.setEditor}
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        )
    }
}
