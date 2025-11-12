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

<script setup lang="ts">
import authors from "@/web/assets/authors.json"
import CardAuthor from "./CardAuthor.vue"

interface Props {
  id: string
  dark: boolean
}

defineProps<Props>()

const contactMail = "creator.arcos.inf.uc3m.es@gmail.com"
const projectVersion = "6.0"
const projectLicense = "LGPL-2.1"
const repositoryUrl = "https://github.com/creatorsim/creator"
</script>

<template>
  <b-modal :id="id" title="About CREATOR" size="xl" scrollable hide-footer>
    <!-- Project Header Section -->
    <section class="project-header mb-4">
      <div class="text-center mb-3">
        <h3 class="mb-2">CREATOR</h3>
        <p class="text-muted mb-2">
          didaCtic and geneRic assEmbly educATional simulatOR
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <b-badge variant="primary" pill>
            <font-awesome-icon :icon="['fas', 'code-branch']" class="me-1" />
            Version {{ projectVersion }}
          </b-badge>
          <b-badge variant="info" pill>
            <font-awesome-icon :icon="['fas', 'scale-balanced']" class="me-1" />
            {{ projectLicense }}
          </b-badge>
          <b-link
            :href="repositoryUrl"
            target="_blank"
            class="text-decoration-none"
          >
            <b-badge variant="dark" pill>
              <font-awesome-icon :icon="['fab', 'github']" class="me-1" />
              GitHub
            </b-badge>
          </b-link>
        </div>
      </div>


    </section>

    <hr class="my-4" />

    <!-- Team Section -->
    <section class="team-section mb-4">
      <div class="section-header mb-3">
        <h5 class="text-center mb-1">
          <font-awesome-icon :icon="['fas', 'users']" class="me-2" />
          Development Team
        </h5>
      </div>

      <b-row class="g-3">
        <b-col
          v-for="author in authors"
          :key="author.id"
          cols="12"
          sm="6"
          lg="3"
          class="d-flex author-col"
        >
          <!-- Mobile: horizontal layout -->
          <CardAuthor
            :img-src="`img/authors/${author.id}.webp`"
            :img-alt="`author_${author.id}`"
            :full-name="author.name"
            :linkedin="author.linkedin"
            :rgate="author.rgate"
            :github="author.github"
            :dark="dark"
            :horizontal="true"
            class="w-100 d-sm-none"
          />
          <!-- Tablet/Desktop: vertical layout -->
          <CardAuthor
            :img-src="`img/authors/${author.id}.webp`"
            :img-alt="`author_${author.id}`"
            :full-name="author.name"
            :linkedin="author.linkedin"
            :rgate="author.rgate"
            :github="author.github"
            :dark="dark"
            :horizontal="false"
            class="w-100 d-none d-sm-block"
          />
        </b-col>
      </b-row>
    </section>

    <hr class="my-4" />

    <!-- Contact Section -->
    <section class="contact-section mb-4">
      <div class="section-header mb-3">
        <h5 class="text-center mb-1">
          <font-awesome-icon :icon="['fas', 'envelope']" class="me-2" />
          Contact Us
        </h5>
      </div>

      <b-card class="shadow-sm">
        <div class="text-center">
          <b-link
            :href="`mailto:${contactMail}`"
            class="d-inline-flex align-items-center gap-2 text-decoration-none fs-5"
          >
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            {{ contactMail }}
          </b-link>
        </div>
      </b-card>
    </section>

    <hr class="my-4" />

    <!-- Affiliations Section -->
    <section class="affiliations-section">
      <div class="section-header mb-3">
        <h5 class="text-center mb-1">
          <font-awesome-icon :icon="['fas', 'building-columns']" class="me-2" />
          Affiliations
        </h5>
        <p class="text-center text-muted small mb-3">
          Developed at Universidad Carlos III de Madrid
        </p>
      </div>

      <b-card class="shadow-sm">
        <b-row align-v="center" align-h="center" class="g-4">
          <b-col cols="12" md="5" class="text-center">
            <b-link
              href="https://www.arcos.inf.uc3m.es/"
              target="_blank"
              class="d-block"
            >
              <b-img
                src="@/web/assets/img/arcos.svg"
                alt="ARCOS Research Group"
                fluid
                class="affiliation-logo"
                style="max-height: 80px"
              />
            </b-link>
            <p class="text-muted small mt-2 mb-0">ARCOS Research Group</p>
          </b-col>

          <b-col cols="12" md="7" class="text-center">
            <b-link
              href="https://www.inf.uc3m.es/"
              target="_blank"
              class="d-block"
            >
              <b-img
                src="@/web/assets/img/dptoinf.webp"
                alt="Computer Science and Engineering Department - UC3M"
                fluid
                class="affiliation-logo dark-white-img"
                style="max-height: 80px"
              />
            </b-link>
            <p class="text-muted small mt-2 mb-0">
              Computer Science & Engineering Department
            </p>
          </b-col>
        </b-row>
      </b-card>
    </section>

    <!-- Footer -->
    <div class="modal-footer-info mt-4 pt-3 border-top text-center">
      <p class="text-muted small mb-0">
        &copy; 2018-2025 CREATOR Development Team. Licensed under
        {{ projectLicense }}.
      </p>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
// Section styling
.section-header {
  h5 {
    font-weight: 600;
    color: var(--bs-body-color);
  }
}

// Project header
.project-header {
  h3 {
    font-weight: 700;
    color: var(--bs-primary);
  }
}

// Badges
.badge {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  transition: transform 0.2s ease;
}

// Cards
.card {
  border: 1px solid var(--bs-border-color);
}

// Affiliations
.affiliation-logo {
  transition: transform 0.3s ease, opacity 0.3s ease;

}

// Dark mode adjustments
[data-bs-theme="dark"] {
  .dark-white-img {
    filter: brightness(0) invert(1);
  }

  .card {
    background-color: var(--bs-dark);
    border-color: var(--bs-gray-700);
  }

  .project-header h3 {
    color: var(--bs-info);
  }
}

// Team section
.author-col {
  min-height: fit-content;
}

// Responsive adjustments
@media (max-width: 768px) {
  .d-flex.gap-3 {
    gap: 0.5rem !important;
  }

  .affiliation-logo {
    max-height: 60px !important;
  }

  // Adjust team section for horizontal cards
  .team-section {
    .author-col {
      margin-bottom: 0.5rem;
    }
  }
}

@media (max-width: 576px) {
  // Ensure horizontal cards display properly on small screens
  .modal-xl {
    max-width: 100%;
  }
}
</style>
