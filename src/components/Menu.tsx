"use client"

import Image from "next/image";
import styles from "./Menu.module.css"
import { useState, useEffect, Fragment, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NotificationType = "comment" | "like" | "request" | "requested" | "accepted" | "broken"
interface Notification {
    id: number
    type: NotificationType,
    sender: string,
    postId?: number,
    accepted?: boolean
}
function NotificationComponent(props: {notification: Notification, load: () => void, updateFunc?: () => void}) {
    async function acceptFriend() {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/acceptFriend?nid=${props.notification.id}`, {
            credentials: 'include',
            method: 'POST'
        })
        props.load()
        if (props.updateFunc) props.updateFunc()
    }

    let content
    switch (props.notification.type) {
        case "comment":
            content = <div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님이 `}</span>
                <Link href={`/post/${props.notification.postId}`} className="hover:underline font-bold">게시물</Link>
                <span>{`에 댓글을 달았습니다.`}</span>
            </div>
            break
        case "like":
            content = <div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님이 `}</span>
                <Link href={`/post/${props.notification.postId}`} className="hover:underline font-bold">게시물</Link>
                <span>{`에 좋아요를 눌렀습니다.`}</span>
            </div>
            break
        case "requested":
            content = <div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님에게 서로이웃 요청을 보냈습니다.`}</span>
            </div>
            break
        case "accepted":
            content = <div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님과 서로이웃이 되었습니다.`}</span>
            </div>
            break
        case "broken":
            content = <div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님과의 서로이웃이 해제되었습니다.`}</span>
            </div>
            break
        case "request":
            content =<div>
                <Link href={`/profile/${props.notification.sender}`} className="text-lg hover:underline font-bold">{props.notification.sender}</Link>
                <span>{` 님이 서로이웃 요청을 보냈습니다.`}</span>
                <div className="mt-1 flex flex-row-reverse">
                    { props.notification.accepted ?
                        <button className="bg-gray-500 border-gray-500 border px-4 py-1 rounded-lg disabled">수락됨</button> :
                        <button className="bg-blue-600 border-blue-600 border px-4 py-1 rounded-lg hover:bg-blue-700" onClick={acceptFriend}>수락하기</button> }
                </div>
            </div>
            break
    }

    return (
        <div className="flex mx-7 items-center mb-8">
            <div className={`h-[43px] w-[43px] mr-4 ${props.notification.type === 'request' ? "mb-9" : ""}`}>
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${props.notification.sender}`} className="rounded-full" width={43} height={43}></img>
            </div>
            {content}
        </div>
    )
}

export default function Menu(props: {updated?: number, updateFunc?: () => void}) {
    const [searchOpened, setSearchOpened] = useState(false)
    const [notificationOpened, setNotificationOpened] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [searchResult, setSearchResult] = useState<string[]>([])

    const searchInputRef = useRef<HTMLInputElement>(null)

    function resetTab() {
        setSearchOpened(false)
        setNotificationOpened(false)
    }

    function handleNotification() {
        if (notificationOpened) {
            setNotificationOpened(false)    
        } else {
            loadNotifications() 
            setSearchOpened(false)
            setNotificationOpened(true)
        }
    }

    function handleSearch() {
        if (searchOpened) {
            setSearchOpened(false)
        } else {
            setSearchResult([])
            setNotificationOpened(false)
            setSearchOpened(true)
        }
    }

    const router = useRouter()

    const [username, setUsername] = useState("")
    useEffect(() => {
        setUsername(sessionStorage.getItem("username") ?? "")
    }, [])

    async function loadNotifications() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/notification`, {
            credentials: 'include'
        })
        setNotifications(await res.json())
    }

    function makeNotifications() {
        const result = []
        for (const notification of notifications) {
            result.push(<NotificationComponent key={notification.id} notification={notification} load={loadNotifications} updateFunc={props.updateFunc}></NotificationComponent>)
        }
        return result
    }

    async function search() {
        if (searchInputRef.current?.value) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/search?query=${searchInputRef.current.value}`)
            setSearchResult(await res.json())
        }
    }

    function makeSearchResult() {
        const result = []
        for (const [idx, item] of searchResult.entries()) {
            result.push(<div className="flex ml-8 mt-2" key={item}>
                <div className="h-[30px] w-[30px] mr-3 cursor-pointer" onClick={() => {router.push(`/profile/${item}`)}}>
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${item}`} className="rounded-full" width={30} height={30}></img>
                </div>
                <Link href={`/profile/${item}`} className="text-lg hover:underline">{item}</Link>
            </div>)
        }
        return result
    }

    return (
        <Fragment>
            <aside className="h-screen top-0 w-[270px] px-[20px] border-r border-r-gray-400">
            <div className="text-3xl font-bold py-8 pl-3">
                    KWEBLOG
                </div>
                <button className={styles.menuItem} onClick={() => {resetTab(); router.push('/')}}>
                    <div>
                        <Image src="/home.png" width={24} height={24} alt="home"></Image>
                    </div>
                    <div>
                        홈
                    </div>
                </button>
                <button className={styles.menuItem} onClick={handleSearch}>
                    <div>
                        <Image src="/search.png" width={24} height={24} alt="search"></Image>
                    </div>
                    <div>
                        검색
                    </div>
                </button>
                { username && <button className={styles.menuItem} onClick={handleNotification}>
                    <div>
                        <Image src="/bell.png" width={24} height={24} alt="notification"></Image>
                    </div>
                    <div>
                        알림
                    </div>
                </button>}
                { username &&
                <button className={styles.menuItem} onClick={() => {router.push('/write')}}>
                    <div>
                        <Image src="/pencil.png" width={24} height={24} alt="write"></Image>
                    </div>
                    <div>
                        작성
                    </div>
                </button>}
                { username ?
                <div className="absolute left-0 bottom-6 h-[44px] w-[270px] pl-8">
                    <div className="flex">
                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${username}${props.updated ? `&update=${props.updated}` : ""}`} suppressHydrationWarning={true} className="rounded-full" width={44} height={44}></img>
                        <div className="ml-4 mr-5">
                            <div className="text-xl h-[24px] leading-[20px] hover:underline"><Link href={`/profile/${username}`}>{username}</Link></div>
                            <div className="text-sm h-[20px] text-white/50 decoration-white/50 hover:underline cursor-pointer" onClick={async () => {
                                sessionStorage.removeItem("username")
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signout`, { credentials: 'include' })
                                setUsername("")
                                resetTab()
                                router.push('/')
                            }}>로그아웃</div>
                        </div>
                    </div>
                </div> :
                <div className="absolute left-0 bottom-6 ml-8">
                    <button className="bg-transparent border-white px-4 py-2 border rounded-lg hover:bg-white/10 mr-8" onClick={() => {router.push('/signin')}}>로그인</button>
                    <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700" onClick={() => {router.push('/signup')}}>회원가입</button>
                </div>}
            </aside>
            { notificationOpened && <div className="w-[350px] border-r border-r-gray-400 absolute left-[270px] top-0 h-screen bg-[#171717] z-20 overflow-y-auto">
                <div className="mt-7 mb-8 text-3xl font-bold w-fit mx-auto">알림</div>
                {makeNotifications()}
            </div> }
            { searchOpened && <div className="w-[350px] border-r border-r-gray-400 absolute left-[270px] top-0 h-screen bg-[#171717] z-20 overflow-y-auto overflow-x-hidden">
                <div className="mt-7 mb-8 text-3xl font-bold w-fit mx-auto">검색</div>
                <div className="flex mx-[20px] w-[350px]">
                    <input ref={searchInputRef} type="text" placeholder="유저네임 검색" className="bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 mr-1 focus:outline-none w-[310px]" onKeyDown={(event) => {
                        if (event.key === "Enter") search()
                    }}></input>
                    <button className="-translate-x-10" onClick={search}><Image src="/search.png" width={24} height={24} alt="search"></Image></button>
                </div>
                <div className="pt-1">
                    {makeSearchResult()}
                </div>
            </div> }
        </Fragment>
    )
}