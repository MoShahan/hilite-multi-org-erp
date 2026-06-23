export type TeamSummary = {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
};

export type TeamDetail = TeamSummary;

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

export type TeamListMembershipFilter = "ALL" | "WITH_MEMBERS" | "EMPTY";

export type TeamListSortBy = "name" | "memberCount" | "createdAt";

export type TeamListSortOrder = "asc" | "desc";

export type ListTeamsQuery = {
  search?: string;
  membership?: TeamListMembershipFilter;
  sortBy?: TeamListSortBy;
  sortOrder?: TeamListSortOrder;
  page?: number;
  pageSize?: number;
};

export type ParsedListTeamsQuery = {
  search?: string;
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

export type PaginatedTeamsResponse = {
  teams: TeamSummary[];
  meta: TeamListMeta;
};

export type TeamDetailResponse = {
  team: TeamDetail;
};

export type CreateTeamInput = {
  name: string;
};

export type CreateTeamMemberInput = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

export type TeamMemberListSortBy = "name" | "email" | "role" | "createdAt";

export type TeamMemberListSortOrder = "asc" | "desc";

export type ListTeamMembersQuery = {
  search?: string;
  roleId?: string;
  sortBy?: TeamMemberListSortBy;
  sortOrder?: TeamMemberListSortOrder;
  page?: number;
  pageSize?: number;
};

export type ParsedListTeamMembersQuery = {
  search?: string;
  roleId?: string;
  sortBy: TeamMemberListSortBy;
  sortOrder: TeamMemberListSortOrder;
  page: number;
  pageSize: number;
};

export type PaginatedTeamMembersResponse = {
  members: TeamMember[];
  meta: TeamListMeta;
};
