<script setup></script>

<template>
  <nav class="bottom-nav">
    <router-link to="/dashboard/profile" class="nav-item">
      <span class="icon">🏠</span>
      <span class="label">Home</span>
    </router-link>
    <router-link to="/dashboard/projects" class="nav-item">
      <span class="icon">📂</span>
      <span class="label">Projects</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav {
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #222; /* Dark background */
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #444;
}

.nav-item {
  text-decoration: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  padding: 10px;
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
