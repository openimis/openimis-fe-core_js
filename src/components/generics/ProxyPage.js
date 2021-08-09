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
      marginLeft: marginLeft || "0px",
      marginRight: marginRight || "0px",
    };
    return (
      <div>
        <iframe title={url} src={url} style={styles} />
      </div>
    );
  }
}

export default ProxyPage;
