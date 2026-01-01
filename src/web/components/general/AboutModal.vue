<!--
Copyright 2018-2026 CREATOR Team.

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
import { ref, onMounted } from "vue";
import yaml from "js-yaml";
import CardAuthor from "./CardAuthor.vue";

interface Props {
  id: string;
  dark: boolean;
}

defineProps<Props>();

const contactMail = "creator.arcos.inf.uc3m.es@gmail.com";
const projectVersion = "6.0";
const projectLicense = "LGPL-2.1";
const repositoryUrl = "https://github.com/creatorsim/creator";

const authors = ref<Record<string, any>>({});
const contributors = ref<any[]>([]);

onMounted(async () => {
  try {
    const [authorsResponse, contributorsResponse] = await Promise.all([
      fetch("https://creatorsim.github.io/web-beta/content/authors.yml"),
      fetch("https://creatorsim.github.io/web-beta/content/contributors.yml"),
    ]);

    const authorsYaml = await authorsResponse.text();
    const contributorsYaml = await contributorsResponse.text();

    authors.value = yaml.load(authorsYaml) as Record<string, any>;
    contributors.value = yaml.load(contributorsYaml) as any[];
  } catch (error) {
    console.error("Error loading authors or contributors:", error);
    authors.value = {};
    contributors.value = [];
  }
});
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
          Authors
        </h5>
        <p class="text-center text-muted small mb-0">
          Meet the team behind CREATOR
        </p>
      </div>
      <b-row class="g-3">
        <b-col
          v-for="[id, author] in Object.entries(authors)"
          :key="id"
          cols="12"
          sm="6"
          lg="4"
          class="d-flex"
        >
          <b-card
            class="author-card w-100 text-center shadow-sm hover-card"
            :class="{ 'dark-card': dark }"
          >
            <b-img
              :src="`img/authors/${id}.webp`"
              :alt="author.name"
              class="author-avatar mx-auto mb-3"
            />
            <h6 class="mb-1 fw-semibold">{{ author.name }}</h6>
            <p class="text-muted small mb-2">{{ author.affiliation }}</p>
            <div class="d-flex justify-content-center gap-3">
              <b-link
                v-if="author.links?.github"
                :href="`https://github.com/${author.links.github}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'github']" />
              </b-link>
              <b-link
                v-if="author.links?.researchgate"
                :href="`https://www.researchgate.net/profile/${author.links.researchgate}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'researchgate']" />
              </b-link>
              <b-link
                v-if="author.links?.linkedin"
                :href="`https://www.linkedin.com/in/${author.links.linkedin}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'linkedin']" />
              </b-link>
              <b-link
                v-if="author.links?.website"
                :href="author.links.website"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fas', 'globe']" />
              </b-link>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </section>

    <hr class="my-4" />

    <!-- Contributors Section -->

    <section class="contributors-section mb-4">
      <div class="section-header mb-3">
        <h5 class="text-center mb-1">
          <font-awesome-icon :icon="['fas', 'code']" class="me-2" />
          Contributors
        </h5>
        <p class="text-center text-muted small mb-0">
          Additional contributors to the CREATOR project
        </p>
      </div>
      <b-row class="g-3">
        <b-col
          v-for="contributor in contributors"
          :key="contributor.name"
          cols="12"
          sm="6"
          lg="4"
          class="d-flex"
        >
          <b-card
            class="contributor-card w-100 text-center shadow-sm hover-card"
            :class="{ 'dark-card': dark }"
          >
            <div class="contributor-icon mb-3">🧑‍💻</div>
            <h6 class="mb-2 fw-semibold">{{ contributor.name }}</h6>
            <div v-if="contributor.versions" class="mb-2">
              <b-badge
                v-for="version in contributor.versions"
                :key="version"
                variant="primary"
                pill
                class="me-1 mb-1"
              >
                <font-awesome-icon :icon="['fas', 'tag']" class="me-1" />
                {{ version }}
              </b-badge>
            </div>
            <p class="text-muted small mb-3">{{ contributor.description }}</p>
            <div class="d-flex justify-content-center gap-3">
              <b-link
                v-if="contributor.links?.github"
                :href="`https://github.com/${contributor.links.github}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'github']" />
              </b-link>
              <b-link
                v-if="contributor.links?.researchgate"
                :href="`https://www.researchgate.net/profile/${contributor.links.researchgate}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'researchgate']" />
              </b-link>
              <b-link
                v-if="contributor.links?.linkedin"
                :href="`https://www.linkedin.com/in/${contributor.links.linkedin}`"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fab', 'linkedin']" />
              </b-link>
              <b-link
                v-if="contributor.links?.website"
                :href="contributor.links.website"
                target="_blank"
                class="social-link"
              >
                <font-awesome-icon :icon="['fas', 'globe']" />
              </b-link>
            </div>
          </b-card>
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
                src="@/web/assets/img/arcos.png"
                alt="ARCOS Research Group"
                fluid
                class="affiliation-logo"
                style="max-height: 80px"
              />
            </b-link>
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
          </b-col>
        </b-row>
      </b-card>
    </section>

    <!-- Footer -->

    <div class="modal-footer-info mt-4 pt-3 border-top text-center">
      <p class="text-muted small mb-0">
        &copy; 2018-2026 CREATOR Development Team. Licensed under
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

// Cards - Author and Contributor cards
.author-card,
.contributor-card {
  border: 1px solid var(--bs-border-color);
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.2s ease;
}

.hover-card:hover {
  border-color: var(--bs-primary);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

// Author avatar
.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.author-card:hover .author-avatar {
  transform: scale(1.1);
}

// Contributor icon
.contributor-icon {
  font-size: 2.5rem;
  transition: transform 0.3s ease;
}

.contributor-card:hover .contributor-icon {
  transform: scale(1.1);
}

// Social links
.social-link {
  color: var(--bs-secondary);
  transition: color 0.2s ease;
  font-size: 1.1rem;

  &:hover {
    color: var(--bs-primary);
  }
}

// Affiliations
.affiliation-logo {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

// Dark mode adjustments
[data-bs-theme="dark"] {
  .dark-white-img {
    filter: brightness(0) invert(1);
  }

  .dark-card {
    background-color: var(--bs-dark);
    border-color: var(--bs-gray-700);
  }

  .hover-card:hover {
    border-color: var(--bs-info);
  }

  .project-header h3 {
    color: var(--bs-info);
  }

  .social-link {
    color: var(--bs-gray-400);

    &:hover {
      color: var(--bs-info);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .d-flex.gap-3 {
    gap: 0.5rem !important;
  }

  .affiliation-logo {
    max-height: 60px !important;
  }

  .author-avatar {
    width: 60px;
    height: 60px;
  }

  .contributor-icon {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .modal-xl {
    max-width: 100%;
  }
}
</style>
