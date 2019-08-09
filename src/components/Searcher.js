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

    render() {
        const { classes, title, filters, del, open } = this.props;
        return (
            <Fragment>
                <Paper>
                    <Grid container className={classes.paperHeader}>
                        <Grid item xs={8} className={classes.paperHeaderTitle}>
                            {title}
                        </Grid>
                        <Grid item xs={4}>
                            <Grid container justify="flex-end">
                                <Grid item className={classes.paperHeaderAction}>
                                    <IconButton onClick={open}>
                                        <SearchIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
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
                    </Grid>
                </Paper>
            </Fragment>
        )
    }
}

export default withTheme(withStyles(styles)(Searcher));