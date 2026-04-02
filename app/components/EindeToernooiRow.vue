<template>
  <div class="einde-row">
    <div class="einde-row__time">
      <span>19:00</span>
    </div>
    <div class="einde-row__center">
      <span class="einde-row__icon" aria-hidden="true">
        <svg class="einde-row__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Trofee beker -->
            <path d="M8 2h8v6a4 4 0 0 1-8 0V2z" />
            <!-- Handgrepen -->
            <path d="M8 4H6a2 2 0 0 0 0 4h2M16 4h2a2 2 0 0 1 0 4h-2" />
            <!-- Steel + voet -->
            <line x1="12" y1="12" x2="12" y2="16" />
            <path d="M8 16h8" />
            <path d="M7 22h10M9 16v6M15 16v6" />
          </g>
        </svg>
      </span>
      <span class="einde-row__label">Einde toernooi</span>
    </div>
  </div>
</template>

<style scoped>
.einde-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 14px 16px;
  font-size: 14px;
  background: linear-gradient(90deg, #f3f8f4 0%, #edf5ef 50%, #f3f8f4 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  border-radius: 0 0 14px 14px;
}

.einde-row__time {
  position: absolute;
  left: 16px;
  color: var(--color-forest);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.einde-row__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.einde-row__icon {
  display: flex;
  color: var(--color-forest);
  flex-shrink: 0;
}

.einde-row__svg {
  display: block;
  width: 22px;
  height: 22px;
}

.einde-row__label {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--color-forest-dark);
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .einde-row {
    padding: 12px 10px;
    font-size: 13px;
  }

  .einde-row__time {
    left: 10px;
  }

  .einde-row__svg {
    width: 20px;
    height: 20px;
  }

  .einde-row__label {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .einde-row {
    padding: 10px 8px;
  }

  .einde-row__time {
    left: 8px;
    font-size: 11px;
  }
}
</style>
