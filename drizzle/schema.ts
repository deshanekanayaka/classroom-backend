import { pgTable, unique, integer, varchar, text, timestamp, foreignKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const classStatus = pgEnum("class_status", ['active', 'inactive', 'archived'])


export const departments = pgTable("departments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "departments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("departments_code_unique").on(table.code),
]);

export const subjects = pgTable("subjects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "subjects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	departmentId: integer("department_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.departmentId],
			foreignColumns: [departments.id],
			name: "subjects_department_id_departments_id_fk"
		}).onDelete("restrict"),
	unique("subjects_code_unique").on(table.code),
]);
