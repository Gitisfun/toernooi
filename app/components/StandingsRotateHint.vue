<template>
  <div class="standings-rotate-hint" role="note">
    <div class="standings-rotate-hint__icon-wrap" aria-hidden="true">
      <img class="standings-rotate-hint__img" src="/icons/rotate-device.png" alt="" width="48" height="48" decoding="async" />
    </div>
    <p class="standings-rotate-hint__text">Draai je toestel om de volledige tabel te zien, met alle kolommen.</p>
  </div>
</template>

<style scoped>
.standings-rotate-hint {
  display: none;
  align-items: center;
  gap: 12px;
  margin: 16px 0 0;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(145deg, #f8faf8 0%, #f0f4f1 100%);
  border: 1px solid rgba(26, 77, 46, 0.12);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 4px 14px rgba(15, 51, 31, 0.06);
}

.standings-rotate-hint__icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: #fff;
  border: 1px solid rgba(26, 77, 46, 0.1);
  box-shadow: 0 2px 8px rgba(15, 51, 31, 0.07);
}

.standings-rotate-hint__img {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.standings-rotate-hint__text {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #3d4f44;
}

@media (max-width: 640px) {
  .standings-rotate-hint {
    display: flex;
  }
}
</style>
