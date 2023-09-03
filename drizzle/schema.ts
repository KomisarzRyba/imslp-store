import { pgTable, pgEnum, varchar, foreignKey, uuid, integer } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
export const keyStatus = pgEnum("key_status", ['expired', 'invalid', 'valid', 'default'])
export const keyType = pgEnum("key_type", ['stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf'])
export const factorType = pgEnum("factor_type", ['webauthn', 'totp'])
export const factorStatus = pgEnum("factor_status", ['verified', 'unverified'])
export const aalLevel = pgEnum("aal_level", ['aal3', 'aal2', 'aal1'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['plain', 's256'])


export const composers = pgTable("composers", {
	cId: varchar("c_id", { length: 255 }).primaryKey().notNull(),
	lastName: varchar("last_name", { length: 127 }).notNull(),
	firstName: varchar("first_name", { length: 127 }),
});

export const works = pgTable("works", {
	wId: uuid("w_id").defaultRandom().primaryKey().notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	cId: varchar("c_id").notNull().references(() => composers.cId),
	imslpId: integer("imslp_id"),
});