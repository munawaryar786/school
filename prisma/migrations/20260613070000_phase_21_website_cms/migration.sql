CREATE TABLE "WebsitePage" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "pageType" TEXT NOT NULL DEFAULT 'GENERAL',
  "heroTitle" TEXT NOT NULL,
  "heroImageUrl" TEXT,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsitePage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsItem" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "publishedOn" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NewsItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebsiteAnnouncement" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "audience" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "startsOn" TIMESTAMP(3) NOT NULL,
  "endsOn" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CmsAdmissionPage" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "programName" TEXT NOT NULL,
  "intakeYear" TEXT NOT NULL,
  "requirements" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "ctaLabel" TEXT NOT NULL,
  "ctaUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsAdmissionPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebsitePage_schoolId_slug_key" ON "WebsitePage"("schoolId", "slug");
CREATE INDEX "WebsitePage_schoolId_status_idx" ON "WebsitePage"("schoolId", "status");
CREATE INDEX "WebsitePage_schoolId_pageType_idx" ON "WebsitePage"("schoolId", "pageType");
CREATE INDEX "WebsitePage_schoolId_publishedAt_idx" ON "WebsitePage"("schoolId", "publishedAt");

CREATE UNIQUE INDEX "BlogPost_schoolId_slug_key" ON "BlogPost"("schoolId", "slug");
CREATE INDEX "BlogPost_schoolId_status_idx" ON "BlogPost"("schoolId", "status");
CREATE INDEX "BlogPost_schoolId_category_idx" ON "BlogPost"("schoolId", "category");
CREATE INDEX "BlogPost_schoolId_publishedAt_idx" ON "BlogPost"("schoolId", "publishedAt");

CREATE UNIQUE INDEX "NewsItem_schoolId_slug_key" ON "NewsItem"("schoolId", "slug");
CREATE INDEX "NewsItem_schoolId_status_idx" ON "NewsItem"("schoolId", "status");
CREATE INDEX "NewsItem_schoolId_publishedOn_idx" ON "NewsItem"("schoolId", "publishedOn");

CREATE INDEX "WebsiteAnnouncement_schoolId_status_idx" ON "WebsiteAnnouncement"("schoolId", "status");
CREATE INDEX "WebsiteAnnouncement_schoolId_audience_idx" ON "WebsiteAnnouncement"("schoolId", "audience");
CREATE INDEX "WebsiteAnnouncement_schoolId_startsOn_idx" ON "WebsiteAnnouncement"("schoolId", "startsOn");

CREATE UNIQUE INDEX "CmsAdmissionPage_schoolId_slug_key" ON "CmsAdmissionPage"("schoolId", "slug");
CREATE INDEX "CmsAdmissionPage_schoolId_status_idx" ON "CmsAdmissionPage"("schoolId", "status");
CREATE INDEX "CmsAdmissionPage_schoolId_programName_idx" ON "CmsAdmissionPage"("schoolId", "programName");
CREATE INDEX "CmsAdmissionPage_schoolId_intakeYear_idx" ON "CmsAdmissionPage"("schoolId", "intakeYear");

ALTER TABLE "WebsitePage" ADD CONSTRAINT "WebsitePage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsItem" ADD CONSTRAINT "NewsItem_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebsiteAnnouncement" ADD CONSTRAINT "WebsiteAnnouncement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CmsAdmissionPage" ADD CONSTRAINT "CmsAdmissionPage_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
