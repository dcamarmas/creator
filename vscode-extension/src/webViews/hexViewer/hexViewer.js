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

        // Snake game properties
        this.isSnakeGameActive = false;
        this.snakeGame = null;
        this.easterEggSequence = "snake";
        this.userInputSequence = "";
        this.isSnakeGameReady = false;

        this.setupContainer();
        this.setupEventListeners();
    }

    setupContainer() {
        this.container.innerHTML = `
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
            ${this.showAscii ? '<div class="ascii-column-header">ASCII</div>' : ""}
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
    `;

        this.updateHeader();
    }

    setupEventListeners() {
        const refreshButton = this.container.querySelector("#refresh-button");
        const gotoInput = this.container.querySelector("#goto-address");
        const gotoButton = this.container.querySelector("#goto-button");
        const bytesPerRowSelect =
            this.container.querySelector("#bytes-per-row");
        const hexViewerBody = this.container.querySelector(".hex-viewer-body");

        // Add the easter egg listener to the whole document
        document.addEventListener("keydown", e => this.handleEasterEgg(e));

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

        address = Math.max(
            0,
            Math.min(address, this.memoryDump.highestAddress),
        );
        this.selectByte(address);

        const row = Math.floor(address / this.bytesPerRow);
        const rowHeight = 24;
        const hexViewerBody = this.container.querySelector(".hex-viewer-body");
        hexViewerBody.scrollTop = row * rowHeight;
    }

    updateHeader() {
        const hexColumnsHeader = this.container.querySelector(
            ".hex-columns-header",
        );
        let headerHtml = "";

        for (let i = 0; i < this.bytesPerRow; i++) {
            headerHtml += `<span class="hex-column-header">${i.toString(16).toUpperCase().padStart(2, "0")}</span>`;
        }

        hexColumnsHeader.innerHTML = headerHtml;
    }

    handleEasterEgg(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
            this.userInputSequence = ""; // Reset if user is typing elsewhere
            return;
        }

        if (this.isSnakeGameActive) return;

        this.userInputSequence += e.key.toLowerCase();
        if (this.userInputSequence.length > this.easterEggSequence.length) {
            this.userInputSequence = this.userInputSequence.slice(
                -this.easterEggSequence.length,
            );
        }

        if (this.userInputSequence === this.easterEggSequence) {
            this.userInputSequence = ""; // Reset for next time
            this.isSnakeGameReady = true;
            this._snakeShowReadyMessage();
        }
    }

    handleKeyDown(e) {
        if (this.isSnakeGameReady) {
            if (e.key.startsWith("Arrow")) {
                e.preventDefault();
                this.isSnakeGameReady = false;
                this._snakeStart(e.key);
            }
            // Return to prevent any other key handling while in ready state
            return;
        }
        if (this.isSnakeGameActive) {
            this._snakeHandleInput(e);
            return; // Prevent default navigation during game
        }

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
                newSelection = Math.max(
                    0,
                    this.selectedByte - this.bytesPerRow,
                );
                break;
            case "ArrowDown":
                newSelection = Math.min(
                    maxIndex,
                    this.selectedByte + this.bytesPerRow,
                );
                break;
            case "Home":
                newSelection =
                    Math.floor(this.selectedByte / this.bytesPerRow) *
                    this.bytesPerRow;
                break;
            case "End":
                newSelection = Math.min(
                    maxIndex,
                    Math.floor(this.selectedByte / this.bytesPerRow) *
                        this.bytesPerRow +
                        this.bytesPerRow -
                        1,
                );
                break;
            case "PageUp":
                newSelection = Math.max(
                    0,
                    this.selectedByte - this.bytesPerRow * 10,
                );
                break;
            case "PageDown":
                newSelection = Math.min(
                    maxIndex,
                    this.selectedByte + this.bytesPerRow * 10,
                );
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
        header.textContent =
            hintInfo.tag + (hintInfo.type ? " (" + hintInfo.type + ")" : "");
        tooltip.appendChild(header);

        if (hintInfo.sizeInBits) {
            const details = document.createElement("div");
            details.className = "hint-details";
            details.textContent = `Size: ${hintInfo.sizeInBits} bits (${Math.ceil(hintInfo.sizeInBits / 8)} bytes)`;
            tooltip.appendChild(details);
        }

        document.body.appendChild(tooltip);
        this.hintTooltip = tooltip;

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 5}px`;

        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.right > window.innerWidth) {
            tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
        }
        if (tooltipRect.bottom > window.innerHeight) {
            tooltip.style.top = `${rect.top - tooltipRect.height - 5}px`;
        }
    }

    hideHintTooltip() {
        if (this.hintTooltip) {
            this.hintTooltip.remove();
            this.hintTooltip = null;
        }
    }

    selectByte(index) {
        if (
            !this.memoryDump ||
            index < 0 ||
            index > this.memoryDump.highestAddress
        )
            return;

        const prevSelected = this.container.querySelector(".hex-byte.selected");
        if (prevSelected) {
            prevSelected.classList.remove("selected");
        }

        const prevSelectedAscii = this.container.querySelector(
            ".ascii-char.selected",
        );
        if (prevSelectedAscii) {
            prevSelectedAscii.classList.remove("selected");
        }

        this.selectedByte = index;
        const hexByte = this.container.querySelector(
            `[data-index="${index}"].hex-byte`,
        );
        const asciiChar = this.container.querySelector(
            `[data-index="${index}"].ascii-char`,
        );

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
            const char =
                value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";

            let info = `Address: 0x${address.toString(16).toUpperCase().padStart(8, "0")} | Value: 0x${value.toString(16).toUpperCase().padStart(2, "0")} (${value}) | ASCII: '${char}'`;

            const hintInfo = this.hintMap.get(address);
            if (hintInfo) {
                info +=
                    " | Hint: " +
                    hintInfo.tag +
                    (hintInfo.type ? " (" + hintInfo.type + ")" : "");
            }

            selectionInfo.textContent = info;
        } else {
            selectionInfo.textContent = "";
        }
    }

    adjustLayout() {
        if (this.isSnakeGameReady) {
            this.isSnakeGameReady = false;
            const hexViewerBody =
                this.container.querySelector(".hex-viewer-body");
            hexViewerBody.style.overflow =
                this.originalState?.overflow || "auto";
        }
        if (this.isSnakeGameActive) {
            this._snakeEnd("Window resized, game over.", false);
        }
        const containerWidth = this.container.clientWidth;
        const minBytesPerRow = 8;

        const charWidth = 10;
        const addressWidth = 100;
        const asciiWidth = this.showAscii ? this.bytesPerRow * charWidth : 0;
        const hexWidth = this.bytesPerRow * 3 * charWidth;

        const totalNeededWidth = addressWidth + hexWidth + asciiWidth + 100;

        if (
            totalNeededWidth > containerWidth &&
            this.bytesPerRow > minBytesPerRow
        ) {
            const newBytesPerRow = Math.max(
                minBytesPerRow,
                Math.floor(this.bytesPerRow / 2),
            );
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
        if (this.isSnakeGameActive) {
            this._snakeEnd("Data reloaded, game over.", false);
        }
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

            const sizeInBytes = hint.sizeInBits
                ? Math.ceil(hint.sizeInBits / 8)
                : 1;
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
            hexViewerBody.addEventListener("scroll", () =>
                this.renderVisibleRows(),
            );
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
        const totalRows = Math.ceil(
            (this.memoryDump.highestAddress + 1) / this.bytesPerRow,
        );
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
        const totalRows = Math.ceil(
            (this.memoryDump.highestAddress + 1) / this.bytesPerRow,
        );

        const scrollTop = hexViewerBody.scrollTop;
        const bodyHeight = hexViewerBody.clientHeight;
        const viewportRows = Math.ceil(bodyHeight / rowHeight);
        const bufferRows = viewportRows * 3;
        const centerRow = Math.floor(scrollTop / rowHeight);
        const firstRow = Math.max(0, centerRow - bufferRows);
        const lastRow = Math.min(
            totalRows,
            centerRow + viewportRows + bufferRows,
        );

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
            const endIndex = Math.min(
                startIndex + this.bytesPerRow,
                this.memoryDump.highestAddress + 1,
            );
            const address = startIndex;

            const addressElement = document.createElement("div");
            addressElement.className = "address-column";
            addressElement.textContent = `0x${address.toString(16).toUpperCase().padStart(8, "0")}`;
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
                    hexByteElement.textContent = value
                        .toString(16)
                        .toUpperCase()
                        .padStart(2, "0");

                    if (value === 0) {
                        hexByteElement.classList.add("zero");
                    }

                    const hintInfo = this.hintMap.get(byteIndex);
                    if (hintInfo) {
                        hexByteElement.classList.add(
                            `hint-${hintInfo.colorIndex}`,
                        );
                    }

                    hexByteElement.title = `Address: 0x${byteIndex.toString(16).toUpperCase()}\\nValue: 0x${value.toString(16).toUpperCase()} (${value})`;
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
                        const char =
                            value >= 32 && value <= 126
                                ? String.fromCharCode(value)
                                : ".";
                        asciiCharElement.textContent = char;

                        const hintInfo = this.hintMap.get(byteIndex);
                        if (hintInfo) {
                            asciiCharElement.classList.add(
                                `hint-${hintInfo.colorIndex}`,
                            );
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
            statusInfo.textContent = `Showing memory up to 0x${highestAddr.toString(16).toUpperCase()} (${writtenCount} bytes written)`;
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

    // secret methods

    _snakeShowReadyMessage() {
        const hexViewerBody = this.container.querySelector(".hex-viewer-body");
        const asciiHeader = this.container.querySelector(
            ".ascii-column-header",
        );

        this.originalState = {
            scrollTop: hexViewerBody.scrollTop,
            overflow: hexViewerBody.style.overflow,
            asciiHeaderText: asciiHeader ? asciiHeader.textContent : "",
        };

        hexViewerBody.style.overflow = "hidden"; // Prevent scrolling

        const rowHeight = 24;
        const gridHeight = Math.floor(hexViewerBody.clientHeight / rowHeight);
        const firstVisibleRow = Math.floor(hexViewerBody.scrollTop / rowHeight);

        const midRowY = Math.floor(gridHeight / 2);
        const midRowAbsIndex = (firstVisibleRow + midRowY) * this.bytesPerRow;
        const rowElement = this.container
            .querySelector(`.hex-byte[data-index="${midRowAbsIndex}"]`)
            ?.closest(".hex-row");

        if (rowElement) {
            const asciiCol = rowElement.querySelector(".ascii-column");
            if (asciiCol) {
                asciiCol.innerHTML = `<span class="game-scoreboard">Press Arrow Key To Start</span>`;
            }
        }
    }

    _snakeStart(initialDirectionKey) {
        if (this.isSnakeGameActive) return;
        this.isSnakeGameActive = true;

        const hexViewerBody = this.container.querySelector(".hex-viewer-body");
        const asciiHeader = this.container.querySelector(
            ".ascii-column-header",
        );

        hexViewerBody.style.overflow = "hidden";
        if (asciiHeader) {
            asciiHeader.textContent = "SCORE";
        }

        const rowHeight = 24;
        const gridWidth = this.bytesPerRow;
        const gridHeight = Math.floor(hexViewerBody.clientHeight / rowHeight);
        const firstVisibleRow = Math.floor(
            this.originalState.scrollTop / rowHeight,
        );

        if (gridHeight < 5 || gridWidth < 5) {
            this._snakeEnd("Screen too small for snake!", true);
            return;
        }

        let initialDirection;
        switch (initialDirectionKey) {
            case "ArrowUp":
                initialDirection = { x: 0, y: -1 };
                break;
            case "ArrowDown":
                initialDirection = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                initialDirection = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                initialDirection = { x: 1, y: 0 };
                break;
            default:
                initialDirection = { x: 1, y: 0 }; // Default to right if no valid key
        }

        this.snakeGame = {
            grid: { width: gridWidth, height: gridHeight, firstVisibleRow },
            snake: [
                { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
            ],
            direction: initialDirection,
            apple: { x: -1, y: -1 },
            score: 0,
            loopInterval: setInterval(() => this._snakeGameLoop(), 150),
        };

        this._snakePlaceApple();
        this._snakeRender();
    }

    _snakeEnd(message, showMessage = true) {
        if (!this.isSnakeGameActive) return;

        clearInterval(this.snakeGame.loopInterval);
        this.isSnakeGameActive = false;

        const hexViewerBody = this.container.querySelector(".hex-viewer-body");
        const asciiHeader = this.container.querySelector(
            ".ascii-column-header",
        );

        if (showMessage) {
            const gameOverText = `${message} Score: ${this.snakeGame.score}`;
            const midRowY = Math.floor(this.snakeGame.grid.height / 2);
            const midRowAbsIndex =
                (this.snakeGame.grid.firstVisibleRow + midRowY) *
                this.bytesPerRow;
            const rowElement = this.container
                .querySelector(`.hex-byte[data-index="${midRowAbsIndex}"]`)
                ?.closest(".hex-row");

            if (rowElement) {
                const asciiCol = rowElement.querySelector(".ascii-column");
                if (asciiCol) {
                    asciiCol.innerHTML = `<span class="game-scoreboard">${gameOverText}</span>`;
                }
            }
        }

        setTimeout(
            () => {
                hexViewerBody.style.overflow = this.originalState.overflow;
                if (asciiHeader) {
                    asciiHeader.textContent =
                        this.originalState.asciiHeaderText;
                }

                this._renderState = {};
                this.render();
                setTimeout(() => {
                    hexViewerBody.scrollTop = this.originalState.scrollTop;
                }, 0);
            },
            showMessage ? 3000 : 0,
        );
    }

    _snakeHandleInput(e) {
        e.preventDefault();
        const dir = this.snakeGame.direction;
        switch (e.key) {
            case "ArrowUp":
                if (dir.y === 0) this.snakeGame.direction = { x: 0, y: -1 };
                break;
            case "ArrowDown":
                if (dir.y === 0) this.snakeGame.direction = { x: 0, y: 1 };
                break;
            case "ArrowLeft":
                if (dir.x === 0) this.snakeGame.direction = { x: -1, y: 0 };
                break;
            case "ArrowRight":
                if (dir.x === 0) this.snakeGame.direction = { x: 1, y: 0 };
                break;
            default:
                break;
        }
    }

    _snakePlaceApple() {
        const { grid, snake } = this.snakeGame;
        let applePos;
        do {
            applePos = {
                x: Math.floor(Math.random() * grid.width),
                y: Math.floor(Math.random() * grid.height),
            };
        } while (snake.some(p => p.x === applePos.x && p.y === applePos.y));
        this.snakeGame.apple = applePos;
    }

    _snakeGameLoop() {
        const { grid, snake, direction, apple } = this.snakeGame;

        const head = {
            x: snake[0].x + direction.x,
            y: snake[0].y + direction.y,
        };

        if (
            head.x < 0 ||
            head.x >= grid.width ||
            head.y < 0 ||
            head.y >= grid.height
        ) {
            return this._snakeEnd("Game Over: Hit a wall!");
        }

        if (snake.some(p => p.x === head.x && p.y === head.y)) {
            return this._snakeEnd("Game Over: Hit yourself!");
        }

        snake.unshift(head);

        if (head.x === apple.x && head.y === apple.y) {
            this.snakeGame.score++;
            this._snakePlaceApple();
        } else {
            snake.pop();
        }

        this._snakeRender();
    }

    _snakeRender() {
        if (!this.isSnakeGameActive) return;

        const { grid, snake, apple, score } = this.snakeGame;

        const snakeParts = new Set(snake.map(p => `${p.x},${p.y}`));
        const applePos = `${apple.x},${apple.y}`;

        for (let y = 0; y < grid.height; y++) {
            const absRow = grid.firstVisibleRow + y;
            const rowElement = this.container
                .querySelector(
                    `.hex-byte[data-index="${absRow * this.bytesPerRow}"]`,
                )
                ?.closest(".hex-row");
            if (!rowElement) continue;

            for (let x = 0; x < grid.width; x++) {
                const byteIndex = absRow * this.bytesPerRow + x;
                const byteElement = rowElement.querySelector(
                    `.hex-byte[data-index="${byteIndex}"]`,
                );
                if (!byteElement) continue;

                const currentPos = `${x},${y}`;

                byteElement.classList.remove("snake-body", "snake-apple");

                if (currentPos === applePos) {
                    byteElement.classList.add("snake-apple");
                    byteElement.textContent = "FF";
                } else if (snakeParts.has(currentPos)) {
                    byteElement.classList.add("snake-body");
                    byteElement.textContent = "XX";
                } else {
                    const value = this.getMemoryValue(byteIndex);
                    byteElement.textContent = value
                        .toString(16)
                        .toUpperCase()
                        .padStart(2, "0");
                    if (value === 0) byteElement.classList.add("zero");
                    else byteElement.classList.remove("zero");
                }
            }

            const asciiCol = rowElement.querySelector(".ascii-column");
            if (asciiCol) {
                if (y === 0) {
                    asciiCol.innerHTML = `<span class="game-scoreboard">${score}</span>`;
                } else {
                    asciiCol.innerHTML = "";
                }
            }
        }
    }
}
