<template>
  <header class="site-header">
    <div class="site-header__hero">
      <div class="site-header__hero-overlay" />
      <div class="site-header__hero-inner">
        <div class="site-header__title-block">
          <h1 class="site-header__title">Tornooi Sporting Oppem</h1>
          <p class="site-header__date">Zaterdag 23 mei 2026</p>
        </div>
        <div class="site-header__social" aria-label="Social media">
          <a href="https://www.facebook.com/profile.php?id=100085603155173&locale=nl_BE" class="social-icon" target="_blank" rel="noopener noreferrer" title="Sporting Oppem op Facebook" aria-label="Facebook — Sporting Oppem">
            <svg class="social-icon__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
              />
            </svg>
          </a>
          <a href="https://www.instagram.com/sporting_oppem/" class="social-icon" target="_blank" rel="noopener noreferrer" title="Sporting Oppem op Instagram" aria-label="Instagram — Sporting Oppem">
            <svg class="social-icon__svg social-icon__svg--ig" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
    <nav class="site-header__nav" aria-label="Hoofdnavigatie">
      <div class="site-header__nav-inner">
        <div v-if="showScheduleTabs && publicTab !== undefined" class="site-header__schedule-tabs" role="tablist" aria-label="Speelschema onderdelen">
          <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'group1' }" :aria-selected="publicTab === 'group1'" @click="publicTab = 'group1'">Groep 1</button>
          <button v-if="hasSecondPoule" type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'group2' }" :aria-selected="publicTab === 'group2'" @click="publicTab = 'group2'">Groep 2</button>
          <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'knockout' }" :aria-selected="publicTab === 'knockout'" @click="publicTab = 'knockout'">Knockout</button>
          <div class="site-header__schedule-tab-fullrow" role="none">
            <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'drinks' }" :aria-selected="publicTab === 'drinks'" @click="publicTab = 'drinks'">Zuipbeker</button>
          </div>
        </div>
        <div class="site-header__nav-spacer site-header__nav-spacer--desktop" />
        <NuxtLink to="/admin" class="site-header__tab site-header__admin-link">Beheer</NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Toon tab Groep 2 (tweede poule in schema). */
    hasSecondPoule?: boolean;
    /** Bij false geen poule-tabs (bijv. tijdens laden). */
    showScheduleTabs?: boolean;
  }>(),
  { hasSecondPoule: false, showScheduleTabs: true },
);

/** Alleen binden op de speelschema-pagina; ontbreekt de binding, dan geen tabs. */
const publicTab = defineModel<'group1' | 'group2' | 'knockout' | 'drinks'>('publicTab', { required: false });
</script>

<style scoped>
.site-header {
  position: relative;
}

.site-header__hero {
  position: relative;
  min-height: clamp(140px, 22vw, 220px);
  background-color: var(--color-forest-dark);
  background-image: linear-gradient(105deg, rgba(15, 51, 31, 0.92) 0%, rgba(26, 77, 46, 0.75) 45%, rgba(15, 51, 31, 0.88) 100%), url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center 35%;
}

.site-header__hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(15, 51, 31, 0.4) 100%);
  pointer-events: none;
}

.site-header__hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 20px;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: clamp(24px, 5vw, 48px) var(--layout-pad) 20px;
}

.site-header__title-block {
  flex: 1 1 auto;
  min-width: min(100%, 200px);
}

.site-header__title {
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 4vw, 2.35rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
}

.site-header__date {
  margin: 0.35rem 0 0;
  font-family: var(--font-body);
  font-size: clamp(0.8125rem, 2vw, 0.9375rem);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.01em;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
}

.site-header__social {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.site-header__nav {
  background: var(--color-forest);
  border-bottom: 3px solid var(--color-forest-dark);
}

.site-header__nav-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: 10px var(--layout-pad);
}

.site-header__schedule-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Neemt op desktop geen extra ruimte; op mobiel volle breedte + gecentreerde tab */
.site-header__schedule-tab-fullrow {
  display: contents;
}

/* Zelfde als .admin-tab / .admin-tab--active (admin/index.vue) */
.site-header__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #e5e7eb;
  color: #4b5563;
  text-decoration: none;
  appearance: none;
  -webkit-appearance: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.site-header__tab:hover {
  background: #d1d5db;
  color: #4b5563;
}

.site-header__tab--active {
  background: var(--color-yellow);
  color: var(--color-forest-dark);
}

.site-header__tab--active:hover {
  background: var(--color-yellow-bright);
  color: var(--color-forest-dark);
}

a.site-header__tab {
  color: #4b5563;
}

a.site-header__tab:hover {
  color: #4b5563;
}

.site-header__nav-spacer {
  flex: 1;
  min-width: 8px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  text-decoration: none;
  transition: background 0.15s ease;
}

.social-icon:hover {
  background: rgba(255, 255, 255, 0.22);
}

.social-icon__svg {
  display: block;
  width: 17px;
  height: 17px;
}

.social-icon__svg--ig {
  width: 18px;
  height: 18px;
}

@media (max-width: 640px) {
  .site-header__hero-inner {
    padding-bottom: 16px;
  }

  .site-header__nav-inner {
    justify-content: center;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .site-header__schedule-tabs {
    justify-content: center;
    width: 100%;
  }

  .site-header__schedule-tab-fullrow {
    display: flex;
    flex: 1 0 100%;
    justify-content: center;
    width: 100%;
  }

  .site-header__nav-spacer--desktop,
  .site-header__admin-link {
    display: none !important;
  }
}
</style>
