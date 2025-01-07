import type Surreal from "surrealdb";
import { init_surreal_client } from "./database";
import { SURREAL_PASSWORD } from "$env/static/private";
import { SURREAL_USER } from "$env/static/private";


let admin_db_cache: Promise<Surreal> | undefined

// This is a lazy-loaded admin database, which can only be imported in server-side code
export async function admin_db(): Promise<Surreal> {
    if (!admin_db_cache) admin_db_cache = init_surreal_client({
        username: SURREAL_USER,
        password: SURREAL_PASSWORD
    })
    return admin_db_cache
}