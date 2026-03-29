<template>
  <header class="site-header">
    <div class="site-header__hero">
      <div class="site-header__hero-overlay" />
      <div class="site-header__hero-inner">
        <h1 class="site-header__title">Toernooi Sporting Oppem</h1>
      </div>
    </div>
    <nav class="site-header__nav" aria-label="Hoofdnavigatie">
      <div class="site-header__nav-inner">
        <div v-if="showScheduleTabs && publicTab !== undefined" class="site-header__schedule-tabs" role="tablist" aria-label="Speelschema onderdelen">
          <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'group1' }" :aria-selected="publicTab === 'group1'" @click="publicTab = 'group1'">Groep 1</button>
          <button v-if="hasSecondPoule" type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'group2' }" :aria-selected="publicTab === 'group2'" @click="publicTab = 'group2'">Groep 2</button>
          <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'knockout' }" :aria-selected="publicTab === 'knockout'" @click="publicTab = 'knockout'">Knockout</button>
          <button type="button" role="tab" class="site-header__tab" :class="{ 'site-header__tab--active': publicTab === 'drinks' }" :aria-selected="publicTab === 'drinks'" @click="publicTab = 'drinks'">Zuipbeker</button>
        </div>
        <div class="site-header__nav-spacer" />
        <div class="site-header__social" aria-hidden="true">
          <a href="#" class="social-icon" @click.prevent title="Facebook">f</a>
          <a href="#" class="social-icon social-icon--ig" @click.prevent title="Instagram">◎</a>
        </div>
        <NuxtLink to="/admin" class="site-header__tab">Beheer</NuxtLink>
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
  max-width: var(--layout-max);
  margin: 0 auto;
  padding: clamp(24px, 5vw, 48px) var(--layout-pad) 20px;
}

.site-header__title {
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 4vw, 2.35rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
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

.site-header__social {
  display: flex;
  align-items: center;
  gap: 8px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s ease;
}

.social-icon:hover {
  background: rgba(255, 255, 255, 0.22);
}

.social-icon--ig {
  font-size: 12px;
}
</style>
