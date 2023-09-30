import * as vscode from 'vscode';
import { ExtensionUtils } from './utils/ExtensionUtils';
import CheckpatchProvider from './CheckPatchProvider';
import Configure from './Configure';
import ConfigureWorkspace from './ConfigureWorkspace';

export function activate(context: vscode.ExtensionContext) {
	ExtensionUtils.Global.CONTEXT = context;

    ExtensionUtils.writeln("Activating NuttX Helpers ...");

    if (ExtensionUtils.fromSettings<boolean>("checkPatch") === true) {
        const linter = new CheckpatchProvider();
        context.subscriptions.push(...linter.RegDisposables);
    }

    // default
    const configureActions = new Configure();
    const configureWorkspace = new ConfigureWorkspace();

    context.subscriptions.push(...configureActions.RegDisposables);
    context.subscriptions.push(...configureWorkspace.RegDisposables);
}

export function deactivate() {}
