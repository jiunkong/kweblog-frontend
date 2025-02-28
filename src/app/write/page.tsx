"use client"

import Menu from "@/components/Menu";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_IMAGE_COUNT = 10
export default function Write() {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const imageRef = useRef<Array<HTMLInputElement | null>>([])
    const titleRef = useRef<HTMLInputElement>(null)

    const [canPost, setCanPost] = useState(false)
    const [titleFlag, setTitleFlag] = useState(false)
    const [contentFlag, setContentFlag] = useState(false)

    const router = useRouter()

    async function post() {
        if (textareaRef.current?.value && titleRef.current?.value) {
            const data = new FormData()
            let content = textareaRef.current.value.replace(/!\[.*?\]\(.*?\)\s*\n/g, match => match.trim())
            data.append('title', titleRef.current.value)
            
            let count = 0
            const convert: Array<number | null> = []
            for (let i = 0; i < inputCount; i++) {
                const files = imageRef.current[i]?.files
                if (files && files.length > 0 && RegExp(`!\\[.*?\\]\\(${i}\\)`).test(content)) {
                    convert[i] = count
                    count++
                    data.append('images', files[0])
                } else {
                    convert[i] = null
                }
            }

            content = content.replaceAll(/!\[(.*?)\]\(([0-9])\)/g, (match, text, num) => {
                if (convert[num] == null) return ""
                else return `![${text}](${convert[num]})`
            })

            data.append('content', content)
    
            const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/post/write`, {
                method: "POST",
                body: data,
                credentials: 'include'
            })
            if (res.ok) {
                const postId = await res.text()
                router.push(`/post/${postId}`)
            }
        }
    }

    function handleChange() {
        setCanPost(Boolean(titleRef.current?.value) && Boolean(textareaRef.current?.value))
    }

    const [inputCount, setInputCount] = useState(1)
    function makeFileInputs() {
        const inputs = []
        for (let i = 0; i < inputCount; i++) {
            inputs.push(
                <input type="file" accept="image/*" ref={(e) => {imageRef.current[i] = e}} key={i} onChange={i == inputCount - 1 ? () => {
                    if (inputCount < MAX_IMAGE_COUNT) setInputCount(inputCount + 1)
                } : undefined}></input>
            )
        }
        return inputs
    }

    return (
        <div className="flex">
            <Menu></Menu>
            <main className="flex justify-center grow overflow-y-auto h-screen">
                <div className="w-[600px] my-16 h-fit">
                    <div className="font-bold text-4xl">게시물 작성</div>
                    <div className="text-gray-400 mt-1">마크다운 문법을 지원합니다</div>
                    <div className="mt-8">
                        <input type="text" placeholder="게시물 제목" className="bg-transparent border border-white/50 focus:border-white rounded-lg px-5 py-2 mb-5 w-[600px] invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600 focus:outline-none"
                            onInput={() => {handleChange(); if(!titleFlag) setTitleFlag(true)}} required={titleFlag} ref={titleRef}></input>
                        <div className="mb-2">
                            <button className="border border-blue-500 rounded-lg px-4 py-1 text-blue-500 hover:bg-blue-500/10 mr-3" onClick={() => {
                                if (textareaRef.current) {
                                    textareaRef.current.value += "[텍스트](링크)"
                                }
                            }}>링크 삽입</button>
                            <button className="border border-blue-500 rounded-lg px-4 py-1 text-blue-500 hover:bg-blue-500/10" onClick={() => {
                                if (textareaRef.current) {
                                    textareaRef.current.value += "![이미지 설명](링크)"
                                }
                            }}>이미지 삽입</button>
                        </div>
                        <textarea className="bg-transparent border border-white/50 focus:border-white rounded-xl py-2 px-4 focus:outline-none resize-none w-[600px] h-[450px] invalid:placeholder-rose-600 invalid:border-rose-700 focus:invalid:border-rose-600 focus:outline-none"
                            placeholder="게시물 내용" required={contentFlag} ref={textareaRef} onChange={() => {handleChange(); if(!contentFlag) setContentFlag(true)}}></textarea>
                        <div className="mt-5">
                            <div className="text-2xl mr-6">이미지 첨부</div>
                            <div className=" text-gray-400 mt-1 mb-3">첨부한 이미지를 삽입하려면 링크 대신 숫자(0~9)를 입력하세요</div>
                            <div>
                                {makeFileInputs()}
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700 w-48 disabled:bg-gray-500 disabled:border-gray-500 disabled:cursor-not-allowed" disabled={!canPost} onClick={post}>게시하기</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}