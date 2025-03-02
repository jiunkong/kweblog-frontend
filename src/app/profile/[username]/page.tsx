"use client"

import Menu from "@/components/Menu"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { linkifyAndBreak } from "@/components/util"
import EditProfile from "@/components/EditProfile"
import NotFound from "@/components/NotFound"

import { Post, Thumbnail } from "@/components/Post"

const LOAD_COUNT = 5
export default function Profile() {
    const params = useParams()
    const router = useRouter()

    const [exist, setExist] = useState(true)
    const [introduction, setIntroduction] = useState("")
    const [self, setSelf] = useState(false)
    const [isModalOpened, setIsModalOpened] = useState(false)
    const [posts, setPosts] = useState<number[]>([])
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])

    const [profileUpdated, setProfileUpdated] = useState(0)

    const scrollRef = useRef(null)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/introduction?username=${params.username}`).then(async (res) => {
            if (res.ok) {
                setIntroduction(await res.text())
            } else setExist(false)
        })
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/isSelf?username=${params.username}`, { credentials: 'include' }).then(async (res) => {
            if (res.ok && await res.text() == 'true') {
                setSelf(true)   
            }
        })
    }, [isModalOpened])

    async function loadThumbnail() {
        if (posts.length == thumbnails.length) return

        const newThumbnails: Thumbnail[] = []
        const tasks = []
        const count = Math.min(LOAD_COUNT, posts.length - thumbnails.length)
        for (let i = 0; i < count; i++) {
            tasks.push(fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/thumbnail?postId=${posts[thumbnails.length + i]}`))
        }

        const resList = await Promise.all(tasks)
        
        for (const res of resList) {
            if (res.ok) {
                newThumbnails.push(await res.json())
            }
        }
        
        setThumbnails([...thumbnails, ...newThumbnails])
    }

    useEffect(() => {
        if (posts.length == 0) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/userPosts?username=${params.username}`).then(async (res) => {
                if (res.ok) {
                    const p = await res.json() as number[]
                    if (p.length > 0) setPosts(p)
                }
            })
        }
        loadThumbnail()
    }, [posts])

    const scrollEndRef = useRef(null)
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadThumbnail()
            }
        }, {
            threshold: 0
        })
        if (scrollEndRef.current) observer.observe(scrollEndRef.current)

        return () => observer.disconnect()
    })

    function makePosts() {
        const result = []
        for (let i = 0; i < thumbnails.length; i++) {
            result.push(
                <Post postId={posts[i]} thumbnail={thumbnails[i]} push={router.push} final={i == thumbnails.length - 1} key={posts[i]}/>
            )
        }
        result.push(<div key={0} className="h-1" ref={scrollEndRef}></div>)

        return result
    }
    
    return (
        <div>
            { !exist ? <NotFound></NotFound> :
            <div className="flex">
                <Menu updated={profileUpdated}></Menu>
                <main className="grow overflow-y-scroll h-screen">
                    <div className={`max-w-[750px] mx-auto`} ref={scrollRef}>
                        <header className="mt-32 flex h-[175px] pl-5">
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${params.username}&update=${profileUpdated}`} suppressHydrationWarning={true} className="rounded-full" width={175} height={175}></img>
                            <div className="ml-8 h-[175px] w-[650px]">
                                <div className="mb-2 flex">
                                    <div className="text-4xl font-bold">
                                        {params.username}
                                    </div>
                                    { self && <button className="bg-transparent border-white px-4 py-1 border rounded-lg hover:bg-white/10 ml-8" onClick={() => {setIsModalOpened(true)}}>프로필 수정</button> }
                                </div>         
                                <div className="font-light mb-3 text-[17px]">
                                    {`${posts.length} 게시물`}
                                </div>
                                <p className="font-light text-[18px] overflow-y-auto text-wrap overflow-x-hidden text-pretty break-words h-[90px] w-[450px]">
                                    {linkifyAndBreak(introduction)}
                                </p>
                            </div>
                        </header>
                        <div className="text-center text-xl mt-8">
                            <div className="w-fit mx-auto border-b">게시물</div>
                        </div>
                        <article className="mb-32 grid mx-5 mt-8 flex flex-col">
                            {makePosts()}
                        </article>
                    </div>
                </main>
            </div>
            }
            { isModalOpened && <EditProfile default={introduction} setIsOpened={setIsModalOpened}></EditProfile>}
        </div>
   )
}