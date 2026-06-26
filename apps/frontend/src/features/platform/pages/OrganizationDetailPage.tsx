import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { EntityAvatar } from "@/components/EntityAvatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiClientError } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { Textarea } from "@/components/ui/textarea";

import { OrganizationStatusBadge } from "../components/OrganizationStatusBadge";
import { OrganizationModulesPanel } from "../components/OrganizationModulesPanel";
import { SuspendOrganizationDialog } from "../components/SuspendOrganizationDialog";
import {
  clearSelectedOrganization,
  fetchOrganization,
  updateOrganization,
  updateOrganizationStatus,
} from "../platformSlice";
import {
  selectIsPlatformMutating,
  selectOrganizationDetailError,
  selectOrganizationDetailStatus,
  selectSelectedOrganization,
} from "../platformSelectors";

const codePattern = /^[a-z0-9-]+$/;

const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  code: z
    .string()
    .min(1, "Organization code is required")
    .regex(
      codePattern,
      "Code must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type UpdateOrganizationFormValues = z.infer<typeof updateOrganizationSchema>;

type ApiRejection = {
  message: string;
  details?: { field?: string; message: string }[];
};

const isApiRejection = (value: unknown): value is ApiRejection => {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
};

export const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const listSearch =
    (location.state as { listSearch?: string } | null)?.listSearch ?? "";
  const organizationsListPath = `/platform/organizations${listSearch}`;
  const organization = useAppSelector(selectSelectedOrganization);
  const detailStatus = useAppSelector(selectOrganizationDetailStatus);
  const detailError = useAppSelector(selectOrganizationDetailError);
  const isMutating = useAppSelector(selectIsPlatformMutating);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const form = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      description: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    void dispatch(fetchOrganization(id));

    return () => {
      dispatch(clearSelectedOrganization());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!organization) {
      return;
    }

    form.reset({
      name: organization.name,
      code: organization.code,
      description: organization.description ?? "",
      logoUrl: organization.logoUrl ?? "",
    });
  }, [form, organization]);

  const applyApiFieldErrors = (
    details?: { field?: string; message: string }[],
  ) => {
    details?.forEach((detail) => {
      if (!detail.field) {
        return;
      }

      const fieldMap: Record<string, keyof UpdateOrganizationFormValues> = {
        name: "name",
        code: "code",
        description: "description",
        logoUrl: "logoUrl",
      };

      const formField = fieldMap[detail.field];

      if (formField) {
        form.setError(formField, { message: detail.message });
      }
    });
  };

  const onSubmit = async (values: UpdateOrganizationFormValues) => {
    if (!id) {
      return;
    }

    try {
      await dispatch(
        updateOrganization({
          id,
          input: {
            name: values.name.trim(),
            code: values.code.trim().toLowerCase(),
            description: values.description?.trim() || null,
            logoUrl: values.logoUrl?.trim() || null,
          },
        }),
      ).unwrap();

      toast.success("Organization updated");
    } catch (error) {
      if (isApiRejection(error)) {
        applyApiFieldErrors(error.details);
        toast.error(error.message);
        return;
      }

      toast.error("Failed to update organization");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!organization) {
      return;
    }

    try {
      const nextStatus =
        organization.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

      await dispatch(
        updateOrganizationStatus({
          id: organization.id,
          status: nextStatus,
        }),
      ).unwrap();

      toast.success(
        nextStatus === "SUSPENDED"
          ? "Organization suspended"
          : "Organization activated",
      );
      setStatusDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update organization status",
      );
    }
  };

  const isLoading =
    detailStatus === "idle" ||
    detailStatus === "loading" ||
    (detailStatus === "success" && !organization);

  if (!id) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Organization not found.
        </CardContent>
      </Card>
    );
  }

  if (detailStatus === "error") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={organizationsListPath}>
            <ArrowLeft className="size-4" />
            Back to organizations
          </Link>
        </Button>
        <Card className="shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="font-medium">Organization not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {detailError ?? "The organization may have been removed."}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(organizationsListPath)}
            >
              Return to list
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !organization) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link to={organizationsListPath}>
            <ArrowLeft className="size-4" />
            Back to organizations
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <EntityAvatar
              name={organization.name}
              imageUrl={organization.logoUrl}
              size="lg"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {organization.name}
                </h1>
                <OrganizationStatusBadge status={organization.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {organization.code}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(true)}
              disabled={isMutating}
            >
              {organization.status === "ACTIVE" ? "Suspend" : "Activate"}
            </Button>
            <Button
              onClick={() => void form.handleSubmit(onSubmit)()}
              disabled={isMutating || !form.formState.isDirty}
            >
              {isMutating ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <CardDescription>
            Update organization information and view metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
              className="grid gap-4 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.value.toLowerCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Users</p>
              <p className="mt-1 font-medium">{organization.userCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="mt-1 font-medium">
                {formatDateTime(organization.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last updated</p>
              <p className="mt-1 font-medium">
                {formatDateTime(organization.updatedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Product modules</CardTitle>
          <CardDescription>
            Enable or disable product modules for this organization. Changes
            apply to all users; login is never blocked. Users may need to
            refresh to see navigation updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationModulesPanel organizationId={organization.id} />
        </CardContent>
      </Card>

      <SuspendOrganizationDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        organizationName={organization.name}
        currentStatus={organization.status}
        isSubmitting={isMutating}
        onConfirm={() => void handleConfirmStatusChange()}
      />
    </div>
  );
};
