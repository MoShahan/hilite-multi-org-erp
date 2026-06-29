import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { updateLeadSchema, type UpdateLeadFormValues } from "../leadFormSchema";
import { updateLead } from "../leadsSlice";

import type { Lead } from "../leadsTypes";

type ApiRejection = {
  message: string;
  details?: { field?: string; message: string }[];
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

type UpdateLeadDialogProps = {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
};

export const UpdateLeadDialog = ({
  lead,
  open,
  onOpenChange,
  onUpdated,
}: UpdateLeadDialogProps) => {
  const dispatch = useAppDispatch();

  const form = useForm<UpdateLeadFormValues>({
    resolver: zodResolver(updateLeadSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      mobileNumber: "",
      email: "",
      source: "",
      project: "",
    },
  });

  useEffect(() => {
    if (!lead || !open) return;

    form.reset({
      name: lead.name,
      mobileNumber: lead.mobileNumber ?? "",
      email: lead.email ?? "",
      source: lead.source ?? "",
      project: lead.project ?? "",
    });
  }, [lead, open, form]);

  const onSubmit = async (values: UpdateLeadFormValues) => {
    if (!lead) return;

    try {
      await dispatch(
        updateLead({
          leadId: lead.id,
          input: {
            name: values.name.trim(),
            mobileNumber: values.mobileNumber.trim(),
            email: values.email?.trim() || null,
            source: values.source?.trim() || null,
            project: values.project?.trim() || null,
          },
        }),
      ).unwrap();

      toast.success("Lead updated");
      onOpenChange(false);
      onUpdated?.();
    } catch (error) {
      if (isApiRejection(error)) {
        error.details?.forEach((detail) => {
          if (detail.field) {
            form.setError(detail.field as keyof UpdateLeadFormValues, {
              message: detail.message,
            });
          }
        });
        toast.error(error.message);
      } else {
        toast.error("Failed to update lead");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit lead</DialogTitle>
          <DialogDescription>Update lead contact and details.</DialogDescription>
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
                    <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
