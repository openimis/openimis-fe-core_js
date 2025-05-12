const RIGHT_NAME_WORDS_SEPARATOR = "_";
const RIGHT_NAME_OMITTED_WORDS = ["gql", "mutation", "perms"];
const QUERY_STRING = "query";
const SEARCH_STRING = "search";
const WHITESPACE = " ";

const capitalizeFirstLetter = (string) => {
  return string
    .split(WHITESPACE)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(WHITESPACE);
};

export const formatRoleLabel = (moduleName = "", permName = "", addPrefix = false) => {
  const rightNameWords = permName
    .split(RIGHT_NAME_WORDS_SEPARATOR)
    .filter((word) => !RIGHT_NAME_OMITTED_WORDS.includes(word));

  const rightNameLabel = rightNameWords
    .map(capitalizeFirstLetter)
    .join(WHITESPACE)
    .replace(QUERY_STRING, SEARCH_STRING);
  const moduleNameLabel = moduleName.split(RIGHT_NAME_WORDS_SEPARATOR).map(capitalizeFirstLetter).join(WHITESPACE);

  return `${addPrefix ? "[No Translation] " : null} ${moduleNameLabel} | ${rightNameLabel}`;
};
