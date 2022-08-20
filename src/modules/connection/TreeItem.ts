import * as vscode from "vscode";
import path = require("path");

export class TreeItem extends vscode.TreeItem {
  constructor(
    readonly id: string,
    readonly host: string,
    readonly port: string,
    readonly userName: string,
    readonly password: string,
    readonly connected?: boolean
  ) {
    super(`${host}:${port}`, vscode.TreeItemCollapsibleState.None);

    if (connected) {
      this.iconPath = {
        light: path.resolve(__filename, "../../resources/light/connected.svg"),
        dark: path.resolve(__filename, "../../resources/dark/connected.svg"),
      };
    }

    this.contextValue = connected
      ? "connectedConnection"
      : "disconnectedConnection";
  }
}
