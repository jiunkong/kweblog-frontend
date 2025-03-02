export interface Thumbnail {
    title: string,
    image: boolean,
    createdDate: string,
    likes: number,
    comments: number
}

export function Post(props: {postId: number, thumbnail: Thumbnail, push: (str: string) => void, final: boolean}) {
    return (
        <div className="w-full">
            { props.thumbnail.image && <div className="max-h-[400px] mx-auto overflow-hidden w-fit flex flex-col justify-center cursor-pointer" onClick={() => props.push(`/post/${props.postId}`)}>
                <img className="object-cover" src={`${process.env.NEXT_PUBLIC_API_URL}/post/${props.postId}/0`}></img>
            </div> }
            <h3 className="text-3xl font-bold mt-8 w-fit cursor-pointer" onClick={() => props.push(`/post/${props.postId}`)}>{props.thumbnail.title}</h3>
            <div className="flex mt-2 text-gray-300">
                <div className="mr-3 text-gray-400">{(new Date(props.thumbnail.createdDate)).toLocaleDateString("ko-KR", {year: "numeric", month: "long", day: "numeric"})}</div>
                <div className="mr-2">{`${props.thumbnail.likes} 좋아요`}</div>
                <div>{`${props.thumbnail.comments} 댓글`}</div>
            </div>
            { !props.final && <div className="border-b border-b-gray-500 mt-12 mb-16"></div>}
        </div>
    )
}