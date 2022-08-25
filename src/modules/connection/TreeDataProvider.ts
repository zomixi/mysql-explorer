import { FormSchema, showForm } from "@/components/form";
import { ErrorCode } from "@/constants/error";
import { CONNECTION_DATA_KEY } from "@/constants/storage";
import { connectedConnection$ } from "@/store";
import { connect } from "@/utils/mysql";
import * as vscode from "vscode";
import { TreeItem } from "./TreeItem";

const formSchema: FormSchema<{
  host: string;
  port: string;
  userName: string;
  password: string;
}> = {
  host: {
    title: "Host",
    required: true,
    value: "localhost",
  },
  port: {
    title: "Port",
    required: true,
    value: "3306",
  },
  userName: {
    title: "User Name",
    required: true,
    value: "root",
  },
  password: {
    title: "Password",
    required: true,
    password: true,
  },
};

export default class TreeDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private connectedId: string | undefined;
  private treeData: TreeItem[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();

  constructor(private context: vscode.ExtensionContext) {
    this.treeData = this.getCacheTreeData();
  }

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this.treeData = this.getCacheTreeData();

    this._onDidChangeTreeData.fire();
  }

  getChildren(element?: TreeItem): TreeItem[] {
    if (element) {
      return [];
    }

    return this.treeData;
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element;
  }

  async addTreeItem() {
    try {
      const formValues = await showForm(formSchema);

      this.treeData = [
        ...this.treeData,
        new TreeItem(
          `${Date.now()}`,
          formValues.host,
          formValues.port,
          formValues.userName,
          formValues.password
        ),
      ];

      await this.setCacheTreeData(this.treeData);

      this._onDidChangeTreeData.fire();
    } catch (error) {
      if (error instanceof Error && error.message !== ErrorCode.CANCEL) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  }

  async updateTreeItem(target: TreeItem) {
    if (this.connectedId === target.id) {
      vscode.window.showErrorMessage("Connected connection cannot be edited");
      return;
    }

    try {
      const formValues = await showForm(formSchema, {
        host: target.host,
        port: target.port,
        userName: target.userName,
        password: target.password,
      });

      const index = this.treeData.findIndex(
        (element) => element.id === target.id
      );
      const newNode = { ...target, ...formValues };

      this.treeData[index] = new TreeItem(
        newNode.id,
        newNode.host,
        newNode.port,
        newNode.userName,
        newNode.password
      );

      await this.setCacheTreeData(this.treeData);

      this._onDidChangeTreeData.fire();
    } catch (error) {
      if (error instanceof Error && error.message !== ErrorCode.CANCEL) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  }

  async connectTreeItem(target: TreeItem) {
    connectedConnection$.current?.destroy();

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Connecting to ${target.label} ...`,
        cancellable: false,
      },
      async () => {
        try {
          const connection = await connect(
            target.host,
            target.port,
            target.userName,
            target.password
          );

          this.connectedId = target.id;
          this.toggleTreeItem(target, true);
          connectedConnection$.fire(connection);
        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(error.message);
          }
        }
      }
    );
  }

  async disconnectTreeItem(target: TreeItem) {
    this.connectedId = undefined;
    connectedConnection$.current?.destroy();
    connectedConnection$.fire();

    this.toggleTreeItem(target, false);
  }

  async toggleTreeItem(target: TreeItem, connected: boolean) {
    this.treeData = this.treeData.map((element) => {
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

    await this.setCacheTreeData(this.treeData);

    this._onDidChangeTreeData.fire();
  }

  async deleteTreeItem(target: TreeItem) {
    if (this.connectedId === target.id) {
      vscode.window.showErrorMessage("Connected connection cannot be deleted");
      return;
    }

    this.treeData = this.treeData.filter((element) => element.id !== target.id);

    await this.setCacheTreeData(this.treeData);

    this._onDidChangeTreeData.fire();
  }

  private getCacheTreeData() {
    const elements = this.context.globalState.get<TreeItem[]>(
      CONNECTION_DATA_KEY,
      []
    );

    return elements.map(
      (element) =>
        new TreeItem(
          element.id,
          element.host,
          element.port,
          element.userName,
          element.password,
          element.id === this.connectedId
        )
    );
  }

  private async setCacheTreeData(treeData: TreeItem[]) {
    const elements = treeData.map((element) => ({
      id: element.id,
      host: element.host,
      port: element.port,
      userName: element.userName,
      password: element.password,
    }));

    await this.context.globalState.update(CONNECTION_DATA_KEY, elements);
  }
}
