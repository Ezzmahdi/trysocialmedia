import { authMiddleware } from "@clerk/nextjs/server";


export default authMiddleware({
  publicRoutes: ['/','pricing',"/api/webhook"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
}; 