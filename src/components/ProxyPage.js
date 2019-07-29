import React, { Component } from "react";

class ProxyPage extends Component {
  render() {
    const { url, marginTop, marginBottom, marginLeft, marginRight } = this.props;
    var styles = {
        width: "1px",
        minWidth: "100%",
        height: "100vh",
        marginTop: marginTop || "-68px",
        marginBottom: marginBottom || "0px",
        marginLeft: marginLeft || "-48px",
        marginRight: marginRight || "-48px"
    }
    return (
      <div>
        <iframe title={url} src={url} scrolling="no" style={styles} />
      </div>
    );
  }
}

export default ProxyPage;
