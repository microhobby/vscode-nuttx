import * as vscode from 'vscode';
import { ExtensionUtils } from './utils/ExtensionUtils';
import CheckpatchProvider from './CheckPatchProvider';

export function activate(context: vscode.ExtensionContext) {
	ExtensionUtils.Global.CONTEXT = context;

    ExtensionUtils.writeln("Activating NuttX Helpers ...");

    if (ExtensionUtils.fromSettings<boolean>("checkPatch") === true) {
        let linter = new CheckpatchProvider();
        context.subscriptions.push(...linter.RegDisposables);
    }
}

export function deactivate() {}
