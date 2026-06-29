import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { ListPagination } from "./ListPagination";
import { renderWithProviders } from "@/test/render";

describe("ListPagination", () => {
  it("does not change page when previous is clicked on the first page", () => {
    const onPageChange = vi.fn();

    renderWithProviders(
      <ListPagination
        page={1}
        pageSize={10}
        totalPages={3}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /previous/i }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("does not change page when next is clicked on the last page", () => {
    const onPageChange = vi.fn();

    renderWithProviders(
      <ListPagination
        page={3}
        pageSize={10}
        totalPages={3}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /next/i }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("changes page when previous and next are enabled", () => {
    const onPageChange = vi.fn();

    renderWithProviders(
      <ListPagination
        page={2}
        pageSize={10}
        totalPages={3}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: /previous/i }));
    fireEvent.click(screen.getByRole("link", { name: /next/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
