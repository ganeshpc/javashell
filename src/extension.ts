import * as vscode from "vscode";
import { TextEncoder, TextDecoder } from "util";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "javashell" is now active!');

  let disposable = vscode.commands.registerCommand(
    "javashell.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from JavaShell!");
    }
  );

  context.subscriptions.push(disposable);

  context.subscriptions.push(
    vscode.workspace.registerNotebookSerializer("my-notbook", new SampleSerializer())
  );
}

interface RawNotebook {
  cells: RawNotebookCell[];
}

interface RawNotebookCell {
  source: string[];
  cell_type: "code" | "markdown";
}

class SampleSerializer implements vscode.NotebookSerializer {
  async deserializeNotebook(
    content: Uint8Array,
    _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    let contents = new TextDecoder().decode(content);
    let raw: RawNotebookCell[];

    try {
      raw = (<RawNotebook>JSON.parse(contents)).cells;
    } catch {
      raw = [];
    }

    const cells = raw.map(
      (item) =>
        new vscode.NotebookCellData(
          item.cell_type === "code"
            ? vscode.NotebookCellKind.Code
            : vscode.NotebookCellKind.Markup,
          item.source.join("\n"),
          item.cell_type === "code" ? "python" : "markdown"
        )
    );

    return new vscode.NotebookData(cells);
  }
  async serializeNotebook(
    data: vscode.NotebookData,
    _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    let contents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      contents.push({
        cell_type:
          cell.kind === vscode.NotebookCellKind.Code ? "code" : "markdown",
        source: cell.value.split(/\r?\n/g),
      });
    }

    return new TextEncoder().encode(JSON.stringify(contents));
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
