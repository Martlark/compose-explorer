import React, {Component} from 'react'
import {ContentState, Editor, EditorState} from 'draft-js';
import $ from "jquery"
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
        this.context.api.proxyGet(`/container/${this.state.id}/get`, {name: this.state.name}
        ).then(result => {
                this.state.status = result.status;
                this.state.project = result.labels["com.docker.compose.project"];
                this.state.service = result.labels["com.docker.compose.service"];
            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error getting container: ${textStatus} - ${errorThrown}`})
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
            this.setState({message: `Error: ${textStatus} - ${errorThrown}`})
        )
    }

    renderMessage(className) {
        if (this.state && this.state.message) {
            return <h3 className="{className} alert alert-warning">{this.state.message}</h3>
        }
        return null;
    }

    clickSave = (evt) => {
        return this.context.api.proxyPost(`/container/${this.state.id}/upload`, {
                name: this.state.name,
                filename: this.state.file_name,
                content: this.state.editorState.getCurrentContent().getPlainText(),
            }
        ).then((result, textStatus, request) => {
                this.setState({message: `Saved: ${result.base_filename}`})

            }
        ).fail((xhr, textStatus, errorThrown) =>
            this.setState({message: `Error: ${textStatus} - ${errorThrown}`})
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

                {this.renderMessage()}
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
