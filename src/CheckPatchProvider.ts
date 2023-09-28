import * as vscode from 'vscode';
import * as cp from 'child_process';
import { 
    CHECKPATCH_ERROR_PREFIX
} from './utils/Consts';
import { ExtensionUtils } from './utils/ExtensionUtils';

export default class CheckpatchProvider implements vscode.CodeActionProvider {
    RegDisposables: vscode.Disposable[] = [];
    private diagnosticCollection =
        vscode
            .languages
                .createDiagnosticCollection('nuttx-checkpatch');

    constructor() {
        this.RegDisposables.push(
            vscode.languages.registerCodeActionsProvider('c', this)
        );

        this.RegDisposables.push(
            vscode.workspace.onDidOpenTextDocument((textDocument) => {
                this.lint(textDocument);
            }, null, this.RegDisposables)
        );

        this.RegDisposables.push(
            vscode.workspace.onDidSaveTextDocument((textDocument) => {
                this.lint(textDocument);
            }, null, this.RegDisposables)
        );

        this.RegDisposables.push(
            vscode.workspace.onDidCloseTextDocument((textDocument) => {
                // FIXME: this is the wrong event, happening only
                // when removed from cache
                this.diagnosticCollection.delete(textDocument.uri);
            }, null, this.RegDisposables)
        );

        // for the current document
        if (vscode.window.activeTextEditor) {
            this.lint(vscode.window.activeTextEditor.document);
        }
    }

    private parseOutput(output: string, code: vscode.TextDocument): void {
        let lines = output.split("\n");
        let diagnostics: vscode.Diagnostic[] = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (line.includes(CHECKPATCH_ERROR_PREFIX)) {
                let parts = line.split(CHECKPATCH_ERROR_PREFIX);
                let severity = vscode.DiagnosticSeverity.Error;
                let fileInfo = parts[0].trim().split(":"); 
                let message = parts[1].trim();
                let lineNum = parseInt(fileInfo[1]) - 1;
                let charNum = parseInt(fileInfo[2]);

                // get the next token
                let token =
                    code.lineAt(lineNum).text.slice(charNum).split(" ")[0];

                let range = new vscode.Range(
                    new vscode.Position(lineNum, charNum),
                    new vscode.Position(lineNum, charNum + token.length)
                );

                let diagnostic = new vscode.Diagnostic(
                    range,
                    message,
                    severity
                );

                diagnostics.push(diagnostic);
            }
        }

        this.diagnosticCollection.set(code.uri, diagnostics);
    }

    private lint(code: vscode.TextDocument): void {
        // only if this is a C code
        if (code.languageId == "c") {
            ExtensionUtils.writeln("Linting " + code.uri.fsPath);
            this.diagnosticCollection.delete(code.uri);

            // FIXME: this will not work for multi root workspaces
            // get the workspace folder path
            let cwd = vscode.workspace.rootPath;
            let codePath = code.uri.fsPath;
            let scriptPath =
                ExtensionUtils.fromSettings<string>("checkPatchPath");
            scriptPath = scriptPath!.replace(
                "${workspaceFolder}",
                cwd!.toString()
            );

            let output = "";
            let childP = cp.spawn(
                scriptPath!,
                [ "-f", codePath ],
                {
                    shell: true,
                    cwd: cwd
                }
            );

            if (childP.pid) {
                childP.stdout.on('data', (data: Buffer) => output += data);
                childP.stdout.on('end', () => this.parseOutput(output, code));
            } else {
                ExtensionUtils.showError(
                    "NuttX linter failed, check the logs",
                    true
                );
            }
        }
    }

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        throw new Error('Method not implemented.');
    }

    resolveCodeAction?(
        codeAction: vscode.CodeAction,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeAction> {
        throw new Error('Method not implemented.');
    }
}
