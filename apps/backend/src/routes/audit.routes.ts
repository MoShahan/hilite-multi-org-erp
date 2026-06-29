import { Router } from "express";

import { PERMISSIONS } from "../constants/permissions";
import { listOrgAuditLogs } from "../controllers/audit.controller";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const auditRead = [
  authenticate,
  requirePermission(PERMISSIONS.AUDIT_READ),
];

router.get("/", ...auditRead, listOrgAuditLogs);

export default router;
