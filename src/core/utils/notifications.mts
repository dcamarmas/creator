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

/**
 * Notifications utility module - provides environment-agnostic notification functions
 * for both CLI and web environments.
 */

import { console_log as clog } from "./creator_logger.mjs";

export type NotificationType = "success" | "warning" | "info" | "danger";

export interface Notification {
    mess: string;
    color: NotificationType;
    time: string;
    date: string;
}

// Notification history
export const notifications: Notification[] = [];

/**
 * Shows a notification. In web mode, displays a toast notification.
 * In CLI mode, this is a no-op (CLI should handle its own output).
 *
 * @param msg Notification message.
 * @param type Type of notification: 'success', 'warning', 'info', or 'danger'.
 * @param root Root Vue component (App) - only used in web mode
 * @returns true if notification was shown, false otherwise
 */
export function show_notification(
    msg: string,
    type: NotificationType,
    root?: unknown,
): boolean {
    // Web environment
    if (typeof document !== "undefined" && (document as any).app) {
        const app = root || (document as any).app;
        app.createToast({
            props: {
                title: " ",
                body: msg,
                variant: type,
                position: "bottom-end",
                value: app.notification_time,
            },
        });

        // Add notification to the notification summary
        const date = new Date();
        notifications.push({
            mess: msg,
            color: type,
            time: date.toLocaleTimeString("es-ES"),
            date: date.toLocaleDateString("es-ES"),
        });

        return true;
    }

    // CLI/Deno environment - don't show notification, just log
    // This prevents interrupting CLI output flow
    return false;
}

/**
 * Cross-environment notification function. Shows a notification in web mode,
 * logs to console in CLI mode.
 *
 * @param msg Notification message.
 * @param level Notification level: 'success', 'warning', 'info', or 'danger'.
 */
export function crex_show_notification(
    msg: string,
    level: NotificationType,
): void {
    if (typeof window !== "undefined") {
        show_notification(msg, level);
    } else {
        clog(level.toUpperCase() + ": " + msg, "INFO");
    }
}
