export const ensureArray = (maybeArray) => {
  if (Array.isArray(maybeArray)) {
    return maybeArray;
  } else {
    return [maybeArray];
  }
};
