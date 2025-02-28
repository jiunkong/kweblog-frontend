"use client"

import Image from "next/image";
import styles from "./Menu.module.css"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Menu(props: {updated?: number}) {
    const [searchOpened, SetSearchOpened] = useState(false)
    const [notificationOpened, SetNotificationOpened] = useState(false)

    function resetTab() {
        SetSearchOpened(false)
        SetNotificationOpened(false)
    }

    const router = useRouter()

    const [username, setUsername] = useState("")
    useEffect(() => {
        setUsername(sessionStorage.getItem("username") ?? "")
    }, [])

    return (
        <aside className="w-[270px] h-screen px-[20px] border-r border-r-gray-400 top-0">
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
            <button className={styles.menuItem} onClick={() => {SetSearchOpened(!searchOpened)}}>
                <div>
                    <Image src="/search.png" width={24} height={24} alt="search"></Image>
                </div>
                <div>
                    검색
                </div>
            </button>
            { username && <button className={styles.menuItem} onClick={() => {SetNotificationOpened(!notificationOpened)}}>
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
                    <img src={`http://${process.env.NEXT_PUBLIC_API_URL}/user/profileImage?username=${username}${props.updated ? `&update=${props.updated}` : ""}`} suppressHydrationWarning={true} className="rounded-full" width={44} height={44}></img>
                    <div className="ml-4 mr-5">
                        <div className="text-xl h-[24px] leading-[20px] hover:underline"><Link href={`/profile/${username}`}>{username}</Link></div>
                        <div className="text-sm h-[20px] text-white/50 decoration-white/50 hover:underline cursor-pointer" onClick={async () => {
                            sessionStorage.removeItem("username")
                            await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/user/signout`, { credentials: 'include' })
                            setUsername("")
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
        
    )
}