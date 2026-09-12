import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(), userId: int("userId").notNull(), title: varchar("title", { length: 180 }).notNull().default("محادثة جديدة"), model: varchar("model", { length: 80 }).notNull().default("orbit-auto"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(), conversationId: int("conversationId").notNull(), role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(), content: text("content").notNull(), model: varchar("model", { length: 80 }), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const playerProfiles = mysqlTable("player_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  nameEn: varchar("nameEn", { length: 160 }),
  country: varchar("country", { length: 100 }).notNull(),
  club: varchar("club", { length: 160 }),
  position: varchar("position", { length: 60 }),
  jerseyNumber: int("jerseyNumber"),
  imageUrl: text("imageUrl"),
  bio: text("bio"),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const playerPosts = mysqlTable("player_posts", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type PlayerPost = typeof playerPosts.$inferSelect;
