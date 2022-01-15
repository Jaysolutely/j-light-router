import { createRouter } from "../src";

describe("Basics", () => {
  window.history.pushState({}, "", "http://localhost/app/profile");
  const router = createRouter({
    routes: [
      "/app/dashboard",
      "/app/profile",
      "/app/profile/*",
      "/app/characters/*",
    ],
    fallback: "/app/fallback",
    mappings: [["/app", "app/dashboard"]],
    extended: ["/app/characters/*"],
  });
  let result = router.getRoute();
  router.on("routechange", (levels) => {
    result = levels;
  });
  test("initital route", () => {
    expect(result).toStrictEqual(["app", "profile"]);
  });
  test("recognize included route", () => {
    router.push("/app/dashboard");
    expect(result).toStrictEqual(["app", "dashboard"]);
  });
  test("use fallback on unknown route", () => {
    router.push("/app/non/existent");
    expect(result).toStrictEqual(["app", "fallback"]);
  });
  test("recognize wildcard route", () => {
    router.push("/app/characters/mychar");
    expect(result).toStrictEqual(["app", "characters", "mychar"]);
  });
  test("use mapping before fallback", () => {
    router.push("/app");
    expect(result).toStrictEqual(["app", "dashboard"]);
  });
  test("extending visited url, when specified", () => {
    router.push("/app/characters/arthus/equipment/backpack");
    expect(result).toStrictEqual([
      "app",
      "characters",
      "arthus",
      "equipment",
      "backpack",
    ]);
    router.push("/app/profile");
    router.push("/app/characters/arthus");
    expect(result).toStrictEqual([
      "app",
      "characters",
      "arthus",
      "equipment",
      "backpack",
    ]);
  });
  test("do not extend visited url, when not specified", () => {
    router.push("/app/profile/friends/nostradamus");
    expect(result).toStrictEqual(["app", "profile", "friends", "nostradamus"]);
    router.push("/app/profile/friends");
    expect(result).toStrictEqual(["app", "profile", "friends"]);
  });
});
