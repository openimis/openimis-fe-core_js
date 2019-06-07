import { createMuiTheme } from "@material-ui/core";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontFamily: ["Rubik", "Roboto", '"Helvetica Neue"', "sans-serif"].join(","),
    fontSize: 14,
    fontWeightRegular: 300,
    fontWeightMedium: 400,
    title: {
      fontSize: 20,
      fontWeight: 300,
    },
    // color: { main: "#006273" },
  },
  palette: {
    primary: { main: "#006273" },
    secondary: { main: "#fff" },
    text: {
      primary: "#006273",
      secondary: "#fff",  
    }    
  },
});

export default theme;
