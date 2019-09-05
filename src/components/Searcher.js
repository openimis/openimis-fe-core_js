import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    Chip,
    Grid,
    Paper,
    Divider,
    IconButton,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import FormattedMessage from "./FormattedMessage";

const styles = theme => ({
    paperHeader: theme.paper.header,
    paperHeaderTitle: theme.paper.title,
    paperHeaderAction: theme.paper.action,
    paperDivider: theme.paper.divider,
    chip: {
        margin: theme.spacing(1)
    },
})

class Searcher extends Component {

    _search = e => {
        if (!!this.props.filterPane) {
            this.props.open();
        } else {
            this.props.refresh()
        }
    }

    render() {
        const { classes, module, title = "search.title", filterPane, filters, del } = this.props;
        return (
            <Fragment>
                <Paper>
                    <Grid container className={classes.paperHeader}>
                        <Grid item xs={8} className={classes.paperHeaderTitle}>
                            <FormattedMessage module={module} id={title} />
                        </Grid>
                        <Grid item xs={4}>
                            <Grid container justify="flex-end">
                                <Grid item className={classes.paperHeaderAction}>
                                    <IconButton onClick={this._search}>
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                        {!!filterPane &&
                            <Fragment>
                                <Grid item xs={12} className={classes.paperDivider}>
                                    <Divider />
                                </Grid>
                                {filterPane}
                            </Fragment>
                        }
                        {!filterPane &&
                            <Fragment>
                                <Grid item xs={12} className={classes.paperDivider}>
                                    <Divider />
                                </Grid>
                                <Grid item xs={12}>
                                    {!!filters && Object.keys(filters).map((filter, idx) => (
                                        <Chip key={`searcher_filter_${idx}`}
                                            label={filters[filter].chip}
                                            onDelete={e => del(filter)}
                                            className={classes.chip}
                                        />
                                    ))}
                                </Grid>
                            </Fragment>
                        }
                    </Grid>
                </Paper>
            </Fragment>
        )
    }
}

export default withTheme(withStyles(styles)(Searcher));