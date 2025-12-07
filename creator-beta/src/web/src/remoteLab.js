/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso
 *
 *  This file is part of CREATOR.
 *
 *  CREATOR is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CREATOR is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

export const REMOTELAB = {
    async get_boards(lab_url) {
        const fetch_args = {
            method: "GET",
        };

        try {
            const res = await fetch(lab_url, fetch_args);

            return await res.text();
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                show_notification(
                    "Remote device not available at the moment. Please, try again later.",
                    "danger",
                );
                return "-1";
            }

            return err.toString() + "\n";
        }
    },

    async enqueue(lab_url, enqueue_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(enqueue_args),
        };

        try {
            const res = await fetch(lab_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                show_notification(
                    "Remote device not available at the moment. Please, try again later.",
                    "danger",
                );
                return "-1";
            }

            return err.toString() + "\n";
        }
    },

    async cancel(lab_url, cancel_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(cancel_args),
        };

        try {
            const res = await fetch(lab_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                show_notification(
                    "Remote device not available at the moment. Please, try again later.",
                    "danger",
                );
                return "-1";
            }

            return err.toString() + "\n";
        }
    },

    async position(lab_url, position_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(position_args),
        };

        try {
            const res = await fetch(lab_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                show_notification(
                    "Remote device not available at the moment. Please, try again later.",
                    "danger",
                );
                return "-1";
            }

            return err.toString() + "\n";
        }
    },

    async status(lab_url, status_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(status_args),
        };

        try {
            const res = await fetch(lab_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                show_notification(
                    "Remote device not available at the moment. Please, try again later.",
                    "danger",
                );
                return "-2";
            }

            return err.toString() + "\n";
        }
    },
};
