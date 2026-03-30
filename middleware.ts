import authMiddleware from "next-auth/middleware";

export default authMiddleware;

export const config = {
  matcher: ["/", "/tasks/:path*", "/ai-chat/:path*", "/workflows/:path*", "/settings/:path*"],
};
