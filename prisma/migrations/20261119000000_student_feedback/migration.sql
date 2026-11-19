CREATE TABLE "StudentFeedback" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "name" TEXT NOT NULL DEFAULT '',
 "message" TEXT NOT NULL,
 "contentId" TEXT,
 "contentTitle" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudentFeedback_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "StudentFeedback_createdAt_id_idx" ON "StudentFeedback"("createdAt", "id");
ALTER TABLE "StudentFeedback" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "StudentFeedback" FROM PUBLIC;
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
  REVOKE ALL ON TABLE "StudentFeedback" FROM anon;
 END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
  REVOKE ALL ON TABLE "StudentFeedback" FROM authenticated;
 END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'trilha_app') THEN
  GRANT SELECT, INSERT ON TABLE "StudentFeedback" TO trilha_app;
 END IF;
END $$;
