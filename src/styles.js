import { styled } from "@mui/material/styles";

export const ValidIcon = styled("div")(({ theme }) => ({
  color: "green",
}));

export const InvalidIcon = styled("div")(({ theme }) => ({
  color: theme.palette.error.main,
}));
