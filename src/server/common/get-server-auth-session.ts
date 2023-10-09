import { type GetServerSidePropsContext } from "next";

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */
// export const getServerAuthSession = async (ctx: {
//   req: GetServerSidePropsContext["req"];
//   res: GetServerSidePropsContext["res"];
// }) => {
//   return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
// };
