<template>
  <div class="app-wrapper">
    <div class="app-wrapper__main">
      <NuxtPage />
    </div>
    <SiteFooter />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-forest: #1a4d2e;
  --color-forest-dark: #0f331f;
  --color-forest-mid: #245c3a;
  --color-yellow: #e8c830;
  --color-yellow-bright: #f5d547;
  --color-card: #ffffff;
  --color-page-bg: #eef2ec;
  --color-score-match: #e8c830;
  --color-score-pen: #2f6fad;
  --font-display: 'Barlow Condensed', system-ui, sans-serif;
  --font-body: 'Barlow', system-ui, sans-serif;
  --layout-max: 1200px;
  --layout-pad: clamp(16px, 4vw, 28px);
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  font-family: var(--font-body);
  background: var(--color-page-bg);
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
}

#__nuxt {
  width: 100%;
  min-height: 100vh;
}
</style>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  width: 100%;
}

.app-wrapper__main {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
