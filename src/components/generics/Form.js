import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Fab, Grid, Paper, IconButton, Typography, Divider, Tooltip } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/SaveAlt";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import FormattedMessage from "./FormattedMessage";
import Contributions from "./Contributions";
import withHistory from "../../helpers/history";
import { withTooltip, formatMessage } from "../../helpers/i18n";
import _ from "lodash";

const styles = (theme) => ({
  paper: theme.paper.paper,
  paperHeader: theme.paper.header,
  paperHeaderAction: theme.paper.action,
  tooltipContainer: theme.tooltipContainer,
  flexTooltip: theme.flexTooltip,
});

class Form extends Component {
  state = {
    dirty: false,
    saving: false,
  };

  componentDidMount() {
    if (!!this.props.forcedDirty) {
      this.setState((state, props) => ({ dirty: true }));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.reset !== this.props.reset || prevProps.edited_id !== this.props.edited_id) {
      this.setState({ dirty: false, saving: false });
    } else if (!this.state.dirty && !!this.props.forcedDirty) {
      this.setState({ dirty: true });
    } else if (prevProps.update !== this.props.update) {
      this.setState({ saving: false });
    }
  }

  onEditedChanged = (data) => {
    this.setState({ dirty: true }, (e) => this.props.onEditedChanged(data));
  };

  save = (data) => {
    this.setState({ saving: true }, this.props.save(data));
  };

  render() {
    const {
      classes,
      module,
      back,
      add,
      addTooltip,
      openDirty = false,
      save,
      canSave,
      saveTooltip,
      actions = [],
      fab = null,
      fabAction = null,
      fabTooltip = null,
      title,
      titleParams = [],
      HeadPanel,
      headPanelContributionsKey,
      Panels,
      contributedPanelsKey = null,
      additionalTooltips = null,
      enableActionButtons = false,
      ...others
    } = this.props;

    const defaultTooltips = [
      {
        condition: !this.state.dirty && !!add && !save,
        content: (
          <span>
            <Fab color="primary" onClick={add}>
              <AddIcon />
            </Fab>
          </span>
        ),
        tooltip: addTooltip || formatMessage(this.props.intl, module, "addTooltip"),
      },
      {
        condition: (!!this.state.dirty || !!openDirty) && !!save,
        content: (
          <span>
            <Fab
              color="primary"
              disabled={!!this.state.saving || (!!canSave && !canSave())}
              onClick={(e) => this.save(this.props.edited)}
            >
              <SaveIcon />
            </Fab>
          </span>
        ),
        tooltip: saveTooltip || formatMessage(this.props.intl, module, "saveTooltip"),
      },
      {
        condition: (!!this.state.dirty || !!openDirty) && !!fab,
        content: (
          <span>
            <Fab color="primary" onClick={(e) => fabAction(this.props.edited)}>
              {fab}
            </Fab>
          </span>
        ),
        tooltip: fabTooltip,
      },
    ]

    const allTooltips = [...(additionalTooltips || []), ...defaultTooltips];

    const filteredTooltips = allTooltips.filter(tooltip => tooltip.condition);

    return (
      <Fragment>
        <form noValidate autoComplete="off">
          <Grid container>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
                  <Grid item xs={8}>
                    <Grid container alignItems="center">
                      {!!back && (
                        <Grid item>
                          <IconButton onClick={back}>
                            <ChevronLeftIcon />
                          </IconButton>
                        </Grid>
                      )}
                      {!!title && (
                        <Grid item>
                          <Typography variant="h6">
                            <FormattedMessage module={module} id={title} values={titleParams} />
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  {!!actions && (
                    <Grid item xs={4}>
                      <Grid container justify="flex-end">
                        {actions.map((a, idx) => {
                          if (!!a.onlyIfDirty && !this.state.dirty) return null;
                          if (!!a.onlyIfNotDirty && !!this.state.dirty) return null;
                          return (
                            <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                              {withTooltip(
                                !!a.button ? (
                                  a.button
                                ) : (
                                  <IconButton onClick={a.doIt} disabled={a?.disabled}>
                                    {a.icon}
                                  </IconButton>
                                ),
                                a.tooltip,
                              )}
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                {(HeadPanel || headPanelContributionsKey) && (
                  <Grid item xs={12}>
                    {!!HeadPanel && (
                      <HeadPanel
                        edited={this.props.edited}
                        edited_id={this.props.edited_id}
                        {...others}
                        onEditedChanged={this.onEditedChanged}
                      />
                    )}
                    {!!headPanelContributionsKey && (
                      <Contributions {...others} contributionKey={headPanelContributionsKey} />
                    )}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
          {!!Panels &&
            Panels.map((P, idx) => (
              <Grid key={`form_panel_${idx}`} item xs={12}>
                <P
                  {...others}
                  edited={this.props.edited}
                  edited_id={this.props.edited_id}
                  save={this.props.save}
                  canSave={this.props.canSave}
                  onEditedChanged={this.onEditedChanged}
                />
              </Grid>
            ))}
          {!!contributedPanelsKey && (
            <Contributions
              {...this.props}
              onEditedChanged={this.onEditedChanged}
              contributionKey={contributedPanelsKey}
            />
          )}
        </form>
        {!enableActionButtons && (
          <div className={classes.tooltipContainer}>
            {filteredTooltips.map((item, index) => (
              <div className={classes.flexTooltip} key={index}>
                {withTooltip(item.content, item.tooltip, index === 0 ? "top" : "left")}
              </div>
            ))}
          </div>
        )}
      </Fragment>
    );
  }
}

export default withHistory(injectIntl(withTheme(withStyles(styles)(Form))));
