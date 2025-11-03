import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUsersCollection } from "@/app/libs/collection";
import { NextResponse } from "next/server";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const email = session.user.email;
  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { user, email };
}
