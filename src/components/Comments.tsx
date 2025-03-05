import Link from "next/link"
import { useEffect, useRef, useState } from "react"

interface CommentDTO {
    createdDate: string,
    content: string,
    author: string,
    id: number
}
export default function Comments(props: {postId: string}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [disabled, setDisabled] = useState(true)
    const [writtenComments, setWrittenComments] = useState(0)
    const [comments, setComments] = useState<CommentDTO[]>([])

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/${props.postId}`).then(async (res) => {
            if (res.ok) {
                setComments(await res.json())
            }
        })
    }, [writtenComments, props.postId])

    function write() {
        if (textareaRef.current?.value) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/${props.postId}/write`, {
                method: 'POST',
                body: JSON.stringify({
                    content: textareaRef.current.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }).then(() => {
                if (textareaRef.current) textareaRef.current.value = ""
                setWrittenComments(prev => prev + 1)
            })
        }
    }

    function makeComments() {
        const result = []
        for (const comment of comments) {
            result.push(<Comment key={comment.id} author={comment.author} content={comment.content} createdDate={comment.createdDate}/>)
        }
        return result
    }

    return (
        <div className="ml-10 mt-5">
            <div>
                <textarea className="bg-transparent border border-white/50 focus:border-white rounded-xl py-2 px-4 focus:outline-none resize-none w-full h-24" placeholder="댓글 달기" ref={textareaRef}
                    onChange={() => {
                        if (textareaRef.current?.value) {
                            setDisabled(false)
                        }
                    }}></textarea>
                <div className="flex justify-end">
                    <button disabled={disabled} className="bg-emerald-600 border-emerald-600 px-8 py-1.5 border rounded-lg hover:border-emerald-800 hover:bg-emerald-800"onClick={write}>게시하기</button>
                </div>
            </div>
            <div className="6">{makeComments()}</div>
        </div>
    )
}

interface CommentProps {
    author: string,
    content: string,
    createdDate: string,
}
function Comment(props: CommentProps) {
    return (
        <div className="mt-10">
            <div className="flex align-middle">
                <Link href={`/profile/${props.author}`} className="text-lg mr-3 hover:underline" >{props.author}</Link>
                <div className="text-gray-400 text-sm pt-[5px] h-[28px]">{(new Date(props.createdDate)).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div className="mt-1">
                {props.content}
            </div>
        </div>
    )
}