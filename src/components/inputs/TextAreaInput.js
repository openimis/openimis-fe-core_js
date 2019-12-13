import React, { Component } from "react";
import TextInput from "./TextInput";

class TextAreaInput extends Component {
    render() {
        return (
            <TextInput multiline {...this.props}/>
        )
    }
}

export default TextAreaInput;