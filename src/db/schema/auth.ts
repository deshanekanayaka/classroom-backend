import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Reuse the same timestamp pattern used in app.ts (snake_case + $onUpdate)
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
};

// Extra field requirement: role enum with default "student"
export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);

// user table as per Better Auth schema + two additional fields (role, imageCldPubId)
export const user = pgTable("user", {
  id: text("id").primaryKey(), // must remain text PK

  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),

  // additional fields requested
  role: roleEnum("role").notNull().default("student"),
  imageCldPubId: text("image_cld_pub_id"), // nullable/optional

  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Better Auth expects a unique session token
    sessionToken: text("session_token").notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),

    ...timestamps,
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  })
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    scope: text("scope"),
    idToken: text("id_token"),
    tokenType: text("token_type"),

    ...timestamps,
  },
  (table) => ({
    // Composite unique per provider + provider user id as expected by Better Auth
    providerCompoundUnique: uniqueIndex("account_provider_provider_user_id_key").on(
      table.providerId,
      table.providerUserId
    ),
    userIdIdx: index("account_user_id_idx").on(table.userId),
  })
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    // identifier is usually email/phone; index it for faster lookups
    identifier: text("identifier").notNull(),

    // token must be unique
    token: text("token").notNull().unique(),

    expiresAt: timestamp("expires_at").notNull(),

    ...timestamps,
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  })
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Types (to keep app types in sync with DB schema)
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
