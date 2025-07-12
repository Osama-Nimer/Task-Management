import {
    pgTable,
    serial,
    varchar,
    timestamp,
    boolean,
    integer,
    text,
    primaryKey,
  } from "drizzle-orm/pg-core";
  import { relations } from "drizzle-orm";
  
  // =================== User ===================
  
  export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    verified: boolean("verified").default(false).notNull(),
    verificationCode: varchar("verification_code", { length: 255 }),
    verificationCodeExpiresAt: timestamp("verification_code_expires_at", { withTimezone: true }),
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockoutUntil: timestamp('lockout_until'),
  });
  
  // =================== Task ===================
  
  export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    desc: text("desc").notNull(),
    limit: timestamp("limit", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  // =================== Answer ===================
  
  export const answers = pgTable("answers", {
    id: serial("id").primaryKey(),
    repo: varchar("repo", { length: 255 }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    feedback: text("feedback"),
    status: boolean("status"),
    userId: integer("user_id").notNull().references(() => users.id),
    taskId: integer("task_id").notNull().references(() => tasks.id),
    grade: integer("grade"),
  });
  
  // =================== EvaluationSlot ===================
  
  export const evaluationSlots = pgTable("evaluation_slots", {
    id: serial("id").primaryKey(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }),
    status: varchar("status", { length: 50 }).default("available").notNull(),
  
    evaluatorId: integer("evaluator_id").notNull().references(() => users.id),
    evaluateeId: integer("evaluatee_id").references(() => users.id),
  
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  // =================== Relations (اختياري) ===================
  
  export const userRelations = relations(users, ({ many }) => ({
    answers: many(answers),
    evaluationSlotsCreated: many(evaluationSlots, {
      relationName: "Evaluator",
    }),
    evaluationSlotsBooked: many(evaluationSlots, {
      relationName: "Evaluatee",
    }),
  }));
  
  export const taskRelations = relations(tasks, ({ many }) => ({
    answers: many(answers),
  }));
  
  export const answerRelations = relations(answers, ({ one }) => ({
    user: one(users, { fields: [answers.userId], references: [users.id] }),
    task: one(tasks, { fields: [answers.taskId], references: [tasks.id] }),
  }));
  
  export const evaluationSlotRelations = relations(evaluationSlots, ({ one }) => ({
    evaluator: one(users, { fields: [evaluationSlots.evaluatorId], references: [users.id], relationName: "Evaluator" }),
    evaluatee: one(users, { fields: [evaluationSlots.evaluateeId], references: [users.id], relationName: "Evaluatee" }),
  }));
  