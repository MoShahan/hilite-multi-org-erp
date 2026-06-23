import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createActivity } from "../leadsSlice";
import { ACTIVITY_TYPE_OPTIONS } from "../leadsTypes";

import type { ActivityType } from "../leadsTypes";

type ApiRejection = {
  message: string;
};

const isApiRejection = (value: unknown): value is ApiRejection =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

const activitySchema = z.object({
  type: z.string().min(1, "Activity type is required"),
  notes: z.string().min(1, "Notes are required"),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

type CreateActivityFormProps = {
  leadId: string;
  onCreated?: () => void;
};

export const CreateActivityForm = ({
  leadId,
  onCreated,
}: CreateActivityFormProps) => {
  const dispatch = useAppDispatch();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "NOTE",
      notes: "",
    },
  });

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      await dispatch(
        createActivity({
          leadId,
          input: {
            type: values.type as ActivityType,
            notes: values.notes.trim(),
          },
        }),
      ).unwrap();

      toast.success("Activity logged");
      form.reset({ type: values.type, notes: "" });
      onCreated?.();
    } catch (error) {
      toast.error(
        isApiRejection(error) ? error.message : "Failed to log activity",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACTIVITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What happened on this lead?"
                  className="min-h-24 resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Log activity</Button>
      </form>
    </Form>
  );
};
