import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  selectAuthUser,
  selectHasPermission,
} from "@/features/auth/authSelectors";
import { teamsService } from "@/features/teams/teamsService";

import { createLead } from "../leadsSlice";
import { leadsService } from "../leadsService";

import type { AssigneeOption, TeamFilterOption } from "../leadsTypes";

type ApiRejection = {
  message: string;
  details?: { field?: string; message: string }[];
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]),
  source: z.string().optional(),
  project: z.string().optional(),
  teamId: z.string().optional(),
  assignedToId: z.string().optional(),
});

type CreateLeadFormValues = z.infer<typeof createLeadSchema>;

const defaultValues: CreateLeadFormValues = {
  name: "",
  mobileNumber: "",
  email: "",
  source: "",
  project: "",
  teamId: "",
  assignedToId: "",
};

type CreateLeadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export const CreateLeadDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateLeadDialogProps) => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const canPickTeam = useAppSelector(selectHasPermission("leads:read:org"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<TeamFilterOption[]>([]);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [assigneesLoading, setAssigneesLoading] = useState(false);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    mode: "onChange",
    defaultValues,
  });

  const selectedTeamId = canPickTeam
    ? form.watch("teamId")
    : authUser?.team?.id ?? "";

  useEffect(() => {
    if (!open || !canPickTeam) return;

    let cancelled = false;
    setTeamsLoading(true);

    void teamsService
      .listTeams({
        search: "",
        membership: "ALL",
        sortBy: "name",
        sortOrder: "asc",
        page: 1,
        pageSize: 100,
      })
      .then((result) => {
        if (!cancelled) {
          setTeams(result.teams.map((team) => ({ id: team.id, name: team.name })));
        }
      })
      .finally(() => {
        if (!cancelled) setTeamsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, canPickTeam]);

  useEffect(() => {
    if (!open || !selectedTeamId) {
      setAssignees([]);
      return;
    }

    let cancelled = false;
    setAssigneesLoading(true);

    void leadsService
      .listAssignableUsers(selectedTeamId)
      .then((result) => {
        if (!cancelled) {
          setAssignees(
            result.users.map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
            })),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAssigneesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, selectedTeamId]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset(defaultValues);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: CreateLeadFormValues) => {
    setIsSubmitting(true);

    try {
      await dispatch(
        createLead({
          name: values.name.trim(),
          mobileNumber: values.mobileNumber.trim(),
          email: values.email?.trim() || undefined,
          source: values.source?.trim() || undefined,
          project: values.project?.trim() || undefined,
          teamId: canPickTeam ? values.teamId : authUser?.team?.id,
          assignedToId: values.assignedToId || null,
        }),
      ).unwrap();

      toast.success("Lead created");
      form.reset(defaultValues);
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      if (isApiRejection(error)) {
        error.details?.forEach((detail) => {
          if (detail.field) {
            form.setError(detail.field as keyof CreateLeadFormValues, {
              message: detail.message,
            });
          }
        });
        toast.error(error.message);
      } else {
        toast.error("Failed to create lead");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add lead</DialogTitle>
          <DialogDescription>
            Create a new lead and optionally assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lead name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        inputMode="numeric"
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Website, referral..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <Input placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {canPickTeam ? (
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    {teamsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("assignedToId", "");
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            {selectedTeamId ? (
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned user (optional)</FormLabel>
                    {assigneesLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? "" : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                        </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
