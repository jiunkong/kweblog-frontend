"use client"

import { PAGE_SIZE, Pagination } from "@/components/Pagination";
import Menu from "../components/Menu"
import { useEffect, useState } from "react";
import { makePosts, PostInfo } from "@/components/Post";
import { useRouter } from "next/navigation";

export default function Home() {
    const [page, setPage] = useState(1)
    const [postCount, setPostCount] = useState(0)
    const [postInfoList, setPostInfoList] = useState<PostInfo[]>([])

    const router = useRouter()

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/count`).then(async (res) => {
            if (res.ok) {
                setPostCount(parseInt(await res.text()))
            }
        })
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/userPosts?page=${page}`).then(async (res) => {
            if (res.ok) {
                setPostInfoList(await res.json())
            }
        })
    }, [page, postCount])

    return (
        <div className="flex">
            <Menu></Menu>
            <main className="h-screen overflow-y-auto grow">
                <div className="w-fit mx-auto my-12 text-3xl font-bold border-b-2">
                    최근 게시물
                </div>
                <article className="mb-32 grid mx-5 mt-8 flex flex-col max-w-[750px] mx-auto">
                    {makePosts(postInfoList, router.push)}
                    <Pagination currentPage={page} totalPages={Math.ceil(postCount / PAGE_SIZE)} onPageChange={setPage}/>
                </article>
            </main>
        </div>
    );
}
