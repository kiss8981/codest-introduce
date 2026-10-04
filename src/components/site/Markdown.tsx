import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownBody } from "@/components/site/styles";

const Markdown: React.FC<MarkDownProps> = ({ markdown }) => {
  return (
    <div
      className={`${markdownBody} w-full [&_h1]:mb-8 [&_h1]:break-keep [&_h1]:text-[clamp(2.375rem,4.8vw,4rem)] [&_h1]:font-extrabold [&_h1]:leading-tight [&_h1]:tracking-[-0.055em] [&_h4]:my-8 [&_h4]:break-keep [&_h4]:text-lg [&_h4]:font-semibold`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
};

interface MarkDownProps {
  markdown: string;
}

export default Markdown;
