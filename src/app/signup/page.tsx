"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import * as crypto from "node:crypto";

export default function SignUp() {
    const [step, setStep] = useState(0)
    const initialAccountInfo = {
        id: "",
        username: "",
        password: "",
        introduction: ""
    }
    const [accountInfo, setAccountInfo] = useState(initialAccountInfo)
    const inputRef = useRef<Array<HTMLInputElement | null>>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [existed, setExisted] = useState<boolean[]>([false, false])
    const [flag, setFlag] = useState<boolean[]>([false, false, false, false, false])
    const imageRef = useRef<HTMLInputElement>(null)

    const router = useRouter()

    function editFlag(...num: number[]) {
        const temp = flag
        for (const i of num) {
            if (!flag[i]) {
                temp[i] = true
            }
        }
        setFlag(temp)
    }

    function save() {
        setAccountInfo({
            id: inputRef.current[0]?.value ?? accountInfo.id,
            password: inputRef.current[1]?.value ?? accountInfo.password,
            username: inputRef.current[2]?.value ?? accountInfo.username,
            introduction: textareaRef.current?.value ?? accountInfo.introduction
        })
    }

    function isImageExists() {
        return (imageRef.current?.files && imageRef.current.files.length > 0)
    }

    return (
        <div className="h-screen w-screen flex flex-row items-center">
            { step == 0 &&
            <div className="mx-auto w-fit">
                <div className="text-4xl font-bold mb-8 text-center">새 계정 만들기</div>
                <div>
                    <div>
                        <input type="text" placeholder="아이디" required={flag[0]} className={`${existed[0] ? "bg-transparent border rounded-lg px-5 py-2 w-80 placeholder-rose-600 text-rose-600 border-rose-700 focus:border-rose-600 focus:outline-none"
                            : "bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 w-80 invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600 focus:outline-none"}`}
                            onInput={() => {editFlag(0); if (existed[0]) setExisted([false, existed[1]])}} ref={(e) => {inputRef.current[0] = e}} defaultValue={accountInfo.id}></input>
                    </div>
                    { existed[0] && <div className="text-rose-600 mt-1 ml-2">이미 존재하는 아이디입니다</div> }
                    <div className="mt-3">
                        <input type="password" placeholder="비밀번호" className="bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 w-80 invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600 focus:outline-none"
                            onInput={() => {editFlag(1)}} required={flag[1]} ref={(e) => {inputRef.current[1] = e}} defaultValue={accountInfo.password}></input>
                    </div>
                </div>
                <div>
                    <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700 w-80 mt-6" onClick={async () => {
                        editFlag(0, 1)
                        if (inputRef.current[0]?.value && inputRef.current[1]?.value) {
                            save()
                            const res = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/existedId?id=${inputRef.current[0].value}`)).text()
                            if (res == "false") setStep(1)
                            else {
                                setExisted([true, existed[1]])
                            }
                        }
                    }}>다음</button>
                </div>
            </div>
            }
            { step == 1 &&
            <div className="mx-auto w-fit">
                <div className="text-4xl font-bold mb-8 text-center">새 계정 만들기</div>
                <div>
                    <div>
                        <input type="text" placeholder="유저네임" className={`${existed[1] ? "bg-transparent border rounded-lg px-5 py-2 w-80 placeholder-rose-600 text-rose-600 border-rose-700 focus:border-rose-600 focus:outline-none"
                            : "bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 w-80 invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600 focus:outline-none"}`}
                            onInput={() => {editFlag(2)}} required={flag[2]} ref={(e) => {inputRef.current[2] = e}} defaultValue={accountInfo.username}></input>
                    </div>
                    { existed[1] && <div className="text-rose-600 mt-1 ml-2">이미 존재하는 유저네임입니다</div> }
                    <div className="my-6">
                        <input type="file" accept="image/*" className={isImageExists() || !flag[3] ? "" : "text-rose-600"} ref={imageRef} onChange={() => {editFlag(3); imageRef.current?.classList.remove('text-rose-600')}}></input>
                    </div>
                    <div>
                        <textarea className="bg-transparent border border-white/50 focus:border-white rounded-xl py-2 px-4 focus:outline-none resize-none w-80 h-48 invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600" placeholder="자기소개" onInput={() => {editFlag(4)}} required={flag[4]} ref={textareaRef} defaultValue={accountInfo.introduction}></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                    <button className="bg-transparent border-white px-4 py-2 border rounded-lg hover:bg-white/10 w-36" onClick={() => {
                        save()
                        editFlag(2, 3, 4)
                        setStep(0)
                    }}>이전</button>
                    <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700 w-36" onClick={async () => {
                        editFlag(2, 3, 4)
                        if (inputRef.current[2]?.value && textareaRef.current?.value && isImageExists()) {
                            const res = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/existedUsername?username=${inputRef.current[2].value}`)).text()
                            if (res == "false") {
                                const data = new FormData()
                                data.append("id", accountInfo.id)
                                data.append("username", inputRef.current[2].value)
                                const pw = crypto.createHmac("sha256", process.env.NEXT_PUBLIC_SECRET!).update(accountInfo.password).digest("hex")
                                data.append("password", pw)
                                data.append("introduction", textareaRef.current.value)
                                data.append("image", imageRef.current!.files![0])

                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
                                    method: "POST",
                                    body: data,
                                    credentials: 'include'
                                })

                                if (res.ok) {
                                    sessionStorage.setItem("username", inputRef.current[2].value)
                                    router.push('/')
                                } else {
                                    console.log("error")
                                }
                            } else {
                                setExisted([existed[0], true])
                            }
                        }
                    }}>회원가입</button>
                </div>
            </div>
            }
        </div>
    )
}