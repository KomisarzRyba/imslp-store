-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
DO $$ BEGIN
 CREATE TYPE "key_status" AS ENUM('expired', 'invalid', 'valid', 'default');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "key_type" AS ENUM('stream_xchacha20', 'secretstream', 'secretbox', 'kdf', 'generichash', 'shorthash', 'auth', 'hmacsha256', 'hmacsha512', 'aead-det', 'aead-ietf');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_type" AS ENUM('webauthn', 'totp');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "factor_status" AS ENUM('verified', 'unverified');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "aal_level" AS ENUM('aal3', 'aal2', 'aal1');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "code_challenge_method" AS ENUM('plain', 's256');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "composers" (
	"c_id" varchar(256) PRIMARY KEY NOT NULL,
	"last_name" varchar,
	"first_name" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "works" (
	"w_id" varchar PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"c_id" varchar NOT NULL,
	"imslp_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "works" ADD CONSTRAINT "works_c_id_composers_c_id_fk" FOREIGN KEY ("c_id") REFERENCES "composers"("c_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

*/