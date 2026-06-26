import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { selectDashboardLayoutMutationStatus } from "../dashboardSelectors";
import {
  resetDashboardLayout,
  updateDashboardLayout,
} from "../dashboardSlice";

import type {
  DashboardLayoutItem,
  DashboardLayoutResponse,
} from "../dashboardLayoutTypes";

type CustomizeDashboardSheetProps = {
  layout: DashboardLayoutResponse;
};

type SortableWidgetRowProps = {
  item: DashboardLayoutItem;
  label: string;
  description: string;
  onToggleVisible: (key: DashboardLayoutItem["key"], visible: boolean) => void;
};

const SortableWidgetRow = ({
  item,
  label,
  description,
  onToggleVisible,
}: SortableWidgetRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm",
        isDragging && "opacity-70 shadow-md",
      )}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Checkbox
        id={`widget-${item.key}`}
        checked={item.visible}
        onCheckedChange={(checked) =>
          onToggleVisible(item.key, checked === true)
        }
      />
      <div className="min-w-0 flex-1 space-y-1">
        <Label
          htmlFor={`widget-${item.key}`}
          className="cursor-pointer font-medium"
        >
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export const CustomizeDashboardSheet = ({
  layout,
}: CustomizeDashboardSheetProps) => {
  const dispatch = useAppDispatch();
  const layoutMutationStatus = useAppSelector(
    selectDashboardLayoutMutationStatus,
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DashboardLayoutItem[]>(layout.widgets);

  const isSaving = layoutMutationStatus === "loading";
  const isResetting = layoutMutationStatus === "loading";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (open) {
      setDraft(layout.widgets);
    }
  }, [layout.widgets, open]);

  const catalogByKey = new Map(
    layout.catalog.map((item) => [item.key, item]),
  );

  const sortedDraft = [...draft].sort((a, b) => a.order - b.order);

  const handleToggleVisible = (
    key: DashboardLayoutItem["key"],
    visible: boolean,
  ) => {
    setDraft((current) =>
      current.map((item) =>
        item.key === key ? { ...item, visible } : item,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setDraft((current) => {
      const ordered = [...current].sort((a, b) => a.order - b.order);
      const oldIndex = ordered.findIndex((item) => item.key === active.id);
      const newIndex = ordered.findIndex((item) => item.key === over.id);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      return arrayMove(ordered, oldIndex, newIndex).map((item, order) => ({
        ...item,
        order,
      }));
    });
  };

  const handleSave = async () => {
    if (!draft.some((item) => item.visible)) {
      toast.error("Enable at least one widget");
      return;
    }

    const normalized = [...draft]
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }));

    try {
      await dispatch(updateDashboardLayout(normalized)).unwrap();
      setOpen(false);
      toast.success("Dashboard layout saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save layout",
      );
    }
  };

  const handleReset = async () => {
    try {
      const saved = await dispatch(resetDashboardLayout()).unwrap();
      setDraft(saved.widgets);
      toast.success("Dashboard reset to default");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset layout",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Customize dashboard</SheetTitle>
          <SheetDescription>
            Choose which sections appear and drag to reorder them.
          </SheetDescription>
        </SheetHeader>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedDraft.map((item) => item.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
              {sortedDraft.map((item) => {
                const catalogItem = catalogByKey.get(item.key);

                return (
                  <SortableWidgetRow
                    key={item.key}
                    item={item}
                    label={catalogItem?.label ?? item.key}
                    description={catalogItem?.description ?? ""}
                    onToggleVisible={handleToggleVisible}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <SheetFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleReset()}
            disabled={isSaving || isResetting}
          >
            {isResetting ? "Resetting…" : "Reset to default"}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || isResetting}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
