import prisma from "@/utils/connect"
import { NextResponse } from "next/server"

export const GET = async ({req, res}) => {
    const POST_PER_PAGE = 2;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");

    try {
        const posts = await prisma.post.findMany({
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (page - 1)
        });
        return new NextResponse(
            JSON.stringify({
                posts,
                status: 200
            })
        ) 

    } catch (err) {
        console.log(err)
        return new NextResponse(JSON.stringify({
            posts: "none",
            status: 500
        }))
    }
}