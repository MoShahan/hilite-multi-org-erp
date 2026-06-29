import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/team.repository", () => ({
  teamRepository: {
    findManyPaginated: vi.fn(),
    findByIdForOrganization: vi.fn(),
    create: vi.fn(),
    findMembersPaginated: vi.fn(),
    createMember: vi.fn(),
  },
}));

vi.mock("../repositories/user.repository", () => ({
  authUserRepository: {
    emailExists: vi.fn(),
  },
}));

vi.mock("./audit.service", () => ({
  auditService: {
    log: vi.fn(),
  },
}));

vi.mock("./welcomeNotification.service", () => ({
  welcomeNotificationService: {
    ensureOnCreate: vi.fn(),
  },
}));

import { PERMISSIONS } from "../constants/permissions";
import { teamRepository } from "../repositories/team.repository";
import { teamService } from "./team.service";
import { baseAuthUser, expectAppErrorAsync } from "../test/helpers";

const orgId = "org-1";

describe("teamService.listTeams", () => {
  beforeEach(() => {
    vi.mocked(teamRepository.findManyPaginated).mockReset();
    vi.mocked(teamRepository.findManyPaginated).mockResolvedValue({
      teams: [],
      total: 0,
    });
  });

  it("requires organization context", async () => {
    await expectAppErrorAsync(
      () => teamService.listTeams(null, {}),
      403,
      "FORBIDDEN",
    );
  });

  it("returns paginated teams", async () => {
    const result = await teamService.listTeams(orgId, {});

    expect(result.teams).toEqual([]);
    expect(result.meta.total).toBe(0);
  });
});

describe("teamService.getTeam", () => {
  beforeEach(() => {
    vi.mocked(teamRepository.findByIdForOrganization).mockReset();
  });

  it("returns not found for missing team", async () => {
    vi.mocked(teamRepository.findByIdForOrganization).mockResolvedValue(null);

    await expectAppErrorAsync(
      () => teamService.getTeam(orgId, "missing-team"),
      404,
      "NOT_FOUND",
    );
  });
});

describe("teamService.createTeam", () => {
  beforeEach(() => {
    vi.mocked(teamRepository.create).mockReset();
  });

  it("requires a team name", async () => {
    await expectAppErrorAsync(
      () => teamService.createTeam(orgId, { name: "   " }),
      400,
      "BAD_REQUEST",
    );
  });

  it("creates a team", async () => {
    vi.mocked(teamRepository.create).mockResolvedValue({
      id: "team-1",
      name: "North",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      _count: { members: 0 },
    } as never);

    const result = await teamService.createTeam(orgId, { name: "North" });

    expect(result.team.name).toBe("North");
  });
});

describe("teamService.listMembers", () => {
  beforeEach(() => {
    vi.mocked(teamRepository.findByIdForOrganization).mockReset();
    vi.mocked(teamRepository.findMembersPaginated).mockReset();
  });

  it("forbids callers without team member access", async () => {
    vi.mocked(teamRepository.findByIdForOrganization).mockResolvedValue({
      id: "team-1",
      name: "North",
      createdAt: new Date(),
      _count: { members: 0 },
    } as never);

    await expectAppErrorAsync(
      () =>
        teamService.listMembers(orgId, "team-1", {}, baseAuthUser()),
      403,
      "FORBIDDEN",
    );
  });

  it("returns members for authorized callers", async () => {
    vi.mocked(teamRepository.findByIdForOrganization).mockResolvedValue({
      id: "team-a",
      name: "Team A",
      createdAt: new Date(),
      _count: { members: 1 },
    } as never);
    vi.mocked(teamRepository.findMembersPaginated).mockResolvedValue({
      members: [],
      total: 0,
    });

    const result = await teamService.listMembers(
      orgId,
      "team-a",
      {},
      baseAuthUser({ permissions: [PERMISSIONS.TEAMS_READ] }),
    );

    expect(result.members).toEqual([]);
  });
});
