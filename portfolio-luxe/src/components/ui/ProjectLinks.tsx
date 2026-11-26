import { LINK_PATHS } from "@/content/tool-icons";
import { LINK_KEYS, type Project, type ProjectLink } from "@/types/content";
import { SOCIAL_PATHS, TOOL_PATHS } from "@/content/tool-icons";

/** Icon for a link key, pulled from whichever brand map holds it. */
function path(key: ProjectLink): string | undefined {
  return (
    LINK_PATHS[key]?.path ?? SOCIAL_PATHS[key]?.path ?? TOOL_PATHS[key === "figma" ? "Figma" : key]?.path
  );
}

/**
 * The outward links for a project, as icons. Driven entirely by the project's
 * `links` map, so adding a platform is a data change — nothing here to edit.
 */
export function ProjectLinks({
  links,
  labels,
  className = "",
}: {
  links: Project["links"];
  /** localized name per key, for the tooltip + screen readers */
  labels: Record<string, string>;
  className?: string;
}) {
  const entries = LINK_KEYS.filter((k) => links?.[k]).map((k) => [k, links![k]!] as const);
  if (!entries.length) return null;

  return (
    <ul className={`plinks ${className}`.trim()}>
      {entries.map(([key, href]) => {
        const d = path(key);
        const label = labels[key] ?? key;
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="plink"
              aria-label={label}
              title={label}
            >
              {d ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d={d} />
                </svg>
              ) : (
                <span aria-hidden="true">↗</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
