import React, { Component } from "react";
import InputBase from "@material-ui/core/InputBase";
import { withStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";
import {
  IconButton,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  FormGroup
} from "@material-ui/core";
import { MAIN_SEARCHER_CONTRIBUTION_KEY, DRAWER_WIDTH } from "./CoreApp";

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    justifyContent: "center"
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  },
  root: {
    display: "flex"
  },
  grow: {
    flexGrow: 1
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    marginLeft: DRAWER_WIDTH,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0
  },
  drawerPaper: {
    width: DRAWER_WIDTH
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: DRAWER_WIDTH
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing.unit,
      width: "auto"
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inputRoot: {
    color: "inherit",
    width: "100%"
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: 120,
      "&:focus": {
        width: 200
      }
    }
  }
});

class MainSearcher extends Component {

  constructor(props) {
    super(props);
    this.state = {
      category: -1,
      keywords: ""
    };

    this.searcherContribs = this.props.modulesManager.getContributions(
      MAIN_SEARCHER_CONTRIBUTION_KEY
    );  
  }

  doSearch = () => {
    this.state.searcher(this.props.history, this.state.keywords);
  }

  keyPress = e => {
    if (e.keyCode == 13 && this.state.searcher) {
      this.doSearch();
    }
  };

  handleSearchCategoryChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
      searcher: (e.target.value !== -1 && this.searcherContribs[e.target.value].searcher) || null
    });
  };

  handleSearchKeywordsChange = e => {
    this.setState({
      keywords: e.target.value,
    });
  };  

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.search}>
        <FormGroup row>
          <FormControl variant="outlined" className={classes.formControl}>
            <Select
              value={this.state.category}
              onChange={this.handleSearchCategoryChange}
              input={
                <OutlinedInput
                  labelWidth={0}
                  name="category"
                  id="category-select-input"
                />
              }
              id="category-search-select"
            >
              <MenuItem key="category-search-not-selected" value={-1}>
                Select category...
              </MenuItem>

              {this.searcherContribs.map((contrib, index) => {
                let k = `${MAIN_SEARCHER_CONTRIBUTION_KEY}_${index}`;
                return (
                  <MenuItem key={k} value={index}>
                    {contrib.label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl
            disabled={this.state.category == -1}
            className={classes.formControl}
          >
            <InputBase
              placeholder="Enter Keywords…"
              onChange={this.handleSearchKeywordsChange}
              onKeyDown={this.keyPress}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
              id="category-search-keywords"
            />
          </FormControl>
          <FormControl
            className={classes.formControl}
            style={{ minWidth: "0px" }}
          >
            <IconButton onClick={this.doSearch} disabled={this.state.category == -1} color="inherit">
              <SearchIcon />
            </IconButton>
          </FormControl>
        </FormGroup>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MainSearcher);
