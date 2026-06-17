import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { requestId } from "./middleware/request-id";
import { apiSecurity } from "./middleware/api-security";
import { authRoutes } from "./modules/auth/auth.routes";
import { superAdminRoutes } from "./modules/super-admin/super-admin.routes";
import { schoolAdminRoutes } from "./modules/school-admin/school-admin.routes";
import { teacherRoutes } from "./modules/teacher/teacher.routes";
import { studentRoutes } from "./modules/student/student.routes";
import { parentRoutes } from "./modules/parent/parent.routes";
import { admissionsRoutes } from "./modules/admissions/admissions.routes";
import { academicRoutes } from "./modules/academic/academic.routes";
import { attendanceRoutes } from "./modules/attendance/attendance.routes";
import { examinationRoutes } from "./modules/examination/examination.routes";
import { lmsRoutes } from "./modules/lms/lms.routes";
import { financeRoutes } from "./modules/finance/finance.routes";
import { advancedFinanceRoutes } from "./modules/advanced-finance/advanced-finance.routes";
import { hrRoutes } from "./modules/hr/hr.routes";
import { libraryRoutes } from "./modules/library/library.routes";
import { communicationRoutes } from "./modules/communication/communication.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { documentsRoutes } from "./modules/documents/documents.routes";
import { certificatesRoutes } from "./modules/certificates/certificates.routes";
import { meetingsRoutes } from "./modules/meetings/meetings.routes";
import { cmsRoutes } from "./modules/cms/cms.routes";
import { mobileRoutes } from "./modules/mobile/mobile.routes";
import { securityRoutes } from "./modules/security/security.routes";
import { productionReadinessRoutes } from "./modules/production-readiness/production-readiness.routes";
import { prisma } from "./db/prisma";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestId);
  app.use(apiSecurity);
  app.use(morgan("combined"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (_req, res) => {
    res.json({ name: "School ERP API", status: "ok" });
  });

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  app.get("/v1/health/db", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/v1/auth", authRoutes);
  app.use("/v1/super-admin", superAdminRoutes);
  app.use("/v1/school-admin", schoolAdminRoutes);
  app.use("/v1/teacher", teacherRoutes);
  app.use("/v1/student", studentRoutes);
  app.use("/v1/parent", parentRoutes);
  app.use("/v1/admissions", admissionsRoutes);
  app.use("/v1/academic", academicRoutes);
  app.use("/v1/attendance", attendanceRoutes);
  app.use("/v1/examination", examinationRoutes);
  app.use("/v1/lms", lmsRoutes);
  app.use("/v1/finance", financeRoutes);
  app.use("/v1/advanced-finance", advancedFinanceRoutes);
  app.use("/v1/hr", hrRoutes);
  app.use("/v1/library", libraryRoutes);
  app.use("/v1/communication", communicationRoutes);
  app.use("/v1/reports", reportsRoutes);
  app.use("/v1/documents", documentsRoutes);
  app.use("/v1/certificates", certificatesRoutes);
  app.use("/v1/meetings", meetingsRoutes);
  app.use("/v1/cms", cmsRoutes);
  app.use("/v1/mobile", mobileRoutes);
  app.use("/v1/security", securityRoutes);
  app.use("/v1/production-readiness", productionReadinessRoutes);
  app.use((_req, res) => {
   return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found."
      },
      meta: {
        requestId: res.locals.requestId
      }
    });
  });
  app.use(errorHandler);

  return app;
}
const app = createApp();

export default app;