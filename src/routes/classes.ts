import express from "express";
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, departments, enrollments, subjects, user } from "../db/schema/index.js";

const router = express.Router();

// Get all classes with optional search, subject, teacher filters, and pagination
router.get("/", async (req, res) => {
    try {
        const { search, subject, teacher, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(classes.name, `%${search}%`),
                    ilike(classes.inviteCode, `%${search}%`)
                )
            );
        }

        if (subject) {
            filterConditions.push(ilike(subjects.name, `%${subject}%`));
        }

        if (teacher) {
            filterConditions.push(ilike(user.name, `%${teacher}%`));
        }

        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const classesList = await db
            .select({
                ...getTableColumns(classes),
                subject: {
                    ...getTableColumns(subjects),
                },
                teacher: {
                    ...getTableColumns(user),
                },
            })
            .from(classes)
            .leftJoin(subjects, eq(classes.subjectId, subjects.id))
            .leftJoin(user, eq(classes.teacherId, user.id))
            .where(whereClause)
            .orderBy(desc(classes.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: classesList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /classes error:", error);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// Get class details with teacher, subject and department
//id is dynamic
router.get("/:id", async (req, res) => {

    const classId = Number(req.params.id);

    //If classId is not a number
    if (!Number.isFinite(classId)) return res.status(400).json({error: "No class found"});

    //Destructure the class details from an array
    const [classDetails] = await db
        .select({
            ...getTableColumns(classes),
            subject: {
                ...getTableColumns(subjects),
            },
            department: {
                ...getTableColumns(departments),
            },
            teacher: {
                ...getTableColumns(user),
            }
        })
        .from(classes)
        .leftJoin(subjects, eq(classes.subjectId, subjects.id))
        .leftJoin(user, eq(classes.teacherId, user.id))
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(eq(classes.id, classId)) //looking for the classid that matches the class id we are looking for.

    if(!classDetails) return res.status(404).json({error: "No class found"});
    res.status(200).json({
        data: classDetails,
    })
})

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