export function arrayEqual(arr1: unknown[], arr2: unknown[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((el, i) => el === arr2[i]);
}

export function parseHref(href: string) {
  const levels = href.split("/");
  if (href[0] === "/") levels.shift();
  if (href[href.length] === "/") levels.pop();
  return levels;
}

export function toRegExp(str: RegExp | string) {
  return str instanceof RegExp
    ? str
    : new RegExp(
        `^${str.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("*", ".*")}$`
      );
}

