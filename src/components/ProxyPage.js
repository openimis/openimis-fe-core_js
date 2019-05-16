import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";



class ProxyPage extends Component {
  render() {
    const { url, marginTop, marginBottom, marginLeft, marginRight } = this.props;
    var styles = {
        width: "1px",
        minWidth: "100%",
        height: "100vh",
        marginTop: marginTop || "-80px",
        marginBottom: marginBottom || "0px",
        marginLeft: marginLeft || "-48px",
        marginRight: marginRight || "-48px"
    }
    return (
      <div>
        <iframe title={url} src={url} scrolling="no" />
      </div>
    );
  }
}

ProxyPage.propTypes = {
  url: PropTypes.url.isRequired
};

export default ProxyPage;
