DROP INDEX "enrollments_student_id_class_id_key";--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "invite_code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "schedules" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "schedules" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "schedules" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "description" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "subjects" ALTER COLUMN "description" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_class_id_pk" PRIMARY KEY("student_id","class_id");--> statement-breakpoint
ALTER TABLE "enrollments" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_class_id_unique" UNIQUE("student_id","class_id");