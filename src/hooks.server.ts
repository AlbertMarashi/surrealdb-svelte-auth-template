import { init_surreal_client } from "$lib/database";
import { request_data_store } from "$lib/request_data_store";
import { verify_jwt } from "$lib/utils/jwt";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { safe_request_wrapper } from "safe-ssr/safe_request_wrapper";
import type Surreal from "surrealdb";

export const token_data: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get("token")

    if(token){
        try {
            const { payload } = await verify_jwt<{
                id: string
                email: string
                name: string
            }>(token)
            event.locals.token = token
            event.locals.user = {
                id: payload.id,
                email: payload.email,
                name: payload.name
            }
        } catch (e) {
            // token is invalid, so remove it
            console.error(e)
            event.cookies.set("token", "", {
                path: "/",
                sameSite: "strict",
                httpOnly: false,
                expires: new Date(0)
            })

        }

    }

    return resolve(event)
}

export const request_data_initaliser: Handle = async ({ event, resolve }) => {
    let user_db: Promise<Surreal> | undefined

    request_data_store.request_data = {
        // initialise a lazy-loaded DB, as it will not be required in every request
        user_db: () => user_db ??= init_surreal_client(event.locals.token)
    }

    return resolve(event)
}

export const handle = sequence(
    safe_request_wrapper,
    token_data,
    request_data_initaliser,
)
