<script lang="ts" setup></script>

<template>
  <header class="header">
    <h1 class="app-name" data-testid="app-name">CollabPlan</h1>
    <p class="tagline">Your Collaborative Planning Hub</p>
  </header>
  <main class="content">
    <div class="buttons">
      <RouterLink to="/login" class="btn">Login</RouterLink>
      <RouterLink to="/signup" class="btn">Registration</RouterLink>
    </div>
  </main>
</template>
<style scoped>
.header {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 50vh;
}

.app-name {
  font-size: var(--mobile-hero);
  line-height: 10px;
  color: var(--text-green);
}

.buttons {
  height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 2vh;
}

@media (min-width: 768px) and (max-width: 1024px) {
  .header {
    height: 40vh; /* Adjust header height for tablets */
  }

  .app-name {
    font-size: var(--tablet-hero); /* Use tablet-specific hero size */
  }

  .tagline {
    font-size: var(--tablet-text); /* Use tablet-specific text size */
  }

  .buttons {
    height: 50vh; /* Adjust button container height for tablets */
    gap: 3vh; /* Increase gap between buttons */
  }

  .btn {
    font-size: var(--tablet-text); /* Use tablet-specific button text size */
    padding: 14px 28px; /* Add more padding for larger buttons */
  }
}

@media (min-width: 1024px) {
  .header {
    height: 35vh; /* Reduce header height for desktops */
    max-width: 800px; /* Limit the width of the header */
    margin: 0 auto; /* Center the header horizontally */
  }

  .app-name {
    font-size: var(--desktop-hero); /* Use desktop-specific hero size */
  }

  .tagline {
    font-size: var(--desktop-text); /* Use desktop-specific text size */
  }

  .buttons {
    height: 45vh; /* Adjust button container height for desktops */
    gap: 4vh; /* Increase gap between buttons */
  }

  .btn {
    font-size: var(--desktop-text); /* Use desktop-specific button text size */
    padding: 16px 32px; /* Add more padding for larger buttons */
    width: 50%;
  }
}
</style>
