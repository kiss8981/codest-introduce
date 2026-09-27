import Link from "next/link";
import type { PortfolioProject } from "@/lib/portfolio";

export default function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="project-item">
      <Link href={`/portfolio/${project.slug}`} aria-label={`${project.title} 자세히 보기`}>
        {project.cover
          ? <img className="project-cover" src={project.cover} alt="" />
          : <div className="project-cover" aria-hidden="true" />}
        <div className="project-info">
          <div>
            <p className="project-meta">{project.category}{project.stack.length ? ` · ${project.stack.join(" / ")}` : ""}</p>
            <h3>{project.title}</h3>
            <p className="project-summary">{project.summary}</p>
          </div>
          <span className="project-arrow" aria-hidden="true">↗</span>
        </div>
      </Link>
    </article>
  );
}
