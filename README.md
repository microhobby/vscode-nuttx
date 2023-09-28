# NuttX `checkpatch`

Add the follow to the workspace `.vscode/settings.json` to enable C code linting, add the follow to the workspace settings `.vscode/settings.json`:

```json
"nuttx.checkPatch": true
```

The default path for the script is the `./tools/checkpatch.sh`, but this is assuming that you are with VS Code workspace in the NuttX root directory. If you are not, you can set the absolute path to the script with the follow setting:

```json
"nuttx.checkPatchPath": "/home/youruser/nuttx/tools/checkpatch.sh"
```

Relative paths from the workspace root are also supported:

```json
"nuttx.checkPatchPath": "${workspaceFolder}/../nuttx/tools/checkpatch.sh"
```
