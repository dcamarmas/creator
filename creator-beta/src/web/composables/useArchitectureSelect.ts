/**
 * Copyright 2018-2025 CREATOR Team.
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
import {
    loadDefaultArchitecture,
    loadCustomArchitecture,
} from "@/web/utils.mjs";
import { initCAPI } from "@/core/capi/initCAPI.mts";
import { architecture } from "@/core/core";
import type { AvailableArch } from "./useArchitectureUpload";

/**
 * Composable for handling architecture selection and deletion
 */
export function useArchitectureSelect(
    emitSelect: (archName: string) => void,
    emitDelete?: (archName: string) => void,
) {
    const selectedArch = ref<string | null>(null);
    const archToDelete = ref<string | null>(null);
    const showDeleteModal = ref(false);

    const handleSelectArchitecture = async (arch: AvailableArch) => {
        selectedArch.value = arch.name;

        if (arch.default) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await loadDefaultArchitecture(arch as any);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            loadCustomArchitecture(arch as any);
        }

        const pluginName = architecture.config.plugin;
        initCAPI(pluginName);

        emitSelect(arch.name);
    };

    const handleDeleteArchitecture = (arch_name: string) => {
        archToDelete.value = arch_name;
        showDeleteModal.value = true;
    };

    const handleArchitectureDeleted = (arch_name: string) => {
        if (emitDelete) {
            emitDelete(arch_name);
        }
    };

    return {
        selectedArch,
        archToDelete,
        showDeleteModal,
        handleSelectArchitecture,
        handleDeleteArchitecture,
        handleArchitectureDeleted,
    };
}
