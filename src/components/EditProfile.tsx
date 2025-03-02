import { useRef } from "react"

interface ModalProps {
    default: string,
    setIsOpened: (value: boolean) => void
}

export default function EditProfile(props: ModalProps) {
    const imageRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    async function updateProfile() {
        const files = imageRef.current?.files
        const data = new FormData()

        if (files && files.length > 0) {
            data.append('image', files[0])
        }
        const value = textareaRef.current?.value
        if (value && value != props.default) {
            data.append('introduction', value)
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/updateProfile`, {
            method: "PATCH",
            body: data,
            credentials: 'include'
        })
        if (!res.ok) console.error('error')

        props.setIsOpened(false)
    }

    return (
        <div className="h-screen w-screen bg-black/50 fixed left-0 top-0 flex justify-center items-center">
            <div className="w-[500px] h-[570px] bg-[#171717] border rounded-2xl border-gray-500">
                <div className="text-3xl font-bold my-10 text-center">프로필 수정</div>
                <div className="ml-[40px]">
                    <div className="text-[21px] pb-2">프로필 이미지</div>
                    <input type="file" accept="image/*" className="pl-1 mb-8" ref={imageRef}></input>
                    <div className="text-[21px] pb-2">자기소개</div>
                    <textarea className="bg-transparent border border-white/50 focus:border-white rounded-xl py-2 px-4 focus:outline-none resize-none w-[420px] h-48" placeholder="자기소개" ref={textareaRef} defaultValue={props.default}></textarea>
                </div>
                <div className="ml-[40px] w-[420px] mt-8 flex justify-between">
                    <button className="bg-transparent px-4 py-2 border rounded-lg hover:bg-rose-600/5 w-48 border-rose-600 text-rose-600" onClick={() => {props.setIsOpened(false)}}>취소</button>
                    <button className="bg-blue-600 border-blue-600 border px-4 py-2 rounded-lg hover:bg-blue-700 w-48" onClick={updateProfile}>업데이트</button>
                </div>
            </div>
        </div>
    )
}