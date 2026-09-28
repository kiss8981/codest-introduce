import Link from "next/link";
import type { PortfolioProject } from "@/lib/portfolio/public/types";

export default function ProjectCard({
  project,
  wide = false,
}: {
  project: PortfolioProject;
  wide?: boolean;
}) {
  const coverClass = `block w-full rounded-[18px] bg-[#dce7ee] object-cover ${wide ? "aspect-[16/10] md:aspect-[2.25/1] md:max-h-[520px]" : "aspect-[16/10]"}`;

  return (
    <article className={wide ? "md:col-span-2" : ""}>
      <Link
        href={`/portfolio/${project.slug}`}
        aria-label={`${project.title} 자세히 보기`}
        className="group block"
      >
        {project.cover ? (
          <picture>
            {project.mobileCover && (
              <source media="(max-width: 639px)" srcSet={project.mobileCover} />
            )}
            <img className={coverClass} src={project.cover} alt="" loading="lazy" />
          </picture>
        ) : (
          <div className={coverClass} aria-hidden="true" />
        )}
        <div className="flex items-start justify-between gap-5 pt-6">
          <div>
            <p className="mb-2.5 text-[13px] font-bold text-brand-deep">
              {project.category}
              {project.stack.length ? ` · ${project.stack.join(" / ")}` : ""}
            </p>
            <h3 className="text-[clamp(1.5rem,2.4vw,2.0625rem)] font-extrabold tracking-[-0.04em]">
              {project.title}
            </h3>
            <p className="mt-3 break-keep text-base leading-7 text-brand-muted">
              {project.summary}
            </p>
          </div>
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#b7cad7] text-[21px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-brand-deep group-hover:text-brand-deep motion-reduce:transition-none"
            aria-hidden="true"
          >
            ↗
          </span>
        </div>
      </Link>
    </article>
  );
}
