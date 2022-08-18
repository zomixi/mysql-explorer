import { showInputBox, showInputBoxProps } from "./inputBox";

export type FormValues = Record<string, string | undefined>;
export type FormItemSchema = showInputBoxProps & {
  controlType?: "inputBox" | "selectBox";
};
export type FormSchema<T extends FormValues = FormValues> = Record<
  keyof T,
  FormItemSchema
>;

async function showForm<T extends FormValues = FormValues>(
  schema: FormSchema<T>,
  initialValues?: T
) {
  const formValues: FormValues = {};
  const schemaKeys = Object.keys(schema);

  for (let index = 0; index < schemaKeys.length; index++) {
    const schemaKey = schemaKeys[index];
    const {
      controlType,
      title,
      value,
      placeholder,
      password,
      buttons,
      prompt,
      validationMessage,
      step,
      totalSteps,
      enabled,
      busy,
      ignoreFocusOut,
      required,
      validate,
    } = schema[schemaKey] || {};

    if (controlType === "selectBox") {
      // TODO
    }

    formValues[schemaKey] = await showInputBox({
      title,
      value: initialValues?.[schemaKey] || value,
      placeholder,
      password,
      buttons,
      prompt,
      validationMessage,
      step,
      totalSteps,
      enabled,
      busy,
      ignoreFocusOut,
      required,
      validate,
    });
  }

  return formValues as T;
}

export { showForm };
