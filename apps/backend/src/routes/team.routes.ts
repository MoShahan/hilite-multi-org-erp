import { Router } from "express";
import {
  createTeam,
  createTeamMember,
  getTeam,
  listTeamMembers,
  listTeams,
} from "../controllers/team.controller";
import { PERMISSIONS } from "../constants/permissions";
import { authenticate } from "../middleware/authenticate";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const teamsRead = [authenticate, requirePermission(PERMISSIONS.TEAMS_READ)];
const teamsWrite = [authenticate, requirePermission(PERMISSIONS.TEAMS_WRITE)];

router.get("/", ...teamsRead, listTeams);
router.post("/", ...teamsWrite, createTeam);
router.get("/:id", ...teamsRead, getTeam);
router.get("/:id/members", ...teamsRead, listTeamMembers);
router.post("/:id/members", ...teamsWrite, createTeamMember);

export default router;
