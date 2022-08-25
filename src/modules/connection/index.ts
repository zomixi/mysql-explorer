import * as vscode from "vscode";
import TreeDataProvider from "./TreeDataProvider";
import { TreeItem } from "./TreeItem";

export default class ConnectionModule {
  readonly treeDataProvider;
  readonly treeView;

  constructor(context: vscode.ExtensionContext) {
    this.treeDataProvider = new TreeDataProvider(context);
    this.treeView = vscode.window.createTreeView("connection", {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
    });

    context.subscriptions.push(this.treeView);

    this.registerCommands();
  }

  private registerCommands() {
    vscode.commands.registerCommand("connection.add", async () =>
      this.treeDataProvider.addTreeItem()
    );

    vscode.commands.registerCommand(
      "connection.edit",
      async (target: TreeItem) =>
        await this.treeDataProvider.updateTreeItem(target)
    );

    vscode.commands.registerCommand("connection.refresh", async () =>
      this.treeDataProvider.refresh()
    );

    vscode.commands.registerCommand(
      "connection.connect",
      async (target: TreeItem) => this.treeDataProvider.connectTreeItem(target)
    );

    vscode.commands.registerCommand(
      "connection.disconnect",
      async (target: TreeItem) =>
        this.treeDataProvider.disconnectTreeItem(target)
    );

    vscode.commands.registerCommand(
      "connection.delete",
      async (target: TreeItem) => this.treeDataProvider.deleteTreeItem(target)
    );
  }
}
