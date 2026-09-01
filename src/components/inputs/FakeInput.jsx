import React, { Component } from "react";
import { styled } from "@mui/material/styles";
import { FormControl, InputBase } from "@mui/material";

const StyledFakeInput = styled("div")(({ theme }) => ({
  "& .fakeInput": theme.fakeInput,
}));

class FakeInput extends Component {
  _onKeyDown = (e) => {
    if (e.keyCode === 13 && !!this.props.onSelect) {
      this.props.onSelect();
      e.stopPropagation();
    }
  };

  render() {
    const { onSelect, ...others } = this.props;
    return (
      <StyledFakeInput>
        <FormControl>
          <InputBase
            className="fakeInput"
            inputProps={{
              onKeyDown: (e) => this._onKeyDown(e),
              readOnly: true,
            }}
            {...others}
          />
        </FormControl>
      </StyledFakeInput>
    );
  }
}

export default FakeInput;
