import * as vscode from "vscode";
import TreeDataProvider from "./TreeDataProvider";
import { TreeItem } from "./TreeItem";

const MODULE_NAME = "database";

export default class DatabaseModule {
  readonly treeDataProvider;
  readonly treeView;

  constructor(context: vscode.ExtensionContext) {
    this.treeDataProvider = new TreeDataProvider(context);
    this.treeView = vscode.window.createTreeView(`${MODULE_NAME}`, {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
    });

    context.subscriptions.push(this.treeView);

    this.registerCommands();
  }

  private registerCommands() {
    vscode.commands.registerCommand(`${MODULE_NAME}.add`, async () =>
      this.treeDataProvider.addTreeItem()
    );

    vscode.commands.registerCommand(`${MODULE_NAME}.refresh`, async () =>
      this.treeDataProvider.refresh()
    );

    vscode.commands.registerCommand(
      `${MODULE_NAME}.connect`,
      async (target: TreeItem) => this.treeDataProvider.connectTreeItem(target)
    );

    vscode.commands.registerCommand(
      `${MODULE_NAME}.delete`,
      async (target: TreeItem) => this.treeDataProvider.deleteTreeItem(target)
    );
  }
}
