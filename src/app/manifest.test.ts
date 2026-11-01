import manifest from "./manifest";

describe("web app manifest", () => {
  it("is Hebrew, RTL, standalone and starts at the home screen", () => {
    expect(manifest()).toMatchObject({
      name: "חכמולוגים",
      short_name: "חכמולוגים",
      lang: "he",
      dir: "rtl",
      display: "standalone",
      start_url: "/",
    });
  });

  it("lists 192 and 512 icons plus a maskable one", () => {
    const icons = manifest().icons ?? [];
    expect(icons.map((icon) => icon.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"]),
    );
    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
  });
});
