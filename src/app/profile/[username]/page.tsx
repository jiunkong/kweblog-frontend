"use client"

import Menu from "@/components/Menu"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { linkifyAndBreak } from "@/components/util"
import EditProfile from "@/components/EditProfile"
import NotFound from "@/components/NotFound"

import { makePosts, PostInfo } from "@/components/Post"
import { PAGE_SIZE, Pagination } from "@/components/Pagination"

export default function Profile() {
    const params = useParams()
    const router = useRouter()

    const [exist, setExist] = useState(true)
    const [introduction, setIntroduction] = useState("")
    const [relation, setRelation] = useState(-2) // self: 2, friend: 1, pending: 0, nothing: -1, err: -2
    const [friendCount, setFriendCount] = useState(0)
    const [userPostCount, setUserPostCount] = useState(0)
    const [savedPostCount, setSavedPostCount] = useState(0)
    const [isModalOpened, setIsModalOpened] = useState(false)
    const [postInfoList, setPostInfoList] = useState<PostInfo[]>([])
    const [page, setPage] = useState(1)
    const [postType, setPostType] = useState("userPosts")

    const [updateCount, setUpdateCount] = useState(0)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/introduction?username=${params.username}`, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setIntroduction(await res.text())
            } else setExist(false)
        })
    }, [isModalOpened, params.username])

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/postCount?username=${params.username}&type=userPosts`, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setUserPostCount(parseInt(await res.text()))
            }
        })

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/postCount?username=${params.username}&type=savedPosts`, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setSavedPostCount(parseInt(await res.text()))
            }
        })

        const fetchPostsUrl = process.env.NEXT_PUBLIC_API_URL + ( postType === "userPosts" ? "/post/userPosts" : "/user/savedPosts" ) + `?page=${page}&username=${params.username}`
        fetch(fetchPostsUrl, {
            headers: {
                Accept: "application/json"
            }
        }).then(async (res) => {
            if (res.ok) {
                setPostInfoList(await res.json())
            }
        })
    }, [page, params.username, postType])

    function loadRelation() {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/relation?username=${params.username}`, { credentials: 'include', headers: {
            Accept: "application/json"
        } }).then(async (res) => {
            if (res.ok) {
                setRelation(parseInt(await res.text()))
            }
        })
    }

    useEffect(() => {
        loadRelation()
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/friends`, { credentials: 'include', headers: {
            Accept: "application/json"
        } }).then(async (res) => {
            if (res.ok) {
                setFriendCount(parseInt(await res.text()))
            }
        })
    }, [])

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
                <main className="grow overflow-y-auto h-screen">
                    <div className={`max-w-[750px] mx-auto`}>
                        <header className="mt-32 flex h-[175px] pl-5">
                            <img alt="profile" src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${params.username}&update=${updateCount}`} suppressHydrationWarning={true} className="rounded-full" width={175} height={175}></img>
                            <div className="ml-8 h-[175px] w-[650px]">
                                <div className="mb-2 flex">
                                    <div className="flex items-center">
                                        <span className="text-4xl font-bold">{params.username}</span>
                                        { relation === 1 && <span className="text-2xl text-gray-300 ml-2">(서로이웃)</span> }
                                    </div>
                                    {relationBtn()}
                                </div>         
                                <div className="font-light mb-3 text-[17px]">
                                    <span>{`${userPostCount} 게시물`}</span>
                                    <span className="ml-3">{`${friendCount} 서로이웃`}</span>
                                </div>
                                <p className="font-light text-[18px] overflow-y-auto text-wrap overflow-x-hidden text-pretty break-words h-[90px] w-[450px]">
                                    {linkifyAndBreak(introduction)}
                                </p>
                            </div>
                        </header>
                        <div className="text-center text-xl mt-8 flex justify-center">
                            <div className={`w-fit cursor-pointer ${postType === "userPosts" ? "border-b" : "text-gray-500"} ${relation === 2 ? "mr-4" : ""}`} onClick={() => setPostType("userPosts")}>게시물</div>
                            { relation === 2 && <div className={`w-fit cursor-pointer ${postType === "savedPosts" ? "border-b" : "text-gray-500"} ${relation === 2 ? "ml-4" : ""}`} onClick={() => setPostType("savedPosts")}>저장됨</div> }
                        </div>
                        <article className="mb-32 grid mx-5 mt-8 flex flex-col">
                            {makePosts(postInfoList, router.push)}
                            <Pagination currentPage={page} totalPages={ postType === "userPosts" ? Math.ceil(userPostCount / PAGE_SIZE) : Math.ceil(savedPostCount / PAGE_SIZE)} onPageChange={setPage}/>
                        </article>
                    </div>
                </main>
            </div>
            }
            { isModalOpened && <EditProfile default={introduction} setIsOpened={setIsModalOpened} updateFunc={() => {setUpdateCount(prev => prev + 1)}}></EditProfile>}
        </div>
   )
}