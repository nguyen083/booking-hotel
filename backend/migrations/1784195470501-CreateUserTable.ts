import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1784195470501 implements MigrationInterface {
  name = 'CreateUserTable1784195470501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "full_name" character varying(100) NOT NULL, "phone_number" character varying(20) NOT NULL, "avatar_url" text, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users"  ("role") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email_unique_active" ON "users"  ("email") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_users_email_unique_active"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
