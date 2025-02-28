import { useState, Fragment, useCallback } from "react";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export const linkifyAndBreak = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.split("\n").map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {line.split(urlRegex).map((part, index) => 
          urlRegex.test(part) ? (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline decoration-blue-500">
              {part}
          </a>
          ) : (
              part
          )
      )}
      <br />
    </Fragment>
  ));
};

interface MarkdownRendererProps {
  text: string
}
export const MarkdownRenderer = (props: MarkdownRendererProps) => {
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const renderImage = useCallback(({ src, alt }: { src?: string; alt?: string }) => {
    return (
      <img
        src={src || ""}
        alt={alt || ""}
        className="cursor-pointer"
        onClick={() => {
          setCurrentImage(src || "");
          setOpen(true);
        }}
      />
    );
  }, []);

  return (
    <div className="prose prose-invert text-lg overflow-y-auto text-wrap overflow-x-hidden text-pretty break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{
        img: renderImage }}>{props.text}</ReactMarkdown>

      <Lightbox open={open} close={() => setOpen(false)} slides={[{src: currentImage}]} carousel={{ finite: true }}/>
    </div>
  );
}; 