import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  interval,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── User Profiles ──────────────────────────────────────────
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    fullName: text("full_name").notNull().default(""),
    department: text("department").default(""),
    yearOfStudy: text("year_of_study").default(""),
    bio: text("bio").default(""),
    skillTags: text("skill_tags")
      .array()
      .default(sql`ARRAY[]::TEXT[]`),
    languages: jsonb("languages").default(sql`'[]'::jsonb`),
    githubUrl: text("github_url").default(""),
    avatarUrl: text("avatar_url").default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_user_profiles_user_id").on(table.userId)]
);

// ─── Space Check-ins ────────────────────────────────────────
export const spaceCheckins = pgTable(
  "space_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    purposeOfVisit: text("purpose_of_visit").notNull(),
    estimatedDuration: interval("estimated_duration").notNull(),
    checkinTimestamp: timestamp("checkin_timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_checkins_user_id").on(table.userId),
    index("idx_checkins_active").on(table.isActive),
  ]
);

// ─── Equipment ──────────────────────────────────────────────
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull().default("General"),
  description: text("description").default(""),
  imageUrl: text("image_url").default(""),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Equipment Reservations ─────────────────────────────────
export const equipmentReservations = pgTable(
  "equipment_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    equipmentId: uuid("equipment_id")
      .notNull()
      .references(() => equipment.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_eq_reservations_equipment").on(table.equipmentId),
    index("idx_eq_reservations_user").on(table.userId),
  ]
);

// ─── Events ─────────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").default(""),
    eventType: text("event_type").default("Workshop"),
    location: text("location").default(""),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    imageUrl: text("image_url").default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_events_start").on(table.startTime),
    index("idx_events_end").on(table.endTime),
  ]
);

// ─── Type Exports ───────────────────────────────────────────
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type SpaceCheckin = typeof spaceCheckins.$inferSelect;
export type NewSpaceCheckin = typeof spaceCheckins.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type EquipmentReservation = typeof equipmentReservations.$inferSelect;
export type Event = typeof events.$inferSelect;