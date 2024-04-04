<template>
	<header>
	  <img alt="Vue logo" class="logo" src="https://upload.wikimedia.org/wikipedia/commons/c/c3/JKU_Logo.svg" width="150" />
	  <h1>FullStack WebChat</h1>
	  powered by shitty code
    <nav>
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/profile">Go to Profile</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  background-color: --primary-color;
  padding: 20px;
}
nav ul {
  list-style-type: none;
  padding: 0;
}
nav ul li {
  display: inline;
  margin-right: 10px;
}
</style>