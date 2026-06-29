import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api-client";

import { assignLead } from "../leadsSlice";
import { leadsService } from "../leadsService";

import type { AssigneeOption, Lead } from "../leadsTypes";

type ApiRejection = {
  message: string;
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

type AssignLeadDialogProps = {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
};

export const AssignLeadDialog = ({
  lead,
  open,
  onOpenChange,
  onAssigned,
}: AssignLeadDialogProps) => {
  const dispatch = useAppDispatch();
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("none");

  useEffect(() => {
    if (!open || !lead) return;

    setSelectedAssigneeId(lead.assignedTo?.id ?? "none");
    let cancelled = false;
    setLoading(true);

    const loadAssignees = async () => {
      try {
        const users = await leadsService.listAssignableUsers(lead.team.id);
        if (!cancelled) {
          setAssignees(users);
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiClientError) {
            toast.error(error.message);
          } else {
            toast.error("Failed to load assignees");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadAssignees();

    return () => {
      cancelled = true;
    };
  }, [open, lead]);

  const handleAssign = async () => {
    if (!lead) return;

    setIsSubmitting(true);

    try {
      await dispatch(
        assignLead({
          leadId: lead.id,
          input: {
            assignedToId:
              selectedAssigneeId === "none" ? null : selectedAssigneeId,
          },
        }),
      ).unwrap();

      toast.success("Lead assignment updated");
      onOpenChange(false);
      onAssigned?.();
    } catch (error) {
      toast.error(
        isApiRejection(error) ? error.message : "Failed to update assignment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign lead</DialogTitle>
          <DialogDescription>
            Choose a team member to own this lead.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={selectedAssigneeId}
            onValueChange={setSelectedAssigneeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting || loading}>
            {isSubmitting ? "Saving..." : "Save assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
