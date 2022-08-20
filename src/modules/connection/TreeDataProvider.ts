import { CONNECTION_DATA_KEY } from "@/constants/storage";
import * as vscode from "vscode";
import { TreeItem } from "./TreeItem";

export default class TreeDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private cachedTreeData: TreeItem[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeItem | undefined | void
  >();

  constructor(private context: vscode.ExtensionContext) {
    this.cachedTreeData = this.getTreeData();
  }

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this.cachedTreeData = this.getTreeData();

    this._onDidChangeTreeData.fire();
  }

  getChildren(element?: TreeItem): TreeItem[] {
    if (element) {
      return [];
    }

    return this.cachedTreeData;
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  async addTreeItem(
    formValues: Pick<TreeItem, "host" | "port" | "userName" | "password">
  ) {
    this.cachedTreeData = [
      ...this.cachedTreeData,
      new TreeItem(
        `${Date.now()}`,
        formValues.host,
        formValues.port,
        formValues.userName,
        formValues.password
      ),
    ];

    await this.context.globalState.update(
      CONNECTION_DATA_KEY,
      this.cachedTreeData
    );

    this._onDidChangeTreeData.fire();
  }

  async updateTreeItem(target: TreeItem, values: Partial<TreeItem>) {
    const index = this.cachedTreeData.findIndex(
      (element) => element.id === target.id
    );
    const newNode = { ...target, ...values };

    this.cachedTreeData[index] = new TreeItem(
      newNode.id,
      newNode.host,
      newNode.port,
      newNode.userName,
      newNode.password
    );

    await this.context.globalState.update(
      CONNECTION_DATA_KEY,
      this.cachedTreeData
    );

    this._onDidChangeTreeData.fire();
  }

  async toggleTreeItem(target: TreeItem, connected: boolean) {
    this.cachedTreeData = this.cachedTreeData.map((element) => {
      if (element.id === target.id) {
        return new TreeItem(
          element.id,
          element.host,
          element.port,
          element.userName,
          element.password,
          connected
        );
      }

      if (element.connected) {
        return new TreeItem(
          element.id,
          element.host,
          element.port,
          element.userName,
          element.password,
          false
        );
      }

      return element;
    });

    await this.context.globalState.update(
      CONNECTION_DATA_KEY,
      this.cachedTreeData
    );

    this._onDidChangeTreeData.fire();
  }

  async deleteTreeItem(target: TreeItem) {
    this.cachedTreeData = this.cachedTreeData.filter(
      (element) => element.id !== target.id
    );

    await this.context.globalState.update(
      CONNECTION_DATA_KEY,
      this.cachedTreeData
    );

    this._onDidChangeTreeData.fire();
  }

  private getTreeData() {
    const nodes = this.context.globalState.get<TreeItem[]>(
      CONNECTION_DATA_KEY,
      []
    );

    return nodes.map(
      (element) =>
        new TreeItem(
          element.id,
          element.host,
          element.port,
          element.userName,
          element.password,
          element.connected
        )
    );
  }
}
