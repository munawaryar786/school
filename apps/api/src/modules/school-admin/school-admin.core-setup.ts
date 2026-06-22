// @ts-nocheck
import { prisma } from "../../db/prisma";

const standardClassDefinitions = Array.from({ length: 12 }, (_, index) => {
  const level = index + 1;
  return { name: `Grade ${level}`, code: `G${level}`, status: "ACTIVE" };
});

const commonSubjectDefinitions = [
  { name: "English", code: "ENG", type: "CORE", status: "ACTIVE" },
  { name: "Mathematics", code: "MATH", type: "CORE", status: "ACTIVE" },
  { name: "Science", code: "SCI", type: "CORE", status: "ACTIVE" },
  { name: "Social Studies", code: "SOC", type: "CORE", status: "ACTIVE" },
  { name: "Urdu", code: "URDU", type: "CORE", status: "ACTIVE" },
  { name: "Islamic Studies", code: "ISL", type: "CORE", status: "ACTIVE" },
  { name: "Computer Science", code: "CS", type: "CORE", status: "ACTIVE" },
  { name: "General Knowledge", code: "GK", type: "CORE", status: "ACTIVE" }
];

export async function ensureStandardClasses(schoolId: string) {
  const db = prisma as any;
  const existingRows = await db.classLevel.findMany({
    where: {
      schoolId,
      OR: [
        { code: { in: standardClassDefinitions.map((item) => item.code) } },
        { name: { in: standardClassDefinitions.map((item) => item.name) } }
      ]
    },
    select: { id: true, name: true, code: true, status: true },
    orderBy: { name: "asc" }
  });
  const existingKeys = new Set(existingRows.flatMap((row) => [row.code.toLowerCase(), row.name.toLowerCase()]));
  const missing = standardClassDefinitions.filter((item) => !existingKeys.has(item.code.toLowerCase()) && !existingKeys.has(item.name.toLowerCase()));
  if (missing.length) {
    await db.classLevel.createMany({ data: missing.map((item) => ({ ...item, schoolId })), skipDuplicates: true });
  }
  const rows = await db.classLevel.findMany({
    where: { schoolId, OR: [{ code: { in: standardClassDefinitions.map((item) => item.code) } }, { name: { in: standardClassDefinitions.map((item) => item.name) } }] },
    select: { id: true, name: true, code: true, status: true },
    orderBy: { code: "asc" }
  });
  return { created: missing.length, existing: existingRows.length, total: rows.length, rows };
}

export async function ensureCommonSubjects(schoolId: string) {
  const db = prisma as any;
  const existingRows = await db.subject.findMany({
    where: {
      schoolId,
      OR: [
        { code: { in: commonSubjectDefinitions.map((item) => item.code) } },
        { name: { in: commonSubjectDefinitions.map((item) => item.name) } }
      ]
    },
    select: { id: true, name: true, code: true, type: true, status: true },
    orderBy: { name: "asc" }
  });
  const existingKeys = new Set(existingRows.flatMap((row) => [row.code.toLowerCase(), row.name.toLowerCase()]));
  const missing = commonSubjectDefinitions.filter((item) => !existingKeys.has(item.code.toLowerCase()) && !existingKeys.has(item.name.toLowerCase()));
  if (missing.length) {
    await db.subject.createMany({ data: missing.map((item) => ({ ...item, schoolId })), skipDuplicates: true });
  }
  const rows = await db.subject.findMany({
    where: { schoolId, OR: [{ code: { in: commonSubjectDefinitions.map((item) => item.code) } }, { name: { in: commonSubjectDefinitions.map((item) => item.name) } }] },
    select: { id: true, name: true, code: true, type: true, status: true },
    orderBy: { name: "asc" }
  });
  return { created: missing.length, existing: existingRows.length, total: rows.length, rows };
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && (error as any).code === "P2002";
}
