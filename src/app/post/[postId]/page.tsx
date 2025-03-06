"use client"

import Comments from "@/components/Comments"
import Menu from "@/components/Menu"
import NotFound from "@/components/NotFound"
import { MarkdownRenderer } from "@/components/util"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface PostDTO {
    title: string,
    content: string,
    imageCount: number,
    author: string,
    createdDate: string,
    likes: number
}

export default function Post() {
    const params = useParams()
    const router = useRouter()

    const [exist, setExist] = useState(true)
    const [post, setPost] = useState<PostDTO>()

    const [isEntering, setIsEntering] = useState(false)
    const [isLiking, setIsLiking] = useState(false)

    const [comments, setComments] = useState(0)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${params.postId}`, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                const post = await res.json() as PostDTO
                post.content = post.content.replaceAll(/!\[(.*?)\]\(([0-9])\)/g, (match, text, number) => {
                    return `![${text}](${process.env.NEXT_PUBLIC_API_URL}/post/${params.postId}/${number})`
                })
                setPost(post)
            } else setExist(false)
        })

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${params.postId}/isLiking`, {
            credentials: 'include',
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setIsLiking(await res.text() == "true")
            }
        })
    }, [isLiking, params.postId])

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/${params.postId}/count`, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setComments(parseInt(await res.text()))
            }
        })
    }, [params.postId])

    function getLikeImage() {
        if (isLiking) return "/filled_heart.png"
        else return isEntering ? "/filled_heart.png" : "/empty_heart.png"
    }

    function like() {
        setIsLiking(!isLiking)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/${params.postId}/toggleLike`, {
            method: 'PATCH',
            credentials: 'include'
        })
    }

    return (
        <div>
            { !exist ? <NotFound></NotFound> :
            <div className="flex">
                <Menu></Menu>
                <main className="flex justify-center grow overflow-y-auto h-screen">
                    { post &&
                    <div className="my-32 max-w-[800px] h-fit">
                        <div className="flex items-center h-fit">
                            <div className="h-[22px] w-[22px] mr-4">
                                <button onClick={() => {router.back()}}>
                                    <Image src="/back.png" className="opacity-50 w-[22px] h-[22px] z-10" width={22} height={22} alt="back"/>
                                </button>
                            </div>
                            <h1 className="font-bold text-3xl text-wrap overflow-x-hidden text-pretty break-words w-[578px]">{post.title}</h1>
                        </div>
                        <div className="ml-10 mt-2 flex h-[28px] leading-[30px]">
                            <Link href={`/profile/${post.author}`} className="text-lg mr-3 hover:underline" >{post.author}</Link>
                            <div className="text-gray-400">{(new Date(post.createdDate)).toLocaleDateString("ko-KR", {year: "numeric", month: "long", day: "numeric"})}</div>
                        </div>
                        <div className="ml-10 mt-10">
                            <MarkdownRenderer text={post.content}></MarkdownRenderer>
                        </div>
                        <div className="border-b border-b-gray-400 ml-10 mt-8 mb-4"></div>
                        <div className="flex ml-10 text-[17px] items-center">
                            <div className="flex leading-[22px] h-[23px]">
                                <Image src={getLikeImage()} width={23} height={23} alt="like" className="h-[23px] w-[23px] cursor-pointer"
                                    onMouseEnter={() => {setIsEntering(true)}} onMouseLeave={() => {setIsEntering(false)}} onClick={like}></Image>
                                <span className="ml-2">{post.likes}</span>
                            </div>
                            <div className="flex leading-[26px] h-[28px] ml-6 cursor-pointer">
                                <Image src="/comment.png" width={28} height={28} alt="comment"></Image>
                                <span className="ml-2">{comments}</span>
                            </div>
                        </div>
                        <Comments postId={params.postId as string}/>
                    </div>}
                </main>
            </div>
            }
        </div>
    )
}