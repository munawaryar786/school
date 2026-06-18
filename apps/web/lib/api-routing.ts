const defaultApiUrl = "http://localhost:4000";

export function backendUrl(path: string, search = "") {
  const base = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}${search}`;
}

export function backendModuleUrl(modulePath: string, path: string[], search = "") {
  return backendUrl(`/v1/${modulePath}/${path.join("/")}`, search);
}
