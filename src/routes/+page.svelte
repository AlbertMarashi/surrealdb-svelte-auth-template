<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { user_db } from "$lib/database.js";
    import { set_cookie_on_document } from "$lib/utils/cookies";

    let { data } = $props();

    let password = $state("");
    let email = $state("");
    let name = $state("");
    let user = $derived(data.user);

    function logout() {
        // we clear the token cookie which "logs out" the user
        // from future requests
        set_cookie_on_document("token", null, {
            path: "/",
            sameSite: "strict",
            httpOnly: false,
            expires: new Date(0),
        });

        // we do a full reload, so we can also reset
        // the currently authenticated client-side database
        window.location.reload();
    }

    async function login() {
        let res = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        let data = await res.json();

        if (res.ok) {
            // reload the page to apply the new token
            // to the client-side database
            window.location.reload();
            // but we could also just read the cookie from the document (or have it returned by `/login`)
            // and then use db.authenticate(token) to authenticate the client-side database with it
        } else {
            alert(JSON.stringify(data));
        }
    }

    async function register() {
        // we use the user database here, since anyone is allowed to create a user
        const db = await user_db();

        await db.query(
            "CREATE user SET email = $email, name = $name, password = $password",
            {
                email,
                name,
                password,
            },
        );

        // login using the same credentials
        await login();
    }
</script>

{#if data.contained_user}
    The query returned a user
{:else}
    <p>No user found</p>
{/if}

{#if user}
    <p>Welcome, {user.name}!</p>
    <button onclick={logout}>Logout</button>
{:else}
    <wrapper>
        <h2>Login</h2>
        <input
            type="email"
            name="email"
            placeholder="Email"
            bind:value={email}
        />
        <input
            type="password"
            name="password"
            placeholder="Password"
            bind:value={password}
        />
        <button type="submit" onclick={login}>Login</button>
    </wrapper>
    <wrapper>
        <h2>Register</h2>
        <input
            type="email"
            name="email"
            placeholder="Email"
            bind:value={email}
        />
        <input type="name" name="name" placeholder="Name" bind:value={name} />
        <input
            type="password"
            name="password"
            placeholder="Password"
            bind:value={password}
        />
        <button type="submit" onclick={register}>Register</button>
    </wrapper>
{/if}

<style>
    wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
    }
</style>
