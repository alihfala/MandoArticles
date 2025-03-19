// Define standard Next.js route handler types
export type RouteContext<T extends Record<string, string>> = {
  params: T;
};

export type SlugRouteContext = RouteContext<{ slug: string }>; 