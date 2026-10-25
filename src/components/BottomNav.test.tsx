import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BottomNav from "./BottomNav";

const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname() }));

describe("BottomNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
  });

  it("shows exactly three destinations in order", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "ניווט ראשי" });
    const links = within(nav).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(["בית", "טריוויה", "אודות"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "/trivia", "/about"]);
  });

  it("marks the current destination as active", () => {
    mockPathname.mockReturnValue("/about");
    render(<BottomNav />);

    expect(screen.getByRole("link", { name: "אודות" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "בית" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "טריוויה" })).not.toHaveAttribute("aria-current");
  });
});
