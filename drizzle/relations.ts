import { relations } from "drizzle-orm/relations";
import { departments, subjects } from "./schema";

export const subjectsRelations = relations(subjects, ({one}) => ({
	department: one(departments, {
		fields: [subjects.departmentId],
		references: [departments.id]
	}),
}));

export const departmentsRelations = relations(departments, ({many}) => ({
	subjects: many(subjects),
}));