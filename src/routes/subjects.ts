import { eq, ilike, or, and, desc, sql, getTableColumns } from "drizzle-orm";
import express from "express";
import {departments, subjects} from "../db/schema";
import {db} from "../db";
const router = express.Router();

// Get all subjects with optional search, filtering and pagination
router.get('/', async (req, res) => {

    try {
    //Get props
    const {search, department, page= 1, limit=10} = req.query;

    // Get access to current page
    const currentPage = Math.max(1, Number(page) || 1);
    const limitPerPage = Math.max(1, Number(limit) || 10);
    // Offset = how many records to skip
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];
    // If a search query exists filter by subject name OR subject code
    if (search) {
        filterConditions.push(
            or(
                ilike(subjects.name, `%${search}%`),
                ilike(subjects.code, `%${search}%`),
            )
        );
    }
    // If department filter exists match department name
    if (department) {
        filterConditions.push(ilike(departments.name, `%${department}%`));
    }
    // Combine all features using AND if any exists
    const whereClause = filterConditions.length >0 ? and(...filterConditions) : undefined;

    // Count of all elements in tbe page
    //Left join returns all rows from left table and matching rows from right table
    const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)

        const totalCount = countResult[0] ?.count ?? 0;

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            department: {...getTableColumns(departments)}
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (e) {
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({error: 'Failed to get subjects'});
    }
})

export default router;