CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"repo" varchar(255) NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"feedback" text,
	"status" boolean,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"grade" integer
);
--> statement-breakpoint
CREATE TABLE "evaluation_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"status" varchar(50) DEFAULT 'available' NOT NULL,
	"evaluator_id" integer NOT NULL,
	"evaluatee_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"desc" text NOT NULL,
	"limit" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_code" varchar(255),
	"verification_code_expires_at" timestamp with time zone,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_slots" ADD CONSTRAINT "evaluation_slots_evaluator_id_users_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation_slots" ADD CONSTRAINT "evaluation_slots_evaluatee_id_users_id_fk" FOREIGN KEY ("evaluatee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;