import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { IconButton } from "@material-ui/core";
import { ExitToApp } from "@material-ui/icons";
import withHistory from "../helpers/history";
import { logout } from "../actions";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
}));

const LogoutButton = ({ history }) => {
  const dispatch = useDispatch();
  const onClick = async () => {
    await dispatch(logout());
    history.push(process.env.PUBLIC_URL);
  };

  const classes = useStyles();

  return (
    <IconButton className={classes.button} onClick={onClick}>
      <ExitToApp />
    </IconButton>
  );
};

export default withHistory(LogoutButton);
