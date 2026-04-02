<template>
  <div class="middagpauze-row">
    <div class="middagpauze-row__time">
      <span class="middagpauze-row__time-start">12:20</span>
      <span class="middagpauze-row__time-sep" aria-hidden="true">-</span>
      <span class="middagpauze-row__time-end">13:00</span>
    </div>
    <div class="middagpauze-row__center">
      <span class="middagpauze-row__label">Middagpauze</span>
    </div>
  </div>
</template>

<style scoped>
.middagpauze-row {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  align-items: center;
  min-width: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ebe6;
  font-size: 14px;
  gap: 10px 12px;
  background: linear-gradient(90deg, #fdfaf3 0%, #faf6eb 50%, #fdfaf3 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.middagpauze-row:last-child {
  border-bottom: none;
}

.middagpauze-row__time {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0;
  color: #7a6a4a;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.middagpauze-row__time-sep {
  margin-left: 4px;
  margin-right: 3px;
}

.middagpauze-row__center {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.middagpauze-row__label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-forest-dark);
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .middagpauze-row {
    grid-template-columns: 3.35rem 1fr;
    padding: 10px 10px;
    font-size: 13px;
    gap: 6px 8px;
  }

  .middagpauze-row__time {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    line-height: 1.2;
  }

  .middagpauze-row__time-sep {
    display: none;
  }

  .middagpauze-row__label {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .middagpauze-row {
    grid-template-columns: 3rem 1fr;
    padding: 8px 8px;
    gap: 4px 6px;
  }

  .middagpauze-row__time {
    font-size: 11px;
  }
}
</style>
