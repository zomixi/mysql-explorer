import { FormSchema, showForm } from "@/components/form";
import { ErrorCode } from "@/constants/error";
import { connectedConnection$ } from "@/store";
import {
  addDatabase,
  connectDatabase,
  deleteDatabase,
  getDatabases,
} from "@/utils/mysql";
import * as vscode from "vscode";
import { TreeItem } from "./TreeItem";

const formSchema: FormSchema<{
  name: string;
}> = {
  name: {
    title: "Database Name",
    required: true,
  },
};

export default class TreeDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  private connectedId: string | undefined;
  private treeData: TreeItem[] = [];
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();

  constructor(private context: vscode.ExtensionContext) {
    this.getTreeData().then((treeData) => (this.treeData = treeData));

    connectedConnection$.event(() => {
      this.connectedId = undefined;
      this.refresh();
    });
  }

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  async refresh() {
    this.treeData = await this.getTreeData();

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
    if (!connectedConnection$.current) {
      vscode.window.showErrorMessage("Please connect to a connection first");
      return;
    }

    try {
      const formValues = await showForm(formSchema);

      await addDatabase(connectedConnection$.current, formValues);

      this.refresh();
    } catch (error) {
      if (error instanceof Error && error.message !== ErrorCode.CANCEL) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  }

  async deleteTreeItem(target: TreeItem) {
    if (this.connectedId === target.id) {
      vscode.window.showErrorMessage("Connected database cannot be deleted");
      return;
    }

    await deleteDatabase(connectedConnection$.current, target);

    this.refresh();
  }

  async connectTreeItem(target: TreeItem) {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Connecting to ${target.label} ...`,
        cancellable: false,
      },
      async () => {
        try {
          console.log(target);

          await connectDatabase(connectedConnection$.current, target);
          this.connectedId = target.id;
          this.toggleTreeItem(target, true);
        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(error.message);
          }
        }
      }
    );
  }

  async toggleTreeItem(target: TreeItem, connected: boolean) {
    this.treeData = this.treeData.map((element) => {
      if (element.id === target.id) {
        return new TreeItem(element.id, element.name, connected);
      }

      if (element.connected) {
        return new TreeItem(element.id, element.name, false);
      }

      return element;
    });

    this._onDidChangeTreeData.fire();
  }

  async getTreeData() {
    if (connectedConnection$.current) {
      const rows = await getDatabases(connectedConnection$.current);

      return rows.map(
        (row) => new TreeItem(row.name, row.name, row.name === this.connectedId)
      );
    } else {
      return [];
    }
  }
}
