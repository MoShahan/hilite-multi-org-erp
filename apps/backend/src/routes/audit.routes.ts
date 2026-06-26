import { Router } from "express";
import { listOrgAuditLogs } from "../controllers/audit.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const auditRead = [
  authenticate,
  requirePermission(PERMISSIONS.AUDIT_READ),
];

router.get("/", ...auditRead, listOrgAuditLogs);

export default router;
