<template>
  <h2 class="group-title">
    <span class="group-title__icon" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <line x1="12" y1="5" x2="12" y2="19" />
        <circle cx="12" cy="12" r="2.25" />
        <line x1="3" y1="9" x2="7" y2="9" />
        <line x1="17" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="7" y2="15" />
        <line x1="17" y1="15" x2="21" y2="15" />
      </svg>
    </span>
    <span class="group-title__text">{{ title }}</span>
  </h2>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
    default: '',
  },
});
</script>

<style scoped>
.group-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin: 0;
  padding: 14px 18px;
  background: linear-gradient(180deg, var(--color-forest-mid) 0%, var(--color-forest) 100%);
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.group-title__icon {
  display: flex;
  color: var(--color-yellow);
  flex-shrink: 0;
}

.group-title__icon svg {
  width: 26px;
  height: 26px;
}

.group-title__text {
  line-height: 1.2;
}
</style>
