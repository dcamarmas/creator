/**
 *  Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
 *                      Alejandro Calderon Mateos, Luis Daniel Casais Mezquida
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

import { Ajv } from "ajv";

// this HAS to use `with` or else Deno screams, and `with` is only supported on `TypeScript`, so...
import schema from "../../../architecture/architecture.schema.json" with { type: "json" };

export function validateArchSchema(architectureObj: object): boolean {
    // we need to do this, else the validator screams
    delete (schema as unknown as { $schema?: string }).$schema;

    const validator = new Ajv().compile(schema);
    return validator(architectureObj);
}
