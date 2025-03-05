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
    const [relation, setRelation] = useState(-2) // self: 2, friend: 1, pending: 0, nothing: -1, err: -2
    const [friendCount, setFriendCount] = useState(0)
    const [isModalOpened, setIsModalOpened] = useState(false)
    const [posts, setPosts] = useState<number[]>([])
    const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])

    const [updateCount, setUpdateCount] = useState(0)

    const scrollRef = useRef(null)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/introduction?username=${params.username}`).then(async (res) => {
            if (res.ok) {
                setIntroduction(await res.text())
            } else setExist(false)
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

    function loadRelation() {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/relation?username=${params.username}`, { credentials: 'include' }).then(async (res) => {
            if (res.ok) {
                setRelation(parseInt(await res.text()))
            }
        })
    }

    useEffect(() => {
        loadRelation()
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/friends`, { credentials: 'include' }).then(async (res) => {
            if (res.ok) {
                setFriendCount(parseInt(await res.text()))
            }
        })
    }, [])

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

    async function requestFriend() {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/requestFriend?username=${params.username}`, {
            credentials: 'include',
            method: 'POST'
        })
        loadRelation()
    }

    async function breakFriend() {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/breakFriend?username=${params.username}`, {
            credentials: 'include',
            method: 'POST'
        })
        loadRelation()
    }

    function relationBtn() {
        switch (relation) {
            case 2: 
                return <button className="bg-transparent border-white px-4 py-1 border rounded-lg hover:bg-white/10 ml-8" onClick={() => {setIsModalOpened(true)}}>프로필 수정</button>
            case 1:
                return <button className="bg-transparent px-4 py-1 border rounded-lg hover:bg-rose-600/5 ml-8 border-rose-600 text-rose-600" onClick={breakFriend}>서로이웃 해제</button>
            case 0:
                return <button className="bg-gray-500 border-gray-500 border px-4 py-1 rounded-lg ml-8 disabled cursor-default">서로이웃 요청됨</button>
            case -1:
                return <button className="bg-blue-600 border-blue-600 border px-4 py-1 rounded-lg hover:bg-blue-700 ml-8" onClick={requestFriend}>서로이웃 요청</button>
            default:
                return null
        }
    }
    
    return (
        <div>
            { !exist ? <NotFound></NotFound> :
            <div className="flex">
                <Menu updated={updateCount} updateFunc={loadRelation}></Menu>
                <main className="grow overflow-y-scroll h-screen">
                    <div className={`max-w-[750px] mx-auto`} ref={scrollRef}>
                        <header className="mt-32 flex h-[175px] pl-5">
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${params.username}&update=${updateCount}`} suppressHydrationWarning={true} className="rounded-full" width={175} height={175}></img>
                            <div className="ml-8 h-[175px] w-[650px]">
                                <div className="mb-2 flex">
                                    <div className="flex items-center">
                                        <span className="text-4xl font-bold">{params.username}</span>
                                        { relation === 1 && <span className="text-2xl text-gray-300 ml-2">(서로이웃)</span> }
                                    </div>
                                    {relationBtn()}
                                </div>         
                                <div className="font-light mb-3 text-[17px]">
                                    <span>{`${posts.length} 게시물`}</span>
                                    <span className="ml-3">{`${friendCount} 서로이웃`}</span>
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
            { isModalOpened && <EditProfile default={introduction} setIsOpened={setIsModalOpened} updateFunc={() => {setUpdateCount(prev => prev + 1)}}></EditProfile>}
        </div>
   )
}