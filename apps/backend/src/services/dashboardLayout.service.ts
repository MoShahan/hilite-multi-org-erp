import {
  type DashboardLayoutItem,
  type DashboardWidgetKey,
  getDefaultLayoutForView,
  getWidgetCatalogForView,
  isValidWidgetKeyForView,
} from "../constants/dashboardWidgets";
import { dashboardLayoutRepository } from "../repositories/dashboardLayout.repository";
import { AppError } from "../utils/AppError";

import {
  resolveDashboardView,
  type DashboardView,
} from "./dashboardAccess.service";

import type { AuthUser } from "../types/auth";
import type { DashboardLayoutResponse } from "../types/dashboardLayout";

const parseStoredWidgets = (value: unknown): DashboardLayoutItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.key !== "string" ||
      typeof item.order !== "number" ||
      typeof item.visible !== "boolean"
    ) {
      return [];
    }

    return [
      {
        key: item.key as DashboardWidgetKey,
        order: item.order,
        visible: item.visible,
      },
    ];
  });
};

const mergeLayoutWithCatalog = (
  view: DashboardView,
  savedWidgets: DashboardLayoutItem[],
): DashboardLayoutItem[] => {
  const catalog = getWidgetCatalogForView(view);
  const catalogKeys = new Set(catalog.map((item) => item.key));
  const savedByKey = new Map(
    savedWidgets
      .filter((item) => catalogKeys.has(item.key))
      .map((item) => [item.key, item]),
  );

  const merged = catalog.map((catalogItem, index) => {
    const saved = savedByKey.get(catalogItem.key);
    return {
      key: catalogItem.key,
      order: saved?.order ?? index,
      visible: saved?.visible ?? true,
    };
  });

  return merged
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order }));
};

const normalizeWidgets = (
  widgets: DashboardLayoutItem[],
): DashboardLayoutItem[] =>
  [...widgets]
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order }));

export const dashboardLayoutService = {
  getLayout: async (authUser: AuthUser): Promise<DashboardLayoutResponse> => {
    const view = resolveDashboardView(authUser);
    const catalog = getWidgetCatalogForView(view);
    const stored = await dashboardLayoutRepository.findByUserId(authUser.id);

    if (!stored || stored.view !== view) {
      return {
        view,
        widgets: getDefaultLayoutForView(view),
        catalog,
      };
    }

    return {
      view,
      widgets: mergeLayoutWithCatalog(view, parseStoredWidgets(stored.widgets)),
      catalog,
    };
  },

  updateLayout: async (
    authUser: AuthUser,
    widgets: DashboardLayoutItem[],
  ): Promise<DashboardLayoutResponse> => {
    const view = resolveDashboardView(authUser);
    const catalog = getWidgetCatalogForView(view);

    if (!Array.isArray(widgets) || widgets.length === 0) {
      throw AppError.badRequest("At least one widget must be provided", [
        { field: "widgets", message: "Widgets array is required" },
      ]);
    }

    const invalidKeys = widgets
      .map((item) => item.key)
      .filter((key) => !isValidWidgetKeyForView(view, key));

    if (invalidKeys.length > 0) {
      throw AppError.badRequest("Invalid widget key", [
        {
          field: "widgets",
          message: `Unknown widget keys for ${view} view: ${invalidKeys.join(", ")}`,
        },
      ]);
    }

    const normalized = normalizeWidgets(widgets);

    if (!normalized.some((item) => item.visible)) {
      throw AppError.badRequest("At least one widget must be visible", [
        { field: "widgets", message: "Enable at least one widget" },
      ]);
    }

    const expectedKeys = new Set(catalog.map((item) => item.key));
    const providedKeys = new Set(normalized.map((item) => item.key));

    if (
      expectedKeys.size !== providedKeys.size ||
      [...expectedKeys].some((key) => !providedKeys.has(key))
    ) {
      throw AppError.badRequest("Layout must include all widgets for the view", [
        {
          field: "widgets",
          message: "Provide every widget key defined for this dashboard view",
        },
      ]);
    }

    await dashboardLayoutRepository.upsert(authUser.id, view, normalized);

    return {
      view,
      widgets: normalized,
      catalog,
    };
  },

  resetLayout: async (authUser: AuthUser): Promise<DashboardLayoutResponse> => {
    const view = resolveDashboardView(authUser);
    const widgets = getDefaultLayoutForView(view);

    await dashboardLayoutRepository.upsert(authUser.id, view, widgets);

    return {
      view,
      widgets,
      catalog: getWidgetCatalogForView(view),
    };
  },
};
