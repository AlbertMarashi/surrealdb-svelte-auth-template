import { browser } from "$app/environment"
import { PUBLIC_SURREAL_DATABASE, PUBLIC_SURREAL_HOST, PUBLIC_SURREAL_NAMESPACE } from "$env/static/public"
import Surreal from "surrealdb"
import { request_data_store } from "./request_data_store"
import { get_cookie_from_document } from "./utils/cookies"

export type SessionToken = {
    db: string,
    ns: string
    id: string, // the user's ID, which refers to the $auth parameter in SurrealDB
    ac: "users" // the access scope

    email: string // some optional user metadata, such as their name
    name: string
}

// This will only be set in the browser
const browser_user_db = browser
    ? init_surreal_client(get_cookie_from_document("token") || undefined)
    : null
    

// A universal "safe" client-side/user-authenticated database which is also available server-side
// May be unauthenticated, if the user has not logged in
export async function user_db(): Promise<Surreal> {
    if (browser) {
        // we can just use the client-side DB
        return await browser_user_db!
    } else {
        // we're in a server-side environment, so need to load it from the request data store
        return request_data_store.request_data.user_db()
    }
}

export async function init_surreal_client(
    auth?:
    | string
    | {
        username: string,
        password: string
    },
) {
    const db = new Surreal()

    const surreal_host = new URL(PUBLIC_SURREAL_HOST)

    if (surreal_host.protocol === "http:") surreal_host.protocol = "ws:"
    if (surreal_host.protocol === "https:") surreal_host.protocol = "wss:"
    surreal_host.pathname = "/rpc"

    await db.connect(surreal_host, {
        namespace: PUBLIC_SURREAL_NAMESPACE,
        database: PUBLIC_SURREAL_DATABASE,
        auth
    })

    return db
}
