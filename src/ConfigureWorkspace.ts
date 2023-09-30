import * as vscode from 'vscode';
import * as cp from 'child_process';
import { 
    CMD_CONFIGURE_WORKSPACE, PUBLISHER_NAME
} from './utils/Consts';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ExtensionUtils } from './utils/ExtensionUtils';

export default class ConfigureWorkspace {
    RegDisposables: vscode.Disposable[] = [];

    constructor() {
        this.RegDisposables.push(
            vscode.commands.registerCommand(
                CMD_CONFIGURE_WORKSPACE, () => {
                    return this.configureNuttXWorkspace();
                }
            )
        );
    }

    private configureNuttXWorkspace (): void {
        // copy the extenion assets/.vscode folder to the workspace
        const extensionPath = 
            vscode
                .extensions
                    .getExtension(PUBLISHER_NAME)?.extensionPath ||
            (ExtensionUtils.Global.CONTEXT as vscode.ExtensionContext)
                .asAbsolutePath('');

        ExtensionUtils.writeln("Creating .vscode folder...");

        if (extensionPath) {
            const sourcePath = path.join(
                extensionPath, 'assets', '.vscode'
            );
            const destinationPath =
                vscode.workspace.workspaceFolders?.[0].uri.fsPath;

            if (destinationPath) {
                // check if the workspace already have the .vscode folder
                if (fs.existsSync(
                    path.join(
                        destinationPath,
                        ".vscode"
                    )
                )) {
                    ExtensionUtils.showWarning("Workspace already has .vscode folder");
                    return;
                }
            
                fs.copySync(
                    sourcePath,
                    path.join(destinationPath, ".vscode"),
                    {
                        overwrite: true
                    }
                );

                ExtensionUtils.writeln("Workspace configured");
                // reload the window
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            } else {
                ExtensionUtils.showError("Did you have a VS Code workspace opened?");
            }
        }
    }
}
