export const general = theme => ({
  primaryText: {
    color: theme.palette.primary.main,
  },
  secondaryText: {
    color: theme.palette.secondary.main,
  },
});

export const paper = theme => ({
  paper: {
    padding: "16px 32px",
    margin: `${theme.spacing.unit * 4}px 0`,
    position: "relative",
  },
});

export const card = theme => ({
  paperHeader: {
    height: "60px",
    borderBottom: "1px solid #ddd",
  },
  paperTitle: {
    paddingTop: "18px",
    paddingBottom: "18px",
    marginTop: -theme.spacing.unit,
    textAlign: "center",
    marginLeft: -theme.spacing.unit * 4,
    marginRight: -theme.spacing.unit * 4,
    borderBottom: "1px solid #ddd",
    fontWeight: 400,
    fontSize: "80%",
    whiteSpace: "normal",
    textTransform: "uppercase",
  },
  paperMenu: {
    position: "absolute",
    right: "10px",
    top: "10px",
  },
  paperProcessing: {
    position: "absolute",
    right: "20px",
    top: "20px",
  },
  cardTab: {
    marginLeft: -theme.spacing.unit * 4,
    marginRight: -theme.spacing.unit * 4,
    borderBottom: "1px solid #ddd",
  },
});

export const tableStyles = theme => ({
  cell: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    alignContent: "center",
    boxSizing: "border-box",
  },
  actions: {
    textAlign: "right",
  },
  listItem: {
    paddingLeft: theme.spacing.unit * 4,
    paddingRight: theme.spacing.unit * 4,
    boxSizing: "border-box",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
});

export const formFooter = theme => ({
  formFooter: {
    flex: "0 0 auto",
    margin: `${theme.spacing.unit} 0`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export const textField = theme => ({
  textField: {
    width: "100%",
    marginBottom: theme.spacing.unit * 4,
  },
});

export const dateField = theme => ({
  dateField: {
    width: "100%",
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 4,
  },
});

export const inlineLabel = theme => ({
  inlineLabel: {
    width: "100%",
    marginTop: theme.spacing.unit * 2.5,
    marginBottom: theme.spacing.unit * 4,
  },
});

export const fabButton = theme => ({
  fabButton: {
    position: "fixed",
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 4,
  },
});

const commonStyles = theme => ({
  ...general(theme),
  ...paper(theme),
  ...card(theme),
  ...tableStyles(theme),
  ...formFooter(theme),
  ...textField(theme),
  ...dateField(theme),
  ...inlineLabel(theme),
  ...fabButton(theme),
});

export default commonStyles;
