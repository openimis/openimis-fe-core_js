import React from "react";

const toIconName = (input) => {
  let name = input.replace(/Icon$/, "").replace(/Outlined$/, "");
  let snake = name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([a-zA-Z])([0-9]+)/g, "$1_$2")
    .toLowerCase()
    .replace(/__+/g, "_");
  return snake;
};

const GetIconComponent = (inputName, options = {}) => {
  const variant = options.variant || "outlined";
  const className = `material-symbols-${variant}`;
  const transforms = [];
  if (options.rotate !== undefined) transforms.push(`rotate(${options.rotate}deg)`);
  if (options.flip === "horizontal") transforms.push("scaleX(-1)");
  if (options.flip === "vertical") transforms.push("scaleY(-1)");
  const transform = transforms.length > 0 ? transforms.join(" ") : undefined;
  const style = {
    fontSize: "inherit",
    verticalAlign: "middle",
    color: "inherit",
    ...(transform && { transform }),
    ...options.styleOverrides,
  };
  const createIconSpan = (iconName) => (props) => {
    const p = props || {};
    const { className: pClassName = "", style: pStyle = {}, color, ...rest } = p;
    const finalStyle = {
      ...style,
      ...pStyle,
      ...(color != null ? { color } : {}),
    };
    return (
      <span {...rest} className={`${className} ${pClassName}`} style={finalStyle}>
        {iconName}
      </span>
    );
  };

  // === Handle null, undefined, or empty values ===
  if (inputName == null || (typeof inputName === "string" && !inputName.trim())) {
    console.warn("GetIconComponent: Received empty/null input → falling back to Add icon");
    return createIconSpan("indeterminate_question_box");
  }

  // === Already a component function ===
  if (typeof inputName === "function") {
    console.log(`GetIconComponent: Received component function → ${inputName.name || "Anonymous"}`);
    return inputName;
  }

  // === Already a component ===
  if (React.isValidElement(inputName)) {
    console.log(`GetIconComponent: Received component → ${inputName.displayName || inputName.name || "Unknown"}`);
    return inputName; // return as-is (best for performance)
  }

  // === String case ===
  if (typeof inputName === "string") {
    const iconName = toIconName(inputName);
    return createIconSpan(iconName);
  }

  // Safety fallback
  console.warn("GetIconComponent: Unexpected input type", typeof inputName);
  return createIconSpan("indeterminate_question_box");
};

export default GetIconComponent;
