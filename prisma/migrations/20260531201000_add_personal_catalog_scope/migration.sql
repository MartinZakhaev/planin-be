ALTER TABLE "task_catalog"
ADD COLUMN "owner_user_id" VARCHAR(36);

ALTER TABLE "item_catalog"
ADD COLUMN "owner_user_id" VARCHAR(36);

ALTER TABLE "task_catalog"
ADD CONSTRAINT "task_catalog_owner_user_id_fkey"
FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "item_catalog"
ADD CONSTRAINT "item_catalog_owner_user_id_fkey"
FOREIGN KEY ("owner_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "task_catalog_owner_user_id_idx" ON "task_catalog"("owner_user_id");
CREATE INDEX "item_catalog_owner_user_id_idx" ON "item_catalog"("owner_user_id");
