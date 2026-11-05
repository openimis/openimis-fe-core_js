import React, { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Divider } from "@mui/material";

const StyledError = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  "& .errorHeader": {
    color: theme.palette.error.main,
  },
  "& .errorDetail": {
    color: theme.palette.error.main,
  },
  '& .errorlist': {
    color: theme.palette.error.main,
    margin: theme.spacing(1, 0, 1, 2),
    paddingLeft: theme.spacing(2),
    '& li': {
      listStyleType: 'disc',
    },
    '& .errorlist': {
      margin: theme.spacing(0.5, 0, 0.5, 2),
    }
  },
  '& .errorlist > li': {
    listStyleType: 'none',
  },
  '& .errorlist .errorlist > li': {
    listStyleType: 'disc',
  },
}));

// Fonction utilitaire pour détecter et rendre le HTML
const renderHtmlContent = (content) => {
  if (!content) return null;
  
  // Détecte si le contenu contient des balises HTML
  const htmlRegex = /<[a-z][\s\S]*>/i;
  if (htmlRegex.test(content)) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return content;
};

function Error(props) {
  const { error } = props;

  return (
    <StyledError>
      <Typography variant="h6" className="errorHeader">
        {error.code} {error.code && ": "} 
        {renderHtmlContent(error.message)}
      </Typography>
      {!!error.detail && (
        <Fragment>
          <Divider />
          <Typography variant="body1" className="errorDetail">
            {renderHtmlContent(error.detail)}
          </Typography>
        </Fragment>
      )}
    </StyledError>
  );
}

export default Error;
