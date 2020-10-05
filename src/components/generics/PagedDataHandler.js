import React, { Component } from "react";

class PagedDataHandler extends Component {

    state = {
        page: 0,
        pageSize: this.props.modulesManager.getConf("fe-core", "core.defaultPageSize", 5),
        afterCursor: null,
        beforeCursor: null,
    }

    query = () => {                
        let prms = this.queryPrms();
        if (!this.state.pageSize || !prms) return;
        prms.push(`first: ${this.state.pageSize}`);
        if (!!this.state.afterCursor) {
            prms.push(`after: "${this.state.afterCursor}"`)
        }
        if (!!this.state.beforeCursor) {
            prms.push(`before: "${this.state.beforeCursor}"`)
        }
        this.props.fetch(this.props.modulesManager, prms)
    }

    currentPage = () => this.state.page;
    currentPageSize = () => this.state.pageSize;

    onChangeRowsPerPage = (cnt) => {
        this.setState(
            {
                pageSize: cnt,
                page: 0,
                afterCursor: null,
                beforeCursor: null,
            },
            e => this.query()
        )
    }

    onChangePage = (page, nbr) => {
        if (nbr > this.state.page) {
            this.setState((state, props) => ({
                page: state.page + 1,
                beforeCursor: null,
                afterCursor: props.pageInfo.endCursor,
            }),
                e => this.query()
            )
        } else if (nbr < this.state.page) {
            this.setState((state, props) => ({
                page: state.page - 1,
                beforeCursor: props.pageInfo.startCursor,
                afterCursor: null,
            }),
                e => this.query()
            )
        }
    }

    render() { return null }
}

export default PagedDataHandler;