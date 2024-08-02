import React from "react";
import { TextInput, NumberInput } from "@openimis/fe-core";
import { FIELD_TYPES } from "../constants";
import { isEmptyObject } from "./utils";

// Creates additional fields from a JSON string and returns an array of field objects.
// @param { string } json - The JSON string containing additional fields.
// @param { string } stream - If object has some nesting property, it could be declared here.
// @returns { Array } - An array of field objects, each containing the field's type and value.
export const createFieldsBasedOnJSON = (json, stream = "") => {
  if (!json) return [];

  const additionalFields = JSON.parse(json);

  const fields = stream && !isEmptyObject(additionalFields) ? additionalFields[stream] : additionalFields;

  return Object.entries(fields).map(([property, value]) => {
    const field = { [property]: value };
    const fieldType = typeof value;
    return { fieldType, field };
  });
};

// Renders the appropriate input component based on the field type and value.
// @param { string } module - The name of module.
// @param { object } field - The field object containing the field's label and value.
// @param { string } fieldType - The type of the field.
// @param { boolean } isTranslationLabel - A flag to determine if the label is a translation.
// @returns { JSX.Element } - The rendered input component based on the field type.
// WARNING: Currently, only two types of inputs are supported for readOnly reasons.
export const renderInputComponent = (module, { fieldType, field }, isTranslationLabel = false) => {
  const { 0: label, 1: value } = Object.entries(field)[0];

  const labelValue = isTranslationLabel ? `${module}.additionalFields.${label}` : label;

  if (fieldType === FIELD_TYPES.INTEGER || fieldType === FIELD_TYPES.NUMBER) {
    return <NumberInput module={module} readOnly min={0} displayZero label={labelValue} value={value} />;
  }

  return <TextInput module={module} readOnly label={labelValue} value={value} />;
};
