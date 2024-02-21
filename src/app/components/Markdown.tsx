import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Markdown: React.FC<MarkDownProps> = ({ markdown }) => {
  return (
    <div className="markdown-body px-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
};

interface MarkDownProps {
  markdown: string;
}

export default Markdown;
