import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
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
})

class SearcherPane extends Component {

    render() {
        const { classes, module, title = "search.title", split= 8, filterPane, resultsPane = null, refresh, actions } = this.props;
        return (
            <Paper>
                <Grid container className={classes.paperHeader}>
                    <Grid item xs={split} className={classes.paperHeaderTitle}>
                        <FormattedMessage module={module} id={title} />
                    </Grid>
                    <Grid item xs={12 - split}>
                        {(!!actions || !!refresh) && (
                            <Grid container justify="flex-end">
                                {!!actions && actions.map((a, idx) =>
                                    <Grid item key={`action-${idx}`} className={classes.paperHeaderAction}>
                                        <IconButton onClick={a.action}>
                                            {a.icon}
                                        </IconButton>
                                    </Grid>
                                )}
                                {!!refresh &&
                                    <Grid item key={`action-refresh`} className={classes.paperHeaderAction}>
                                        <IconButton onClick={refresh}>
                                            <SearchIcon />
                                        </IconButton>
                                    </Grid>
                                }
                            </Grid>
                        )}
                    </Grid>
                    {!!filterPane &&
                        <Fragment>
                            <Grid item xs={12} className={classes.paperDivider}>
                                <Divider />
                            </Grid>
                            {filterPane}
                        </Fragment>
                    }
                    {!!resultsPane &&
                        <Fragment>
                            <Grid item xs={12} className={classes.paperDivider}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                {resultsPane}
                            </Grid>
                        </Fragment>
                    }
                </Grid>
            </Paper>
        )
    }
}

export default withTheme(withStyles(styles)(SearcherPane));