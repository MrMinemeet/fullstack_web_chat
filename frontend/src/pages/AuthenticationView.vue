<template>
	<p>This page will handle registration/login. The buttons won't work as the browser to perform a POST request, which currently gets a HTTP 404 as there is no backend.</p>
	<div class="authForm">
		<div class="login">
			<h1>Login</h1>
			<form method="post">
				<input type="text" placeholder="Username" autocomplete="on" required name="username" minlength="2" maxlength="255"/>
				<input type="password" placeholder="Password" required name="password"  minlength="2"/>
				<button>Login</button>
			</form>
		</div>
		<div class="register">
			<!-- Register -->
			<h1>Register</h1>
			<form method="post">
				<input type="text" placeholder="Username" requried name="username" minlength="2" maxlength="255"/>
				<input type="email" placeholder="Email" required name="email"/>
				<input type="password" placeholder="Password" required name="password" minlength="2"/>
				<button>Register</button>
			</form>
		</div>
	</div>
</template>

<style scoped>
	.authForm {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.login, .register {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
	}
	.login form, .register form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.login input, .register input {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}
	.login input:valid, .register input:valid {
		border-color: var(--valid-color);
	}
	.login input:invalid, .register input:invalid {
		border-color: var(--invalid-color);
	}
	.login button, .register button {
		margin: 0.5rem;
		padding: 0.25rem 0.5rem;
	}
</style>