export type TeamListMembershipFilter = "ALL" | "WITH_MEMBERS" | "EMPTY";

export type TeamListSortBy = "name" | "memberCount" | "createdAt";

export type TeamListSortOrder = "asc" | "desc";

export type TeamListQuery = {
  search: string;
  membership: TeamListMembershipFilter;
  sortBy: TeamListSortBy;
  sortOrder: TeamListSortOrder;
  page: number;
  pageSize: number;
};

export type TeamListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Team = {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
};

export type ListTeamsResult = {
  teams: Team[];
  meta: TeamListMeta;
};

export type TeamOption = {
  id: string;
  name: string;
};

export type ListTeamOptionsQuery = {
  search?: string;
};

export type TeamOptionsResult = {
  teams: TeamOption[];
};

export type CreateTeamInput = {
  name: string;
};

export type TeamMemberRole = {
  id: string;
  name: string;
  slug: string;
};

export type TeamMemberStatus = "ACTIVE" | "INACTIVE";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  status: TeamMemberStatus;
  role: TeamMemberRole | null;
  createdAt: string;
};

export type TeamMemberListSortBy = "name" | "email" | "role" | "createdAt";

export type TeamMemberListSortOrder = "asc" | "desc";

export type TeamMemberListQuery = {
  search: string;
  roleId: string;
  sortBy: TeamMemberListSortBy;
  sortOrder: TeamMemberListSortOrder;
  page: number;
  pageSize: number;
};

export type TeamMemberRoleOption = {
  id: string;
  name: string;
};

export type ListTeamMembersResult = {
  members: TeamMember[];
  meta: TeamListMeta;
};

export type CreateTeamMemberInput = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

export type TeamsState = {
  teams: Team[];
  listMeta: TeamListMeta | null;
  listStatus: "idle" | "loading" | "success" | "error";
  listError: string | null;
  selectedTeam: Team | null;
  detailStatus: "idle" | "loading" | "success" | "error";
  detailError: string | null;
  members: TeamMember[];
  membersMeta: TeamListMeta | null;
  membersStatus: "idle" | "loading" | "success" | "error";
  membersError: string | null;
  mutationStatus: "idle" | "loading";
};
