/**
 * Copyright 2018-2026 CREATOR Team.
 *
 * This file is part of CREATOR.
 *
 * CREATOR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CREATOR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ref } from "vue";
import type { BvTriggerableEvent } from "bootstrap-vue-next";
import { loadCustomArchitecture, show_notification } from "@/web/utils.mjs";

export interface AvailableArch {
    name: string;
    alias: string[];
    file?: string;
    img?: string;
    alt?: string;
    id: string;
    examples: string[];
    description: string;
    guide?: string;
    available: boolean;
    default?: boolean;
    definition?: string;
}

/**
 * Composable for handling custom architecture upload functionality
 */
export function useArchitectureUpload(
    emitCallback: (archName: string) => void,
) {
    const showLoadModal = ref(false);
    const customArchName = ref("");
    const customArchDescription = ref("");
    const customArchFile = ref<File | null>(null);

    const openLoadArchModal = () => {
        showLoadModal.value = true;
    };

    const resetForm = () => {
        customArchName.value = "";
        customArchDescription.value = "";
        customArchFile.value = null;
    };

    const loadCustomArch = (event: BvTriggerableEvent) => {
        event.preventDefault();

        if (!customArchFile.value || !customArchName.value) {
            show_notification(
                "Please provide both a name and a file",
                "danger",
            );
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const archDefinition = reader.result as string;

            const newArchitecture: AvailableArch = {
                name: customArchName.value,
                alias: [],
                id: `select_conf${customArchName.value}`,
                examples: [],
                description: customArchDescription.value,
                definition: archDefinition,
                available: true,
                default: false,
            };

            // Add to localStorage
            const customArchs = JSON.parse(
                localStorage.getItem("customArchitectures") || "[]",
            );
            customArchs.unshift(newArchitecture);
            localStorage.setItem(
                "customArchitectures",
                JSON.stringify(customArchs),
            );

            // Load architecture
            loadCustomArchitecture(newArchitecture);

            // Notify parent component
            emitCallback(customArchName.value);

            // Close modal and clean form
            showLoadModal.value = false;
            resetForm();
        };

        reader.onerror = () => {
            show_notification("Error loading file", "danger");
        };

        reader.readAsText(customArchFile.value);
    };

    return {
        showLoadModal,
        customArchName,
        customArchDescription,
        customArchFile,
        openLoadArchModal,
        loadCustomArch,
        resetForm,
    };
}
