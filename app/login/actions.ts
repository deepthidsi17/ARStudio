"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;
  const redirectUrl = formData.get("redirect") as string || "/admin";
  
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("ar_admin_token", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    
    redirect(redirectUrl);
  } else {
    redirect(`/login?error=Invalid password&redirect=${redirectUrl}`);
  }
}
