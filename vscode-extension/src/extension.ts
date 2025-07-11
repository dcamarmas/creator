import * as vscode from "vscode";
import { CreatorDebugSession } from "./creatorDebugSession";
import { CreatorRpcClient } from "./creatorRpcClient";
import * as fs from "fs";
import * as path from "path";

let debugSession: CreatorDebugSession | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log("CREATOR Assembly Debugger is now active!");

    // Register debug adapter factory
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory(
            "creator-assembly",
            new CreatorDebugAdapterFactory(),
        ),
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand("creator-debugger.start", async () => {
            await startDebugging();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("creator-debugger.stop", async () => {
            if (debugSession) {
                await debugSession.terminate();
                debugSession = undefined;
                vscode.commands.executeCommand(
                    "setContext",
                    "creator-debugger.active",
                    false,
                );
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("creator-debugger.step", async () => {
            if (debugSession) {
                await debugSession.stepOver();
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.continue",
            async () => {
                if (debugSession) {
                    await debugSession.continue();
                }
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("creator-debugger.reset", async () => {
            if (debugSession) {
                await debugSession.reset();
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.selectArchitecture",
            async () => {
                const fileUri = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        "Architecture Files": ["yml", "yaml"],
                        "All Files": ["*"],
                    },
                    openLabel: "Select Architecture File",
                    title: "Select CREATOR Architecture File",
                });

                if (fileUri && fileUri[0]) {
                    const architectureFile = fileUri[0].fsPath;
                    const config =
                        vscode.workspace.getConfiguration("creator-debugger");
                    await config.update(
                        "defaultArchitectureFile",
                        architectureFile,
                        vscode.ConfigurationTarget.Global,
                    );
                    vscode.window.showInformationMessage(
                        `Default architecture file set to ${architectureFile}`,
                    );
                }
            },
        ),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.showMemoryHexDump",
            async () => {
                try {
                    const config =
                        vscode.workspace.getConfiguration("creator-debugger");
                    const rpcServerUrl = config.get<string>(
                        "rpcServerUrl",
                        "http://localhost:8080",
                    );
                    const client = new CreatorRpcClient(rpcServerUrl);

                    // Create a hex viewer webview
                    const panel = vscode.window.createWebviewPanel(
                        "memoryHexViewer",
                        `Memory Hex Viewer`,
                        vscode.ViewColumn.Beside,
                        {
                            enableScripts: true,
                            retainContextWhenHidden: true,
                            localResourceRoots: [
                                vscode.Uri.file(
                                    path.join(context.extensionPath, "src"),
                                ),
                            ],
                        },
                    );

                    // Provide the HTML for the webview
                    const cssUri = panel.webview.asWebviewUri(
                        vscode.Uri.file(
                            path.join(
                                context.extensionPath,
                                "src",
                                "hexViewer.css",
                            ),
                        ),
                    );
                    panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Memory Hex Viewer</title>
    <link rel="stylesheet" href="${cssUri}">
</head>
<body>
    <div id="hex-viewer-container"></div>
    <script>
      // --- HexViewer class (from standalone HTML, slightly adapted for VSCode webview) ---
      ${getHexViewerClassSource()}
      // --- End HexViewer class ---

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
    </script>
</body>
</html>
                `;

                    // Handle messages from the webview
                    panel.webview.onDidReceiveMessage(async msg => {
                        if (msg.type === "requestMemory") {
                            try {
                                const memoryDump = await client.getMemoryDump();
                                panel.webview.postMessage({
                                    type: "memoryDump",
                                    memoryDump,
                                });
                            } catch (err) {
                                panel.webview.postMessage({
                                    type: "memoryDump",
                                    memoryDump: {
                                        addresses: [],
                                        values: [],
                                        hints: [],
                                        wordSize: 4,
                                        highestAddress: 0,
                                    },
                                });
                            }
                        }
                    });
                } catch (error) {
                    vscode.window.showErrorMessage(
                        `Failed to show memory hex dump: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`,
                    );
                    return;
                }
            },
        ),
    );

    // Helper to inject the HexViewer class source code
    function getHexViewerClassSource() {
        // HexViewer class adapted from test_hex_viewer_standalone.html (without DOMContentLoaded and mock data)
        return `
class HexViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.memoryDump = null;
    this.bytesPerRow = options.bytesPerRow || 16;
    this.showAscii = options.showAscii !== false;
    this.showAddresses = options.showAddresses !== false;
    this.selectedByte = -1;
    this.hintMap = new Map();
    this.hintTooltip = null;
    this.onRefresh = null;

    this.setupContainer();
    this.setupEventListeners();
  }

  setupContainer() {
    this.container.innerHTML = \`
      <div class="hex-viewer">
        <div class="hex-viewer-toolbar">
          <div class="toolbar-group">
            <button id="refresh-button" class="toolbar-button">Refresh Memory</button>
          </div>
          <div class="toolbar-group">
            <label for="goto-address">Go to address:</label>
            <input id="goto-address" class="address-input" type="text" placeholder="e.g. 0x200000" style="width:110px;">
            <button id="goto-button" class="toolbar-button">Go</button>
          </div>
          <div class="toolbar-group">
            <label for="bytes-per-row">Bytes/Row:</label>
            <select id="bytes-per-row" class="bytes-per-row-select">
              <option value="8">8</option>
              <option value="16" selected>16</option>
              <option value="32">32</option>
              <option value="64">64</option>
            </select>
          </div>
        </div>
        <div class="hex-viewer-content">
          <div class="hex-viewer-header">
            <div class="address-column-header">Address</div>
            <div class="hex-columns-header"></div>
            \${this.showAscii ? '<div class="ascii-column-header">ASCII</div>' : ""}
          </div>
          <div class="hex-viewer-body" tabindex="0" style="overflow-y: auto; height: 100%;">
            <div class="hex-rows"></div>
          </div>
        </div>
        <div class="hex-viewer-status">
          <span class="status-info">Ready</span>
          <span class="selection-info"></span>
        </div>
      </div>
    \`;

    this.updateHeader();
  }

  setupEventListeners() {
    const refreshButton = this.container.querySelector("#refresh-button");
    const gotoInput = this.container.querySelector("#goto-address");
    const gotoButton = this.container.querySelector("#goto-button");
    const bytesPerRowSelect = this.container.querySelector("#bytes-per-row");
    const hexViewerBody = this.container.querySelector(".hex-viewer-body");

    refreshButton.addEventListener("click", () => {
      if (this.onRefresh) {
        this.onRefresh();
      }
    });

    gotoButton.addEventListener("click", () => {
      this.handleGotoAddress(gotoInput.value);
    });
    gotoInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        this.handleGotoAddress(gotoInput.value);
      }
    });

    bytesPerRowSelect.addEventListener("change", () => {
      this.bytesPerRow = parseInt(bytesPerRowSelect.value);
      this.updateHeader();
      this._renderState = {};
      this.render();
    });

    hexViewerBody.addEventListener("keydown", e => {
      this.handleKeyDown(e);
    });

    hexViewerBody.addEventListener("click", e => {
      this.handleClick(e);
    });

    hexViewerBody.addEventListener("mouseover", e => {
      this.handleMouseOver(e);
    });

    hexViewerBody.addEventListener("mouseout", e => {
      this.handleMouseOut(e);
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        this._renderState = {};
        this.adjustLayout();
      });
      resizeObserver.observe(this.container);
    }
  }

  handleGotoAddress(addrStr) {
    let address = 0;
    if (typeof addrStr !== "string" || addrStr.trim() === "") return;
    if (addrStr.startsWith("0x") || addrStr.startsWith("0X")) {
      address = parseInt(addrStr, 16);
    } else {
      address = parseInt(addrStr, 10);
    }
    if (isNaN(address) || !this.memoryDump) return;

    address = Math.max(0, Math.min(address, this.memoryDump.highestAddress));
    this.selectByte(address);

    const row = Math.floor(address / this.bytesPerRow);
    const rowHeight = 24;
    const hexViewerBody = this.container.querySelector(".hex-viewer-body");
    hexViewerBody.scrollTop = row * rowHeight;
  }

  updateHeader() {
    const hexColumnsHeader = this.container.querySelector(".hex-columns-header");
    let headerHtml = "";

    for (let i = 0; i < this.bytesPerRow; i++) {
      headerHtml += \`<span class="hex-column-header">\${i.toString(16).toUpperCase().padStart(2, "0")}</span>\`;
    }

    hexColumnsHeader.innerHTML = headerHtml;
  }

  handleKeyDown(e) {
    if (!this.memoryDump || this.memoryDump.highestAddress === 0) return;

    const maxIndex = this.memoryDump.highestAddress;
    let newSelection = this.selectedByte;

    switch (e.key) {
      case "ArrowLeft":
        newSelection = Math.max(0, this.selectedByte - 1);
        break;
      case "ArrowRight":
        newSelection = Math.min(maxIndex, this.selectedByte + 1);
        break;
      case "ArrowUp":
        newSelection = Math.max(0, this.selectedByte - this.bytesPerRow);
        break;
      case "ArrowDown":
        newSelection = Math.min(maxIndex, this.selectedByte + this.bytesPerRow);
        break;
      case "Home":
        newSelection = Math.floor(this.selectedByte / this.bytesPerRow) * this.bytesPerRow;
        break;
      case "End":
        newSelection = Math.min(
          maxIndex,
          Math.floor(this.selectedByte / this.bytesPerRow) * this.bytesPerRow + this.bytesPerRow - 1,
        );
        break;
      case "PageUp":
        newSelection = Math.max(0, this.selectedByte - this.bytesPerRow * 10);
        break;
      case "PageDown":
        newSelection = Math.min(maxIndex, this.selectedByte + this.bytesPerRow * 10);
        break;
      default:
        return;
    }

    e.preventDefault();
    this.selectByte(newSelection);
  }

  handleClick(e) {
    const target = e.target;

    if (target.classList.contains("hex-byte")) {
      const index = parseInt(target.dataset.index || "-1");
      if (index >= 0) {
        this.selectByte(index);

        const hintInfo = this.hintMap.get(index);
        if (hintInfo) {
          this.showHintTooltip(target, hintInfo);
        }
      }
    }
  }

  handleMouseOver(e) {
    const target = e.target;

    if (target.classList.contains("hex-byte")) {
      const index = parseInt(target.dataset.index || "-1");
      const hintInfo = this.hintMap.get(index);
      if (hintInfo) {
        this.showHintTooltip(target, hintInfo);
      }
    }
  }

  handleMouseOut(e) {
    const target = e.target;

    if (target.classList.contains("hex-byte")) {
      this.hideHintTooltip();
    }
  }

  showHintTooltip(element, hintInfo) {
    this.hideHintTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "hint-tooltip";

    const header = document.createElement("div");
    header.className = "hint-header";
    header.textContent = hintInfo.tag + (hintInfo.type ? " (" + hintInfo.type + ")" : "");
    tooltip.appendChild(header);

    if (hintInfo.sizeInBits) {
      const details = document.createElement("div");
      details.className = "hint-details";
      details.textContent = \`Size: \${hintInfo.sizeInBits} bits (\${Math.ceil(hintInfo.sizeInBits / 8)} bytes)\`;
      tooltip.appendChild(details);
    }

    document.body.appendChild(tooltip);
    this.hintTooltip = tooltip;

    const rect = element.getBoundingClientRect();
    tooltip.style.left = \`\${rect.left}px\`;
    tooltip.style.top = \`\${rect.bottom + 5}px\`;

    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
      tooltip.style.left = \`\${window.innerWidth - tooltipRect.width - 10}px\`;
    }
    if (tooltipRect.bottom > window.innerHeight) {
      tooltip.style.top = \`\${rect.top - tooltipRect.height - 5}px\`;
    }
  }

  hideHintTooltip() {
    if (this.hintTooltip) {
      this.hintTooltip.remove();
      this.hintTooltip = null;
    }
  }

  selectByte(index) {
    if (!this.memoryDump || index < 0 || index > this.memoryDump.highestAddress) return;

    const prevSelected = this.container.querySelector(".hex-byte.selected");
    if (prevSelected) {
      prevSelected.classList.remove("selected");
    }

    const prevSelectedAscii = this.container.querySelector(".ascii-char.selected");
    if (prevSelectedAscii) {
      prevSelectedAscii.classList.remove("selected");
    }

    this.selectedByte = index;
    const hexByte = this.container.querySelector(\`[data-index="\${index}"].hex-byte\`);
    const asciiChar = this.container.querySelector(\`[data-index="\${index}"].ascii-char\`);

    if (hexByte) {
      hexByte.classList.add("selected");
      hexByte.scrollIntoView({ block: "nearest" });
    }

    if (asciiChar) {
      asciiChar.classList.add("selected");
    }

    this.updateSelectionInfo();
  }

  updateSelectionInfo() {
    const selectionInfo = this.container.querySelector(".selection-info");

    if (this.selectedByte >= 0 && this.memoryDump) {
      const address = this.selectedByte;
      const value = this.getMemoryValue(address);
      const char = value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";

      let info = \`Address: 0x\${address.toString(16).toUpperCase().padStart(8, "0")} | Value: 0x\${value.toString(16).toUpperCase().padStart(2, "0")} (\${value}) | ASCII: '\${char}'\`;

      const hintInfo = this.hintMap.get(address);
      if (hintInfo) {
        info += " | Hint: " + hintInfo.tag + (hintInfo.type ? " (" + hintInfo.type + ")" : "");
      }

      selectionInfo.textContent = info;
    } else {
      selectionInfo.textContent = "";
    }
  }

  adjustLayout() {
    const containerWidth = this.container.clientWidth;
    const minBytesPerRow = 8;

    const charWidth = 10;
    const addressWidth = 100;
    const asciiWidth = this.showAscii ? this.bytesPerRow * charWidth : 0;
    const hexWidth = this.bytesPerRow * 3 * charWidth;

    const totalNeededWidth = addressWidth + hexWidth + asciiWidth + 100;

    if (totalNeededWidth > containerWidth && this.bytesPerRow > minBytesPerRow) {
      const newBytesPerRow = Math.max(minBytesPerRow, Math.floor(this.bytesPerRow / 2));
      if (newBytesPerRow !== this.bytesPerRow) {
        this.bytesPerRow = newBytesPerRow;
        const select = this.container.querySelector("#bytes-per-row");
        select.value = this.bytesPerRow.toString();
        this.updateHeader();
      }
    }
    // Always force a render after layout adjustment
    this._renderState = {};
    this.render();
  }

  getMemoryValue(address) {
    if (!this.memoryDump) return 0;

    const index = this.memoryDump.addresses.indexOf(address);
    if (index !== -1) {
      return this.memoryDump.values[index];
    }
    return 0;
  }

  setMemoryDump(dump) {
    this._renderState = {}; // Force re-render on new memory dump
    this.memoryDump = dump;
    this.selectedByte = -1;

    this.hintMap.clear();
    const hintColors = new Map();
    let colorIndex = 0;

    for (const hint of dump.hints) {
      const address = parseInt(hint.address);

      const tagTypeKey = hint.tag + ":" + hint.type;
      if (!hintColors.has(tagTypeKey)) {
        hintColors.set(tagTypeKey, colorIndex % 8);
        colorIndex++;
      }

      const hintColorIndex = hintColors.get(tagTypeKey);

      const sizeInBytes = hint.sizeInBits ? Math.ceil(hint.sizeInBits / 8) : 1;
      for (let i = 0; i < sizeInBytes; i++) {
        this.hintMap.set(address + i, {
          tag: hint.tag,
          type: hint.type,
          sizeInBits: hint.sizeInBits,
          colorIndex: hintColorIndex,
        });
      }
    }

    this.render();
    this.updateStatus();

    const hexViewerBody = this.container.querySelector(".hex-viewer-body");
    if (hexViewerBody && !hexViewerBody._virtualScrollAttached) {
      hexViewerBody.addEventListener("scroll", () => this.renderVisibleRows());
      hexViewerBody._virtualScrollAttached = true;
    }
  }

  render() {
    const hexRows = this.container.querySelector(".hex-rows");
    hexRows.innerHTML = "";

    if (!this.memoryDump || this.memoryDump.highestAddress === 0) {
      hexRows.innerHTML = '<div class="no-data">No data in memory</div>';
      return;
    }

    const hexViewerBody = this.container.querySelector(".hex-viewer-body");
    const rowHeight = 24;
    const totalRows = Math.ceil((this.memoryDump.highestAddress + 1) / this.bytesPerRow);
    hexRows.style.position = "relative";
    hexRows.style.height = totalRows * rowHeight + "px";

    this.renderVisibleRows();
  }

  renderVisibleRows() {
    if (!this._renderState) this._renderState = {};
    const state = this._renderState;
    const hexRows = this.container.querySelector(".hex-rows");
    if (!this.memoryDump || this.memoryDump.highestAddress === 0) {
      return;
    }
    const hexViewerBody = this.container.querySelector(".hex-viewer-body");
    const rowHeight = 24;
    const totalRows = Math.ceil((this.memoryDump.highestAddress + 1) / this.bytesPerRow);

    const scrollTop = hexViewerBody.scrollTop;
    const bodyHeight = hexViewerBody.clientHeight;
    const viewportRows = Math.ceil(bodyHeight / rowHeight);
    const bufferRows = viewportRows * 3;
    const centerRow = Math.floor(scrollTop / rowHeight);
    const firstRow = Math.max(0, centerRow - bufferRows);
    const lastRow = Math.min(totalRows, centerRow + viewportRows + bufferRows);

    const visibleStart = Math.floor(scrollTop / rowHeight);
    const visibleEnd = Math.min(totalRows, visibleStart + viewportRows);

    if (
      state.firstRow !== undefined &&
      state.lastRow !== undefined &&
      visibleStart >= state.firstRow &&
      visibleEnd <= state.lastRow
    ) {
      return;
    }
    state.firstRow = firstRow;
    state.lastRow = lastRow;

    Array.from(hexRows.children).forEach(e => hexRows.removeChild(e));

    const topSpacer = document.createElement("div");
    topSpacer.className = "spacer";
    topSpacer.style.height = firstRow * rowHeight + "px";
    hexRows.appendChild(topSpacer);

    for (let row = firstRow; row < lastRow; row++) {
      const rowElement = document.createElement("div");
      rowElement.className = "hex-row";
      rowElement.style.height = rowHeight + "px";

      const startIndex = row * this.bytesPerRow;
      const endIndex = Math.min(startIndex + this.bytesPerRow, this.memoryDump.highestAddress + 1);
      const address = startIndex;

      const addressElement = document.createElement("div");
      addressElement.className = "address-column";
      addressElement.textContent = \`0x\${address.toString(16).toUpperCase().padStart(8, "0")}\`;
      rowElement.appendChild(addressElement);

      const hexColumnsElement = document.createElement("div");
      hexColumnsElement.className = "hex-columns";

      for (let i = 0; i < this.bytesPerRow; i++) {
        const byteIndex = startIndex + i;
        const hexByteElement = document.createElement("span");
        hexByteElement.className = "hex-byte";
        hexByteElement.dataset.index = byteIndex.toString();

        if (byteIndex <= this.memoryDump.highestAddress) {
          const value = this.getMemoryValue(byteIndex);
          hexByteElement.textContent = value.toString(16).toUpperCase().padStart(2, "0");

          if (value === 0) {
            hexByteElement.classList.add("zero");
          }

          const hintInfo = this.hintMap.get(byteIndex);
          if (hintInfo) {
            hexByteElement.classList.add(\`hint-\${hintInfo.colorIndex}\`);
          }

          hexByteElement.title = \`Address: 0x\${byteIndex.toString(16).toUpperCase()}\\nValue: 0x\${value.toString(16).toUpperCase()} (\${value})\`;
        } else {
          hexByteElement.textContent = "  ";
          hexByteElement.classList.add("empty");
        }

        hexColumnsElement.appendChild(hexByteElement);
      }
      rowElement.appendChild(hexColumnsElement);

      if (this.showAscii) {
        const asciiElement = document.createElement("div");
        asciiElement.className = "ascii-column";

        for (let i = 0; i < this.bytesPerRow; i++) {
          const byteIndex = startIndex + i;
          const asciiCharElement = document.createElement("span");
          asciiCharElement.className = "ascii-char";
          asciiCharElement.dataset.index = byteIndex.toString();

          if (byteIndex <= this.memoryDump.highestAddress) {
            const value = this.getMemoryValue(byteIndex);
            const char = value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";
            asciiCharElement.textContent = char;

            const hintInfo = this.hintMap.get(byteIndex);
            if (hintInfo) {
              asciiCharElement.classList.add(\`hint-\${hintInfo.colorIndex}\`);
            }
          } else {
            asciiCharElement.textContent = " ";
            asciiCharElement.classList.add("empty");
          }

          asciiElement.appendChild(asciiCharElement);
        }
        rowElement.appendChild(asciiElement);
      }

      hexRows.appendChild(rowElement);
    }

    const bottomSpacer = document.createElement("div");
    bottomSpacer.className = "spacer";
    bottomSpacer.style.height = (totalRows - lastRow) * rowHeight + "px";
    hexRows.appendChild(bottomSpacer);
  }

  updateStatus() {
    const statusInfo = this.container.querySelector(".status-info");

    if (this.memoryDump) {
      const writtenCount = this.memoryDump.addresses.length;
      const highestAddr = this.memoryDump.highestAddress;
      statusInfo.textContent = \`Showing memory up to 0x\${highestAddr.toString(16).toUpperCase()} (\${writtenCount} bytes written)\`;
    } else {
      statusInfo.textContent = "No memory data loaded";
    }
  }

  focus() {
    const hexViewerBody = this.container.querySelector(".hex-viewer-body");
    hexViewerBody.focus();
  }

  setRefreshCallback(callback) {
    this.onRefresh = callback;
  }
}
        `;
    }

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "creator-debugger.memoryNavigation",
            async (action: string) => {
                try {
                    switch (action) {
                        case "previousPage":
                            memoryProvider.previousPage();
                            break;
                        case "nextPage":
                            memoryProvider.nextPage();
                            break;
                        case "goToAddress":
                            const addressInput =
                                await vscode.window.showInputBox({
                                    prompt: "Enter memory address (hex)",
                                    placeHolder: "e.g., 0x10000 or 10000",
                                    value: memoryProvider.getCurrentAddress(),
                                    validateInput: value => {
                                        if (!value)
                                            return "Address is required";
                                        try {
                                            parseInt(value, 16);
                                            return null;
                                        } catch {
                                            return "Invalid hex address";
                                        }
                                    },
                                });
                            if (addressInput) {
                                memoryProvider.goToAddress(addressInput);
                            }
                            break;
                        case "goToPC":
                            if (debugSession) {
                                const config =
                                    vscode.workspace.getConfiguration(
                                        "creator-debugger",
                                    );
                                const rpcServerUrl = config.get<string>(
                                    "rpcServerUrl",
                                    "http://localhost:8080",
                                );
                                const client = new CreatorRpcClient(
                                    rpcServerUrl,
                                );
                                const pc = await client.getPC();
                                memoryProvider.goToAddress(pc.value);
                            }
                            break;
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(
                        `Memory navigation failed: ${error instanceof Error ? error.message : String(error)}`,
                    );
                }
            },
        ),
    );

    // Register tree data providers for debug views
    const registerProvider = new RegisterProvider();
    const memoryProvider = new MemoryProvider();
    const instructionProvider = new InstructionProvider();

    context.subscriptions.push(
        vscode.window.createTreeView("creator-registers", {
            treeDataProvider: registerProvider,
            showCollapseAll: true,
        }),
    );

    context.subscriptions.push(
        vscode.window.createTreeView("creator-memory", {
            treeDataProvider: memoryProvider,
            showCollapseAll: true,
        }),
    );

    context.subscriptions.push(
        vscode.window.createTreeView("creator-instructions", {
            treeDataProvider: instructionProvider,
            showCollapseAll: true,
        }),
    );

    // Listen to debug session changes to update providers
    vscode.debug.onDidChangeActiveDebugSession(session => {
        if (session && session.type === "creator-assembly") {
            debugSession = session as any; // Type assertion for custom debug session
            vscode.commands.executeCommand(
                "setContext",
                "creator-debugger.active",
                true,
            );

            // Update providers
            registerProvider.refresh();
            memoryProvider.refresh();
            instructionProvider.refresh();
        }
    });

    vscode.debug.onDidTerminateDebugSession(session => {
        if (session.type === "creator-assembly") {
            debugSession = undefined;
            vscode.commands.executeCommand(
                "setContext",
                "creator-debugger.active",
                false,
            );

            // Clear providers
            registerProvider.clear();
            memoryProvider.clear();
            instructionProvider.clear();
        }
    });

    // Check RPC server status on activation
    checkRpcServerStatus();
}

async function startDebugging() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage("No active assembly file to debug");
        return;
    }

    const document = activeEditor.document;
    const filePath = document.fileName;

    // Check if it's an assembly file
    if (![".s", ".asm", ".S"].some(ext => filePath.endsWith(ext))) {
        vscode.window.showErrorMessage(
            "Please open an assembly file (.s, .asm, .S)",
        );
        return;
    }

    // Get configuration
    const config = vscode.workspace.getConfiguration("creator-debugger");
    const architectureFile = config.get<string>("defaultArchitectureFile");
    const rpcServerUrl = config.get<string>(
        "rpcServerUrl",
        "http://localhost:8080",
    );

    // If no architecture file is configured, prompt user to select one
    let selectedArchitectureFile = architectureFile;
    if (!selectedArchitectureFile) {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                "Architecture Files": ["yml", "yaml"],
                "All Files": ["*"],
            },
            openLabel: "Select Architecture File",
            title: "Select CREATOR Architecture File for Debugging",
        });

        if (!fileUri || !fileUri[0]) {
            vscode.window.showErrorMessage(
                "No architecture file selected. Cannot start debugging.",
            );
            return;
        }
        selectedArchitectureFile = fileUri[0].fsPath;
    }

    // Check if RPC server is running
    const client = new CreatorRpcClient(rpcServerUrl);
    const isAlive = await client.isServerAlive();

    if (!isAlive) {
        const action = await vscode.window.showErrorMessage(
            "CREATOR RPC server is not running. Please start the server first.",
            "Show Instructions",
        );

        if (action === "Show Instructions") {
            vscode.window.showInformationMessage(
                "Start the CREATOR RPC server by running: cd rpc-server && deno run --allow-net --allow-read --allow-env server.mts",
            );
        }
        return;
    }

    // Start debug session
    const debugConfig = {
        type: "creator-assembly",
        request: "launch",
        name: "Debug Assembly",
        program: filePath,
        architectureFile: selectedArchitectureFile,
        rpcServerUrl: rpcServerUrl,
    };

    vscode.debug.startDebugging(undefined, debugConfig);
}

async function checkRpcServerStatus() {
    const config = vscode.workspace.getConfiguration("creator-debugger");
    const rpcServerUrl = config.get<string>(
        "rpcServerUrl",
        "http://localhost:8080",
    );

    const client = new CreatorRpcClient(rpcServerUrl);
    const isAlive = await client.isServerAlive();

    if (!isAlive) {
        vscode.window
            .showWarningMessage(
                "CREATOR RPC server is not running. Some features may not work.",
                "Start Server Instructions",
            )
            .then(action => {
                if (action) {
                    vscode.window.showInformationMessage(
                        "To start the CREATOR RPC server, run: cd rpc-server && deno run --allow-net --allow-read --allow-env server.mts",
                    );
                }
            });
    }
}

class CreatorDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    createDebugAdapterDescriptor(
        session: vscode.DebugSession,
    ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(
            new CreatorDebugSession(),
        );
    }
}

// Tree data providers for debug views
class RegisterProvider implements vscode.TreeDataProvider<RegisterItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<
        RegisterItem | undefined | null | void
    >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private registers: RegisterItem[] = [];

    refresh(): void {
        this.loadRegisters();
        this._onDidChangeTreeData.fire();
    }

    clear(): void {
        this.registers = [];
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RegisterItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: RegisterItem): Thenable<RegisterItem[]> {
        if (!element) {
            return Promise.resolve(this.registers);
        }
        return Promise.resolve([]);
    }

    private async loadRegisters() {
        if (!debugSession) return;

        try {
            const config =
                vscode.workspace.getConfiguration("creator-debugger");
            const rpcServerUrl = config.get<string>(
                "rpcServerUrl",
                "http://localhost:8080",
            );
            const client = new CreatorRpcClient(rpcServerUrl);

            const registerBank = await client.getRegisterBank("int_registers");
            this.registers = registerBank.registers.map(
                reg => new RegisterItem(reg.name, `0x${reg.value}`, reg.nbits),
            );
        } catch (error) {
            console.error("Failed to load registers:", error);
        }
    }
}

class MemoryProvider
    implements vscode.TreeDataProvider<MemoryItem | MemoryNavigationItem>
{
    private _onDidChangeTreeData = new vscode.EventEmitter<
        MemoryItem | MemoryNavigationItem | undefined | null | void
    >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private memoryItems: (MemoryItem | MemoryNavigationItem)[] = [];
    private currentBaseAddress: number = 0;
    private pageSize: number = 16; // Show 16 memory locations per page

    refresh(): void {
        this.loadMemory();
        this._onDidChangeTreeData.fire();
    }

    clear(): void {
        this.memoryItems = [];
        this._onDidChangeTreeData.fire();
    }

    // Add navigation methods
    goToAddress(address: string): void {
        try {
            this.currentBaseAddress = parseInt(address, 16);
            this.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Invalid address: ${address}`);
        }
    }

    nextPage(): void {
        this.currentBaseAddress += this.pageSize * 4; // Assuming 4-byte words
        this.refresh();
    }

    previousPage(): void {
        this.currentBaseAddress -= this.pageSize * 4;
        if (this.currentBaseAddress < 0) this.currentBaseAddress = 0;
        this.refresh();
    }

    getCurrentAddress(): string {
        return `0x${this.currentBaseAddress.toString(16).toUpperCase()}`;
    }

    getTreeItem(element: MemoryItem | MemoryNavigationItem): vscode.TreeItem {
        return element;
    }

    getChildren(
        element?: MemoryItem | MemoryNavigationItem,
    ): Thenable<(MemoryItem | MemoryNavigationItem)[]> {
        if (!element) {
            return Promise.resolve(this.memoryItems);
        }
        return Promise.resolve([]);
    }

    private async loadMemory() {
        if (!debugSession) return;

        try {
            const config =
                vscode.workspace.getConfiguration("creator-debugger");
            const rpcServerUrl = config.get<string>(
                "rpcServerUrl",
                "http://localhost:8080",
            );
            const client = new CreatorRpcClient(rpcServerUrl);

            // Use current base address or fallback to PC
            let baseAddr = this.currentBaseAddress;
            if (baseAddr === 0) {
                const pc = await client.getPC();
                baseAddr = parseInt(pc.value, 16);
                this.currentBaseAddress = baseAddr;
            }

            this.memoryItems = [];

            // Add navigation controls as special items
            this.memoryItems.push(
                new MemoryNavigationItem("⬆️ Previous Page", "previousPage"),
            );
            this.memoryItems.push(
                new MemoryNavigationItem(
                    `📍 Current: ${this.getCurrentAddress()}`,
                    "goToAddress",
                ),
            );
            this.memoryItems.push(
                new MemoryNavigationItem("⬇️ Next Page", "nextPage"),
            );
            this.memoryItems.push(
                new MemoryNavigationItem("🔍 Go to PC", "goToPC"),
            );

            await this.loadMemoryData(client, baseAddr);
        } catch (error) {
            console.error("Failed to load memory:", error);
        }
    }

    private async loadMemoryData(client: CreatorRpcClient, baseAddr: number) {
        try {
            // Try to get memory with hints first
            const memoryWithHints = await client.getMemoryWithHints(
                `0x${baseAddr.toString(16)}`,
                this.pageSize * 4, // Load pageSize worth of data
            );

            for (const entry of memoryWithHints.entries) {
                let description = "";
                let tooltip = entry.value;

                // Add hints to the description and tooltip if available
                if (entry.hints.length > 0) {
                    const hintDescriptions = entry.hints.map((hint: any) => {
                        const tagType = hint.tag + (hint.type ? " (" + hint.type + ")" : "");
                        const sizeInfo = hint.sizeInBits
                            ? ` (${hint.sizeInBits}b)`
                            : "";
                        const offsetInfo =
                            entry.hints.length > 1 ? ` @+${hint.offset}` : "";
                        return `${tagType}${sizeInfo}${offsetInfo}`;
                    });
                    description = ` // ${hintDescriptions.join(", ")}`;
                    tooltip = `${entry.value}\n\nHints:\n${hintDescriptions.join("\n")}`;
                }

                const item = new MemoryItem(
                    entry.address,
                    entry.value.split("x")[1] || entry.value,
                );
                if (description) {
                    item.description = `0x${item.value}${description}`;
                }
                item.tooltip = tooltip;
                this.memoryItems.push(item);
            }
        } catch {
            // Fallback to basic memory display
            for (let i = 0; i < this.pageSize; i++) {
                const addr = baseAddr + i * 4;
                try {
                    const memory = await client.getMemory(
                        `0x${addr.toString(16)}`,
                        4,
                    );
                    this.memoryItems.push(
                        new MemoryItem(
                            `0x${addr.toString(16).toUpperCase()}`,
                            memory.data.join(""),
                        ),
                    );
                } catch {
                    // Skip failed memory reads
                }
            }
        }
    }
}

class InstructionProvider implements vscode.TreeDataProvider<InstructionItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<
        InstructionItem | undefined | null | void
    >();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private instructions: InstructionItem[] = [];

    refresh(): void {
        this.loadInstructions();
        this._onDidChangeTreeData.fire();
    }

    clear(): void {
        this.instructions = [];
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: InstructionItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: InstructionItem): Thenable<InstructionItem[]> {
        if (!element) {
            return Promise.resolve(this.instructions);
        }
        return Promise.resolve([]);
    }

    private async loadInstructions() {
        if (!debugSession) return;

        try {
            const config =
                vscode.workspace.getConfiguration("creator-debugger");
            const rpcServerUrl = config.get<string>(
                "rpcServerUrl",
                "http://localhost:8080",
            );
            const client = new CreatorRpcClient(rpcServerUrl);

            const instructions = await client.getInstructions();
            this.instructions = instructions.map(
                instr =>
                    new InstructionItem(
                        instr.address,
                        instr.asm,
                        instr.isCurrentInstruction,
                        instr.isBreakpoint,
                    ),
            );
        } catch (error) {
            console.error("Failed to load instructions:", error);
        }
    }
}

class RegisterItem extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly value: string,
        public readonly bits: number,
    ) {
        super(`${name}: ${value}`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${name} (${bits}-bit): ${value}`;
        this.description = value;
    }
}

class MemoryItem extends vscode.TreeItem {
    constructor(
        public readonly address: string,
        public readonly value: string,
    ) {
        super(`${address}: ${value}`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Memory at ${address}: 0x${value}`;
        this.description = `0x${value}`;
    }
}

class InstructionItem extends vscode.TreeItem {
    constructor(
        public readonly address: string,
        public readonly instruction: string,
        public readonly isCurrent: boolean,
        public readonly isBreakpoint?: boolean,
    ) {
        super(
            `${address}: ${instruction}`,
            vscode.TreeItemCollapsibleState.None,
        );
        this.tooltip = `${address}: ${instruction}`;

        if (isCurrent) {
            this.iconPath = new vscode.ThemeIcon(
                "arrow-right",
                new vscode.ThemeColor("debugIcon.startForeground"),
            );
        } else if (isBreakpoint) {
            this.iconPath = new vscode.ThemeIcon(
                "debug-breakpoint",
                new vscode.ThemeColor("debugIcon.breakpointForeground"),
            );
        }
    }
}

class MemoryNavigationItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly action: string,
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: "creator-debugger.memoryNavigation",
            title: label,
            arguments: [action],
        };
        this.contextValue = "memoryNavigation";
    }
}

export function deactivate() {
    console.log("CREATOR Assembly Debugger is now deactivated");
}
