interface RouteTree {
  counter: number;
  leaves: Record<string, RouteTree>;
}

export function createRouteTree() {
  let routeTree: RouteTree = {
    counter: 0,
    leaves: {},
  };

  function extendFromTreeStage2(tree: RouteTree): string[] {
    const leaves = Object.entries(tree.leaves);
    if (leaves.length === 0) return [];
    const rootCounter = tree.counter;
    const [matchedLevel, matchedLeaf] = leaves.filter(
      ([, leaf]) => leaf.counter === rootCounter
    )[0];
    return [matchedLevel, ...extendFromTreeStage2(matchedLeaf)];
  }

  function extendFromTreeStage1<T extends true | undefined>(
    levels: string[],
    tree: RouteTree,
    root?: T
  ): T extends true ? string[] : string[] | false {
    if (levels.length === 0) return extendFromTreeStage2(tree);
    const [head, ...tail] = levels;
    if (head in tree.leaves) {
      const result = extendFromTreeStage1(tail, tree.leaves[head]);
      if (result !== false) return [head, ...result];
    }
    return root
      ? levels
      : (false as T extends true ? string[] : string[] | false);
  }

  function buildHistory(
    levels: string[],
    stored: RouteTree,
    counter: number
  ): RouteTree {
    const [first, ...tail] = levels;
    return {
      counter,
      leaves: {
        ...stored.leaves,
        [first]:
          tail.length === 0
            ? { counter, leaves: {} }
            : buildHistory(tail, stored.leaves?.[first] || {}, counter),
      },
    };
  }
  
  function save(levels: string[]) {
    if (levels.length === 0) return;
    routeTree = buildHistory(levels, routeTree, routeTree.counter + 1);
  }

  function extend(levels: string[]): string[] {
    return extendFromTreeStage1(levels, routeTree, true);
  }

  return { save, extend };
}
