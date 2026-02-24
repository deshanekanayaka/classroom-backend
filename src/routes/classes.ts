// import express from "express";
// import { db } from "../db/index.js";
// import { classes } from "../db/schema/index.js";
//
// const router = express.Router();
//
// router.post("/", async (req, res) => {
//   try {
//     // Destructuring properties from the form coming from frontend
//     const {
//       name,
//       teacherId,
//       subjectId,
//       capacity,
//       description,
//       status,
//       bannerUrl,
//       bannerCldPubId,
//     } = req.body ?? {};
//
//     // Basic validation for required fields
//     if (!name || !teacherId || !subjectId) {
//       return res.status(400).json({
//         error: "Missing required fields",
//         details: {
//           name: !name ? "Required" : undefined,
//           teacherId: !teacherId ? "Required" : undefined,
//           subjectId: !subjectId ? "Required" : undefined,
//         },
//       });
//     }
//
//     const [createdClass] = await db
//       .insert(classes)
//       .values({
//         subjectId,
//         inviteCode: Math.random().toString(36).substring(2, 9),
//         name,
//         teacherId,
//         bannerCldPubId: bannerCldPubId ?? null,
//         bannerUrl: bannerUrl ?? null,
//         capacity: capacity ?? null,
//         description: description ?? null,
//         schedules: [],
//         status: status ?? "ACTIVE",
//       })
//       .returning({ id: classes.id });
//
//     return res.status(201).json({ id: createdClass.id });
//   } catch (e: any) {
//     console.error("POST /api/classes error:", e);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });
//
// export default router;

import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, departments, enrollments, subjects, user } from "../db/schema/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        //     Destructing properties from the form coming from frontend
        const {
            name,
            teacherId,
            subjectId,
            capacity,
            description,
            status,
            bannerUrl,
            bannerCldPubId,
        } = req.body

        const [createdClass] = await db
            .insert(classes)
            .values({
                subjectId,
                inviteCode: Math.random().toString(36).substring(2, 9),
                name,
                teacherId,
                bannerCldPubId,
                bannerUrl,
                capacity,
                description,
                schedules: [],
                status,
            })
            .returning({ id: classes.id });

        if (!createdClass) throw Error;

        res.status(201).json({ data: createdClass });

    } catch (e) {
        console.error(`POST / classes error: ${e}`);
        res.status(500).json({ error: e });
    }
})

export default router;