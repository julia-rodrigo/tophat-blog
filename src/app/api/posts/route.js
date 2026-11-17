import prisma from "@/utils/connect"
import { NextResponse } from "next/server"

export const GET = async (req) => {
    const POST_PER_PAGE = 2;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;

    try {
        const posts = await prisma.post.findMany({
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1)
        });
        return NextResponse.json({ posts }, { status: 200 });

    } catch (err) {
        console.log(err)
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}