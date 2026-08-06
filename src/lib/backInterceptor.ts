/**
 * A stack of "swallow the next Android back press" handlers.
 *
 * Every `useAndroidBackButton` call registers its own native listener, so if a
 * sheet registered one too, MobileShell's navigation handler would still fire
 * alongside it — back would dismiss the sheet *and* pop the route. Instead,
 * transient overlays push an interceptor here and the shell consults this
 * stack before doing anything else.
 *
 * Last-in wins, so nested overlays unwind in the order the user opened them.
 */
const stack: (() => void)[] = [];

/** Registers `fn` as the topmost back handler; call the result to unregister. */
export function pushBackInterceptor(fn: () => void): () => void {
  stack.push(fn);
  return () => {
    const index = stack.lastIndexOf(fn);
    if (index !== -1) stack.splice(index, 1);
  };
}

/**
 * Runs the topmost interceptor, if any. Returns true when the press was
 * consumed and the caller should do nothing further.
 */
export function consumeBackPress(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top();
  return true;
}
