<!--
Copyright 2018-2025 Felix Garcia Carballeira, Diego Camarmas Alonso,
                    Alejandro Calderon Mateos, Luis Daniel Casais Mezquida

This file is part of CREATOR.

CREATOR is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CREATOR is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with CREATOR.  If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div>
    <div id="spinnerBack" class="spinnerBack" ref="spinnerBack" />

    <div id="spinner" class="spinner">
      <div class="spinnerBox">
        <b-spinner variant="primary" class="spinnerIcon"></b-spinner>
      </div>

      <div>
        <span class="text-primary">
          <strong>Loading...</strong>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.spinnerBack {
  background: black;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 40;
}

.spinner {
  display: block;
  position: fixed;
  z-index: 41;
  top: 46%;
  right: 46%;
  background: white;
  border: 1px solid #a9a9a9;
  border-radius: 9px;
  -moz-border-radius: 9px;
  -webkit-border-radius: 9px;
  padding: 10px;
  opacity: 1;
  text-align: center;
}

.spinnerBox {
  display: inline-block;
  opacity: 1;
}

.spinnerIcon {
  width: 3rem;
  height: 3rem;
}
</style>
