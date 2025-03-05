export interface PostInfo {
    author: string,
    postId: number
    title: string,
    image: boolean,
    createdDate: string,
    likes: number,
    comments: number
}

export function makePosts(postInfoList: PostInfo[], push: (str: string) => void) {
    const result = []
    for (let i = 0; i < postInfoList.length; i++) {
        result.push(
            <Post info={postInfoList[i]} push={push} final={i == postInfoList.length - 1} key={postInfoList[i].postId}/>
        )
    }

    return result
}

export function Post(props: {info: PostInfo, push: (str: string) => void, final: boolean}) {
    return (
        <div className="w-full">
            { props.info.image && <div className="max-h-[400px] mx-auto overflow-hidden w-fit flex flex-col justify-center cursor-pointer" onClick={() => props.push(`/post/${props.info.postId}`)}>
                <img className="object-cover" src={`${process.env.NEXT_PUBLIC_API_URL}/post/${props.info.postId}/0`}></img>
            </div> }
            <h3 className="text-3xl font-bold mt-8 w-fit cursor-pointer" onClick={() => props.push(`/post/${props.info.postId}`)}>{props.info.title}</h3>
            <div className="flex mt-2 text-gray-300">
                <div className="mr-2 cursor-pointer hover:underline font-bold" onClick={() => props.push(`/profile/${props.info.author}`)}>{props.info.author}</div>
                <div className="mr-3 text-gray-400">{(new Date(props.info.createdDate)).toLocaleDateString("ko-KR", {year: "numeric", month: "long", day: "numeric"})}</div>
                <div className="mr-2">{`${props.info.likes} 좋아요`}</div>
                <div>{`${props.info.comments} 댓글`}</div>
            </div>
            { !props.final && <div className="border-b border-b-gray-500 mt-12 mb-16"></div>}
        </div>
    )
}