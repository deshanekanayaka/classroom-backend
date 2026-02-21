// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "../db"; // your drizzle instance
// import * as schema from '../db/schema/auth'
//
// export const auth = betterAuth({
//     secret: process.env.BETTER_AUTH_SECRET!,
//     trustedOrigins: [process.env.FRONTEND_URL!],
//     user: {
//         additionalFields: {
//             role: {
//                 type: "string", required: true, defaultValue: "student", input: true,
//             },
//             imageCldPubId: {
//                 type: "string", required: false, input: true,
//             }
//         }
//     },
//     database: drizzleAdapter(db, {
//         provider: "pg", // or "mysql", "sqlite"
//         schema,
//     }),
//     emailAndPassword: {
//         enabled: true,
//     }
// });

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema/auth.js";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [process.env.FRONTEND_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "student",
                input: true,
            },
            imageCldPubId: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
});