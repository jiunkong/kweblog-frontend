"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import * as crypto from "crypto"

export default function SignIn() {
    const inputRef = useRef<Array<HTMLInputElement | null>>([])

    const router = useRouter()

    async function handleClick() {
        if (inputRef.current[0]?.value && inputRef.current[1]?.value) {
            const id = inputRef.current[0].value
            const pw = crypto.createHmac("sha256", process.env.NEXT_PUBLIC_SECRET!).update(inputRef.current[1].value).digest("hex")
            if (id && pw) {
                const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/user/signin?id=${id}&pw=${pw}`, {
                    credentials: 'include'
                })
                if (res.ok) {
                    sessionStorage.setItem("username", await res.text())
                    router.push('/')
                } else {
                    console.error("failed to log in")
                }
            }
        }
    }

    return (
        <div className="h-screen w-screen flex flex-row items-center">
            <div className="mx-auto w-fit">
                <div className="text-4xl font-bold mb-8 text-center">KWEBLOG</div>
                <div>
                    <div className="mb-3">
                        <input type="text" placeholder="아이디" className="bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 w-80" ref={(e) => {inputRef.current[0] = e}}></input>
                    </div>
                    <div>
                        <input type="password" placeholder="비밀번호" className="bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 w-80" ref={(e) => {inputRef.current[1] = e}}></input>
                    </div>
                </div>
                <div>
                    <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700 w-80 mt-6" onClick={handleClick}>로그인</button>
                </div>
            </div>
        </div>
    )
}