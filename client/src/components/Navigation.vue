<script setup></script>

<template>
  <nav class="bottom-nav">
    <router-link to="/dashboard/profile" class="nav-item" active-class="active">
      <span class="icon">🏠</span>
      <span class="label">Home</span>
    </router-link>
    <router-link to="/dashboard/projects" class="nav-item" active-class="active">
      <span class="icon">📂</span>
      <span class="label">Projects</span>
    </router-link>
  </nav>
</template>

<style scoped>
.active {
  background-color: var(--grey-icon);
}
.bottom-nav {
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #222; /* Dark background */
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #444;
}

.nav-item {
  width: 50%;
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  padding: 20px;
  transition: opacity 0.2s ease-in-out;
}

.nav-item:hover {
  opacity: 0.7;
}

.icon {
  font-size: 20px; /* Adjust icon size */
}

.label {
  margin-top: 4px;
}
</style>
