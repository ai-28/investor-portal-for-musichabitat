/** Maps internal route keys (legacy) to Next.js paths. */
export const ROUTE_PATHS: Record<string, string> = {
  page1: "/",
  gate_ff: "/gate/friends-family",
  gate_private: "/gate/private",
  nda_ff: "/nda/friends-family",
  nda_private: "/nda/private",
  execsum_reader: "/exec-summary",
  page2: "/step/2",
  page3: "/step/3",
  page4: "/step/4",
  page5: "/step/5",
  page6: "/step/6",
  page7: "/step/7",
  page8: "/step/8",
  page9: "/step/9",
  page10: "/step/10",
  page11: "/step/11",
  page12: "/step/12",
  page13: "/step/13",
  pp_welcome_ceo: "/private/welcome",
  pp_overview: "/private/overview",
  pp_docs: "/private/docs",
  pp_qa: "/private/qa",
  pp_apply: "/private/apply",
  pp_reserve: "/private/reserve",
  pp_ack: "/private/ack",
  pp_sign: "/private/sign",
  pp_fund: "/private/fund",
  pp_welcome: "/private/complete",
  pp_call: "/private/call",
};

export function pathToRoute(pathname: string | null): string {
  if (!pathname || pathname === "/") return "page1";
  if (pathname === "/exec-summary") return "execsum_reader";
  if (pathname === "/gate/friends-family") return "gate_ff";
  if (pathname === "/gate/private") return "gate_private";
  if (pathname === "/nda/friends-family") return "nda_ff";
  if (pathname === "/nda/private") return "nda_private";
  if (pathname === "/private/welcome") return "pp_welcome_ceo";
  if (pathname === "/private/overview") return "pp_overview";
  if (pathname === "/private/docs") return "pp_docs";
  if (pathname === "/private/qa") return "pp_qa";
  if (pathname === "/private/apply") return "pp_apply";
  if (pathname === "/private/reserve") return "pp_reserve";
  if (pathname === "/private/ack") return "pp_ack";
  if (pathname === "/private/sign") return "pp_sign";
  if (pathname === "/private/fund") return "pp_fund";
  if (pathname === "/private/complete") return "pp_welcome";
  if (pathname === "/private/call") return "pp_call";
  const doc = pathname.match(/^\/docs\/(.+)$/);
  if (doc) return `doc_view:${doc[1]}`;
  const step = pathname.match(/^\/step\/(\d+)$/);
  if (step) return `page${step[1]}`;
  return "page1";
}

export function routeToPath(route: string): string {
  if (route.startsWith("doc_view:")) {
    return `/docs/${route.slice("doc_view:".length)}`;
  }
  return ROUTE_PATHS[route] ?? "/";
}
