import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/app/libs/googleSheet";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    // 🧩 1️⃣ Create or enrich JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || token.sub;
        token.email = user.email || "";
        token.name = user.name || "";
        token.image = user.image || "";
        token.role = "viewer"; // default role until Sheet says otherwise
      }

      try {
        if (token.email) {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser?.role) {
            token.role = dbUser.role;
          }
        }
      } catch (err) {
        console.error("fetch failed:", err);
      }

      return token;
    },

    // 🧩 2️⃣ Attach token fields to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // 🧩 3️⃣ Create or update user in Sheets on sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await getUserByEmail(user.email);

        if (!existingUser) {
          await createUser({
            name: user.name || "",
            email: user.email,
            image: user.image || "",
            role: "viewer",
          });
        }
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
