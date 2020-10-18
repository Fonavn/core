import {MigrationInterface, QueryRunner} from "typeorm";

export class InitDatabase1602993628698 implements MigrationInterface {
    name = 'InitDatabase1602993628698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "database" ("created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP, "version" integer NOT NULL, "id" SERIAL NOT NULL, "type" character varying NOT NULL, "host" character varying(15), "port" integer, "username" character varying(15) NOT NULL, "password" character varying(15), "database" character varying(15) NOT NULL, CONSTRAINT "PK_ef0ad4a88bc632fd4d6a0b09ddf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant" ("created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP, "version" integer NOT NULL, "id" SERIAL NOT NULL, "path" character varying(15) NOT NULL, "host" character varying(15), "name" character varying(127) NOT NULL, "description" character varying(127), "databaseId" integer, CONSTRAINT "UQ_5b5c77ec7956f1b9877e6077ce0" UNIQUE ("path"), CONSTRAINT "UQ_a1115a77e94d4226e25a9cbfc2e" UNIQUE ("host"), CONSTRAINT "UQ_56211336b5ff35fd944f2259173" UNIQUE ("name"), CONSTRAINT "REL_a2f4c5f98bce39f6c931b65922" UNIQUE ("databaseId"), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "todo" ("created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP, "version" integer NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "completed" boolean NOT NULL, CONSTRAINT "PK_d429b7114371f6a35c5cb4776a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD CONSTRAINT "FK_a2f4c5f98bce39f6c931b659220" FOREIGN KEY ("databaseId") REFERENCES "database"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP CONSTRAINT "FK_a2f4c5f98bce39f6c931b659220"`);
        await queryRunner.query(`DROP TABLE "todo"`);
        await queryRunner.query(`DROP TABLE "tenant"`);
        await queryRunner.query(`DROP TABLE "database"`);
    }

}
