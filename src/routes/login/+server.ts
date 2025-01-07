import { PUBLIC_SURREAL_DATABASE, PUBLIC_SURREAL_NAMESPACE } from "$env/static/public"
import { admin_db } from "$lib/admin_db.js"
import type { SessionToken } from "$lib/database"
import { sign_jwt } from "$lib/utils/jwt.js"
import { json } from "@sveltejs/kit"


export async function POST ({ request, cookies }){
    const { email, password } = await request.json()

    if(!email || !password) return json({ error: "Invalid email or password" }, { status: 400 })

    // we use the admin database here, to see if the user exists
    const admin = await admin_db()

    const [[user]] = await admin.query<[{
        id: string
        email: string
        name: string
        password: string
    }[]]>("SELECT * FROM user WHERE email = $email AND password AND crypto::bcrypt::compare(password, $password) LIMIT 1;", {
        email,
        password
    })

    if(!user) return json({ error: "Invalid email or password" }, { status: 400 })

    const token = await sign_jwt<SessionToken>({
        db: PUBLIC_SURREAL_DATABASE,
        ns: PUBLIC_SURREAL_NAMESPACE,
        ac: "users",
        id: user.id,
        email: user.email,
        name: user.name
    })

    cookies.set("token", token, {
        httpOnly: false,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
    })

    return json({
        success: true
    })
}