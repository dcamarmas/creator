(function () {
    // VSCode API
    const vscode = acquireVsCodeApi();

    // Initialize the hex viewer
    document.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById("hex-viewer-container");
        const hexViewer = new HexViewer(container);

        // Set up refresh callback to request memory from extension
        hexViewer.setRefreshCallback(() => {
            vscode.postMessage({ type: "requestMemory" });
        });

        // Listen for memory data from extension
        window.addEventListener("message", event => {
            const msg = event.data;
            if (msg.type === "memoryDump") {
                hexViewer.setMemoryDump(msg.memoryDump);
                hexViewer.focus();
            }
        });

        // Initial memory request
        vscode.postMessage({ type: "requestMemory" });
    });
})();