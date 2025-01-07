import { user_db } from "$lib/database"

export async function load() {
    // this database will use the user's authentication token to load their 
    // if they're not authenticated, then it will not load 
    const db = await user_db()

    const [users] = await db.query<[{
        id: string
        title: string
        content: string
    }[]]>("SELECT * FROM user;")

    return {
        contained_user: users.length > 0
    }
}