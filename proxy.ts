import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest){
    console.log("Hi");
    const hasSession = request.cookies.get("session");
    if(!hasSession){
        return NextResponse.redirect(new URL("/", request.url));
    }
}

export const config = {
    matcher: ["/shelf"],
}