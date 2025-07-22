import * as vscode from "vscode";
import { debuggerEvents } from "./debuggerEvents";

// Module level variable to track the active panel.
let activeHexViewerPanel: vscode.WebviewPanel | null = null;

/**
 * Registers the command to show the hex viewer and manages its lifecycle.
 * @param context The extension context.
 */
export function registerHexViewerCommand(context: vscode.ExtensionContext) {
    // Listen for memory updates from the debugger to send to the webview
    debuggerEvents.on("memoryUpdated", memoryDump => {
        if (activeHexViewerPanel) {
            console.log("Received memory update, posting to webview.");
            activeHexViewerPanel.webview.postMessage({
                type: "memoryDump",
                memoryDump,
            });
        }
    });

    const command = vscode.commands.registerCommand(
        "creator-debugger.showMemoryHexDump",
        () => {
            // If the panel already exists, reveal it
            if (activeHexViewerPanel) {
                activeHexViewerPanel.reveal(vscode.ViewColumn.Beside);
                return;
            }

            // Otherwise, create a new panel
            activeHexViewerPanel = vscode.window.createWebviewPanel(
                "memoryHexViewer",
                "Memory Hex Viewer",
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(context.extensionUri, "src"),
                    ],
                },
            );

            // Set the webview's initial content
            activeHexViewerPanel.webview.html = getWebviewContent(
                activeHexViewerPanel.webview,
                context.extensionUri,
            );

            // Handle disposal
            activeHexViewerPanel.onDidDispose(
                () => {
                    activeHexViewerPanel = null;
                },
                null,
                context.subscriptions,
            );

            // Handle messages from the webview
            activeHexViewerPanel.webview.onDidReceiveMessage(msg => {
                if (msg.type === "requestMemory") {
                    // Tell the debug session we need a refresh. The session will fetch
                    // the data and emit the 'memoryUpdated' event.
                    console.log("Webview requested manual memory refresh.");
                    debuggerEvents.emit("requestMemoryRefresh");
                }
            });

            // Request initial memory state when the panel is first shown
            debuggerEvents.emit("requestMemoryRefresh");
        },
    );

    context.subscriptions.push(command);
}

/**
 * Generates the HTML content for the webview, linking to external CSS and JS files.
 * @param webview The webview instance.
 * @param extensionUri The URI of the extension's root directory.
 * @returns The HTML string for the webview.
 */
function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
): string {
    // Get URIs for the local resources
    const cssUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
            extensionUri,
            "src",
            "webViews",
            "hexViewer",
            "hexViewer.css",
        ),
    );
    const hexViewerScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
            extensionUri,
            "src",
            "webViews",
            "hexViewer",
            "hexViewer.js",
        ),
    );
    const mainScriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
            extensionUri,
            "src",
            "webViews",
            "hexViewer",
            "main.js",
        ),
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            
            <title>Memory Hex Viewer</title>
            <link rel="stylesheet" href="${cssUri}">
        </head>
        <body>
            <div id="hex-viewer-container"></div>
            
            <script nonce="${nonce}" src="${hexViewerScriptUri}"></script>
            <script nonce="${nonce}" src="${mainScriptUri}"></script>
        </body>
        </html>
    `;
}

function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
