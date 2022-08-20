import { FormSchema, showForm } from "@/components/form";
import { ErrorCode } from "@/constants/error";
import { connect } from "@/utils/mysql";
import { Connection } from "mysql";
import * as vscode from "vscode";
import TreeDataProvider from "./TreeDataProvider";
import { TreeItem } from "./TreeItem";

export default class ConnectionModule {
  readonly treeDataProvider;
  readonly treeView;
  private connectedConnection?: Connection | undefined;

  private formSchema: FormSchema<{
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
    vscode.commands.registerCommand("connection.add", async () => {
      try {
        const formValues = await showForm(this.formSchema);

        this.treeDataProvider.addTreeItem(formValues);
      } catch (error) {
        if (error instanceof Error && error.message === ErrorCode.CANCEL) {
          return;
        }

        throw error;
      }
    });

    vscode.commands.registerCommand(
      "connection.edit",
      async (target: TreeItem) => {
        try {
          const formValues = await showForm(this.formSchema, {
            host: target.host,
            port: target.port,
            userName: target.userName,
            password: target.password,
          });

          this.treeDataProvider.updateTreeItem(target, formValues);
        } catch (error) {
          if (error instanceof Error && error.message === ErrorCode.CANCEL) {
            return;
          }

          throw error;
        }
      }
    );

    vscode.commands.registerCommand("connection.refresh", async () => {
      this.treeDataProvider.refresh();
    });

    vscode.commands.registerCommand(
      "connection.connect",
      async (target: TreeItem) => {
        this.connectedConnection?.destroy();

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `Connecting to ${target.label}`,
            cancellable: false,
          },
          async () => {
            try {
              this.connectedConnection = await connect(
                target.host,
                target.port,
                target.userName,
                target.password
              );

              this.treeDataProvider.toggleTreeItem(target, true);
            } catch (error) {
              if (error instanceof Error) {
                vscode.window.showErrorMessage(error.message);
              }
            }
          }
        );
      }
    );

    vscode.commands.registerCommand(
      "connection.disconnect",
      async (target: TreeItem) => {
        this.connectedConnection?.destroy();

        this.treeDataProvider.toggleTreeItem(target, false);
      }
    );

    vscode.commands.registerCommand(
      "connection.delete",
      async (target: TreeItem) => {
        this.treeDataProvider.deleteTreeItem(target);
      }
    );
  }
}
