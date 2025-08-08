import { NextRequest, NextResponse } from "next/server";
// Sanity preview removed

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Check the secret and next parameters
  if (secret !== process.env.SANITY_PREVIEW_SECRET || !slug) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    // Verify the slug exists in Sanity
    const document = await previewClient.fetch(`*[slug.current == $slug][0]`, {
      slug,
    });

    if (!document) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 401 });
    }

    // Create the response with preview cookies
    const response = NextResponse.redirect(new URL(`/${slug}`, request.url));

    // Set preview cookies
    response.cookies.set("__prerender_bypass", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set("__next_preview_data", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Preview mode error:", error);
    return NextResponse.json(
      { message: "Error enabling preview mode" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Exit preview mode
  const response = NextResponse.json({ message: "Preview mode disabled" });

  response.cookies.set("__prerender_bypass", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 0,
  });

  response.cookies.set("__next_preview_data", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 0,
  });

  return response;
}
