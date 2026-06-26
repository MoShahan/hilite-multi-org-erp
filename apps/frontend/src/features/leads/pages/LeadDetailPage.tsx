import { ArrowLeft, Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthUser,
  selectHasAnyPermission,
  selectHasModule,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { ORG_MODULE_KEYS } from "@/constants/orgModules";
import { PERMISSIONS } from "@/constants/permissions";
import { formatDateTime } from "@/lib/format";

import { ActivityTimeline } from "../components/ActivityTimeline";
import { AssignLeadDialog } from "../components/AssignLeadDialog";
import { LogActivityDialog } from "../components/LogActivityDialog";
import { LeadStatusAdvance } from "../components/LeadStatusAdvance";
import { LeadStatusBadge } from "../components/LeadStatusBadge";
import { LeadStatusHistory } from "../components/LeadStatusHistory";
import { LeadStatusStepper } from "../components/LeadStatusStepper";
import { UpdateLeadDialog } from "../components/UpdateLeadDialog";
import {
  clearSelectedLead,
  fetchActivities,
  fetchLead,
  fetchStatusHistory,
} from "../leadsSlice";
import {
  selectActivities,
  selectActivitiesStatus,
  selectIsLeadsMutating,
  selectLeadDetailError,
  selectLeadDetailStatus,
  selectSelectedLead,
  selectStatusHistory,
  selectStatusHistoryStatus,
} from "../leadsSelectors";

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const hasSalesErpModule = useAppSelector(
    selectHasModule(ORG_MODULE_KEYS.SALES_ERP),
  );
  const authUser = useAppSelector(selectAuthUser);
  const lead = useAppSelector(selectSelectedLead);
  const detailStatus = useAppSelector(selectLeadDetailStatus);
  const detailError = useAppSelector(selectLeadDetailError);
  const activities = useAppSelector(selectActivities);
  const activitiesStatus = useAppSelector(selectActivitiesStatus);
  const statusHistory = useAppSelector(selectStatusHistory);
  const statusHistoryStatus = useAppSelector(selectStatusHistoryStatus);
  const isMutating = useAppSelector(selectIsLeadsMutating);
  const canEditLead = useAppSelector(selectHasPermission(PERMISSIONS.LEADS_WRITE));
  const canUpdateStatusOnly = useAppSelector(
    selectHasAnyPermission([
      PERMISSIONS.LEADS_STATUS_WRITE,
      PERMISSIONS.LEADS_STATUS_WRITE_TEAM,
    ]),
  );
  const canAdvanceStatus = canEditLead || canUpdateStatusOnly;
  const canReassign = useAppSelector(
    (state) =>
      selectHasPermission(PERMISSIONS.LEADS_WRITE)(state) &&
      selectHasPermission(PERMISSIONS.LEADS_READ_TEAM)(state),
  );
  const canLogActivity = useAppSelector(
    selectHasPermission(PERMISSIONS.ACTIVITIES_WRITE),
  );

  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [logActivityOpen, setLogActivityOpen] = useState(false);

  const listSearch =
    typeof location.state === "object" &&
    location.state !== null &&
    "listSearch" in location.state &&
    typeof location.state.listSearch === "string"
      ? location.state.listSearch
      : "";

  useEffect(() => {
    if (!id || !hasSalesErpModule) return;

    void dispatch(fetchLead(id));
    void dispatch(fetchActivities(id));
    void dispatch(fetchStatusHistory(id));

    return () => {
      dispatch(clearSelectedLead());
    };
  }, [dispatch, hasSalesErpModule, id]);

  const isLoading = detailStatus === "loading" || detailStatus === "idle";
  const isCurrentAssignee =
    !!lead && !!authUser && lead.assignedTo?.id === authUser.id;

  if (!id) {
    return null;
  }

  if (!hasSalesErpModule) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit px-0 hover:bg-transparent"
          asChild
        >
          <Link to={`/leads${listSearch}`}>
            <ArrowLeft className="size-4" />
            Back to leads
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : detailError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {detailError}
          </div>
        ) : lead ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {lead.name}
                  </h1>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {lead.team.name}
                  {lead.assignedTo
                    ? ` · Assigned to ${lead.assignedTo.name}`
                    : " · Unassigned"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {canReassign ? (
                  <Button
                    variant="outline"
                    onClick={() => setAssignOpen(true)}
                    disabled={isMutating}
                  >
                    <UserRound className="size-4" />
                    Assign
                  </Button>
                ) : null}
                {canEditLead ? (
                  <Button
                    variant="outline"
                    onClick={() => setEditOpen(true)}
                    disabled={isMutating}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <div>
                <h2 className="text-sm font-semibold">Pipeline</h2>
                <p className="text-sm text-muted-foreground">
                  Leads move forward one stage at a time.
                </p>
              </div>
              <LeadStatusStepper status={lead.status} />
              {canAdvanceStatus ? (
                <LeadStatusAdvance
                  lead={lead}
                  disabled={isMutating}
                  onAdvanced={() => {
                    void dispatch(fetchStatusHistory(lead.id));
                  }}
                />
              ) : null}
            </div>

            <div className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm md:grid-cols-2">
              <DetailField label="Mobile" value={lead.mobileNumber} />
              <DetailField label="Email" value={lead.email} />
              <DetailField label="Source" value={lead.source} />
              <DetailField label="Project" value={lead.project} />
              <DetailField label="Created by" value={lead.createdBy.name} />
              <DetailField
                label="Created"
                value={formatDateTime(lead.createdAt)}
              />
            </div>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Status history</h2>
                <p className="text-sm text-muted-foreground">
                  Newest changes appear first.
                </p>
              </div>

              <LeadStatusHistory
                entries={statusHistory}
                isLoading={statusHistoryStatus === "loading"}
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Activity timeline</h2>
                  <p className="text-sm text-muted-foreground">
                    Newest interactions appear first.
                  </p>
                </div>
                {canLogActivity && isCurrentAssignee ? (
                  <Button
                    className="shrink-0"
                    onClick={() => setLogActivityOpen(true)}
                    disabled={isMutating}
                  >
                    Log activity
                  </Button>
                ) : null}
              </div>

              <ActivityTimeline
                activities={activities}
                isLoading={activitiesStatus === "loading"}
              />
            </section>

            <UpdateLeadDialog
              lead={lead}
              open={editOpen}
              onOpenChange={setEditOpen}
            />
            <AssignLeadDialog
              lead={lead}
              open={assignOpen}
              onOpenChange={setAssignOpen}
            />
            <LogActivityDialog
              leadId={lead.id}
              open={logActivityOpen}
              onOpenChange={setLogActivityOpen}
              onCreated={() => {
                void dispatch(fetchActivities(lead.id));
              }}
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Lead not found.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(`/leads${listSearch}`)}
            >
              Back to leads
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div>
    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {label}
    </p>
    <p className="mt-1 text-sm">{value?.trim() ? value : "—"}</p>
  </div>
);
