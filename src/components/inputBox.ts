import { ErrorCode } from "@/constants/error";
import * as vscode from "vscode";

export type createInputBoxProps = Partial<
  Pick<
    vscode.InputBox,
    | "title"
    | "value"
    | "placeholder"
    | "password"
    | "buttons"
    | "prompt"
    | "validationMessage"
    | "step"
    | "totalSteps"
    | "enabled"
    | "busy"
    | "ignoreFocusOut"
  >
>;

export type showInputBoxProps = createInputBoxProps & {
  required?: boolean;
  validate?: (
    value: string
  ) => Promise<string | undefined> | string | undefined;
};

function createInputBox({
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
}: createInputBoxProps) {
  const inputBox = vscode.window.createInputBox();
  inputBox.title = title;
  inputBox.placeholder = placeholder;
  inputBox.password = password || false;
  inputBox.buttons = buttons || [];
  inputBox.prompt = prompt;
  inputBox.validationMessage = validationMessage;
  inputBox.step = step;
  inputBox.totalSteps = totalSteps;
  inputBox.enabled = enabled || true;
  inputBox.busy = busy || false;
  inputBox.ignoreFocusOut = ignoreFocusOut || false;

  if (value) {
    inputBox.value = value;
  }

  return inputBox;
}

function showInputBox({
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
}: showInputBoxProps) {
  return new Promise<string | undefined>((resolve, reject) => {
    const inputBox = createInputBox({
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
    });

    inputBox.onDidAccept(async () => {
      const value = inputBox.value;

      if (required && !value) {
        inputBox.validationMessage = `${title || "this"}' is required`;
        return;
      }

      inputBox.enabled = false;
      inputBox.busy = true;
      const validationMessage = await validate?.(value);
      inputBox.enabled = true;
      inputBox.busy = false;

      if (validationMessage) {
        inputBox.validationMessage = validationMessage;
      } else {
        resolve(value);
        inputBox.dispose();
      }
    });

    inputBox.onDidHide(() => {
      reject(new Error(ErrorCode.CANCEL));
      inputBox.dispose();
    });

    inputBox.show();
  });
}

export { createInputBox, showInputBox };
