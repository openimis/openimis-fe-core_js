import zxcvbn from 'zxcvbn';

export const addSuggestion = (suggestions, condition, message) => {
  if (condition) {
    suggestions.push(message);
  }
};

export const generateFeedback = (suggestions, formatMessageWithValues) => {
  if (suggestions.length > 0) {
    const requirements = suggestions.join(', ');
    const formattedMessage = formatMessageWithValues("admin.password.requirements", { requirements });
    return { feedback: formattedMessage, score: 0 };
  }
  return null;
};

export const validatePassword = (password, passwordPolicy, formatMessage, formatMessageWithValues) => {
  if (!passwordPolicy || !password) {
    return { feedback: "", score: 0 };
  }

  const jsonPasswordPolicy = JSON.parse(passwordPolicy);
  const suggestions = [];

  const {
    min_length,
    require_lower_case,
    require_upper_case,
    require_numbers,
    require_special_characters
  } = jsonPasswordPolicy || {};

  addSuggestion(suggestions, password.length < min_length, formatMessageWithValues("admin.password.minLength", { count: min_length }));
  addSuggestion(suggestions, require_lower_case && !/[a-z]/.test(password), formatMessageWithValues("admin.password.lowerCase", { count: require_lower_case }));
  addSuggestion(suggestions, require_upper_case && !/[A-Z]/.test(password), formatMessageWithValues("admin.password.upperCase", { count: require_upper_case }));
  addSuggestion(suggestions, require_numbers && !/\d/.test(password), formatMessageWithValues("admin.password.numbers", { count: require_numbers }));
  addSuggestion(suggestions, require_special_characters && !/[^a-zA-Z0-9]/.test(password), formatMessageWithValues("admin.password.specialCharacters", { count: require_special_characters }));

  const feedbackResult = generateFeedback(suggestions, formatMessageWithValues);
  if (feedbackResult) {
    return feedbackResult;
  }

  const result = zxcvbn(password);
  const feedback = result.feedback.suggestions.join(" ") || formatMessage("admin.password.strong");
  const score = result.score;

  let scoreDescription;
  switch (score) {
    case 1:
      scoreDescription = `${formatMessage("admin.password.weak")}. ${feedback}`;
      break;
    case 2:
      scoreDescription = `${formatMessage("admin.password.medium")}. ${feedback}`;
      break;
    case 3:
      scoreDescription = `${formatMessage("admin.password.strong")}`;
      break;
    case 4:
      scoreDescription = `${formatMessage("admin.password.veryStrong")}`;
      break;
    default:
      scoreDescription = formatMessage("admin.password.unknownScore");
  }

  return {
    feedback: scoreDescription,
    score,
  };
};
