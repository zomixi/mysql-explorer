import * as vscode from "vscode";
import path = require("path");

export class TreeItem extends vscode.TreeItem {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly connected?: boolean
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);

    if (connected) {
      this.iconPath = {
        light: path.resolve(__filename, "../../resources/light/connected.svg"),
        dark: path.resolve(__filename, "../../resources/dark/connected.svg"),
      };
    }

    this.contextValue = connected
      ? "connectedDatabase"
      : "disconnectedDatabase";
  }
}
