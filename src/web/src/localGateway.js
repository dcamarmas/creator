/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Alejandro Calderon Mateos,
 *                      Diego Camarmas Alonso, Elisa Utrilla Arroyo
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

/* Local device web service functions */

export const LOCALLAB = {
    /**
     *
     * @param {String} flash_url
     * @param {Object} flash_args
     * @returns
     */
    async gateway_flash(flash_url, flash_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(flash_args),
        };

        try {
            const res = await fetch(flash_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                return "Gateway not available at the moment. Please, execute 'python3 gateway.py' and connect your board first\n";
            }

            return err.toString() + "\n";
        }
    },

    /**
     *
     * @param {String} flash_url
     * @param {Object} flash_args
     * @returns
     */
    async gateway_monitor(flash_url, flash_args) {
        const fetch_args = {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(flash_args),
        };

        try {
            const res = await fetch(flash_url, fetch_args);
            const jres = await res.json();

            return jres.status;
        } catch (err) {
            if (err.toString() === "TypeError: Failed to fetch") {
                return "Gateway not available at the moment. Please, execute 'python3 gateway.py' and connect your board first\n";
            }

            return err.toString() + "\n";
        }
    },
};
