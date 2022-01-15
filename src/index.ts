import { createRouteTree } from "./routeTree";
import * as util from "./util";

export interface RouterOptions {
  routes?: (RegExp | string)[];
  fallback?: string;
  mappings?: [RegExp | string, string][];
  extended?: (RegExp | string)[];
}

interface RouterProperties {
  routes: RegExp[];
  route: string[];
  subscriptions: {
    routechange: ((route: string[]) => void)[];
    routesame: ((route: string[]) => void)[];
  };
  fallback: string[] | undefined;
  mappings: [RegExp, string[]][] | undefined;
  extended: RegExp[];
  routeTree: ReturnType<typeof createRouteTree>;
}


export function createRouter({
  routes,
  fallback,
  mappings,
  extended,
}: RouterOptions = {}) {
  const props: RouterProperties = {
    routes: (routes || ["*"]).map(util.toRegExp),
    route: [],
    subscriptions: {
      routechange: [],
      routesame: [],
    },
    fallback: fallback ? util.parseHref(fallback) : undefined,
    mappings: mappings
      ? mappings.map(([source, target]) => [
          util.toRegExp(source),
          util.parseHref(target),
        ])
      : undefined,
    extended: (extended || []).map(util.toRegExp),
    routeTree: createRouteTree(),
  };

  function interpretHref(href: string): string[] {
    const { routes, fallback, mappings } = props;
    const routeMatched = routes.some((route) => route.test(href));
    if (routeMatched) return util.parseHref(href);
    if (mappings) {
      const mappingMatches = mappings.filter(([source]) => source.test(href));
      if (mappingMatches.length > 0) {
        const [, target] = mappingMatches[0];
        return target;
      }
    }
    if (fallback) return fallback;
    return util.parseHref(href);
  }
  function setRoute(levels: string[], extend = false) {
    const usedLevels = extend ? props.routeTree.extend(levels) : levels;
    props.routeTree.save(usedLevels);
    props.route = usedLevels;
    props.subscriptions.routechange.forEach((fun) => fun(usedLevels));
  }
  function push(href: string): void {
    const levels = interpretHref(href);
    if (util.arrayEqual(levels, props.route)) {
      props.subscriptions.routesame.forEach((fun) => fun(levels));
      return;
    }
    history.pushState({ levels }, "", `/${levels.join("/")}`);
    const extend = props.extended.some((regExp) => regExp.test(href));
    setRoute(levels, extend);
  }
  function interceptHref(event: MouseEvent) {
    if (!event.currentTarget) return;
    const currentTarget = event.currentTarget as HTMLAnchorElement;
    if (currentTarget.tagName !== "A") return;
    if (currentTarget.pathname[0] !== "/") return;
    event.preventDefault();
    push(currentTarget.pathname);
  }
  function on(
    eventName: keyof typeof props.subscriptions,
    fun: (route: string[]) => void
  ): void {
    props.subscriptions[eventName].push(fun);
  }
  function getRoute() {
    return props.route;
  }

  const initialHref = new URL(window.location.toString()).pathname;
  const inititalLevels = interpretHref(initialHref);
  history.replaceState(
    { levels: inititalLevels },
    "",
    `/${inititalLevels.join("/")}`
  );
  setRoute(inititalLevels);

  return {
    interceptHref,
    push,
    on,
    getRoute,
  };
}
