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
import { requireAnyPermission } from "../middleware/requireAnyPermission";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const teamsRead = [authenticate, requirePermission(PERMISSIONS.TEAMS_READ)];
const teamsWrite = [authenticate, requirePermission(PERMISSIONS.TEAMS_WRITE)];
const teamMembersRead = [
  authenticate,
  requireAnyPermission(PERMISSIONS.TEAMS_READ, PERMISSIONS.USERS_READ_TEAM),
];
const teamMembersWrite = [
  authenticate,
  requireAnyPermission(
    PERMISSIONS.TEAMS_WRITE,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_WRITE_TEAM,
  ),
];

router.get("/", ...teamsRead, listTeams);
router.post("/", ...teamsWrite, createTeam);
router.get("/:id", ...teamsRead, getTeam);
router.get("/:id/members", ...teamMembersRead, listTeamMembers);
router.post("/:id/members", ...teamMembersWrite, createTeamMember);

export default router;
