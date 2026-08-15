import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const response = NextResponse.redirect(new URL('/shelf', request.url));

  if (!request.cookies.get("session")) {
    response.cookies.set("session", "fake-value");
  }

  return response;
}