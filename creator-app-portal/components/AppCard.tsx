import type { PortalApp } from "@/data/apps";

type AppCardProps = {
  app: PortalApp;
};

export function AppCard({ app }: AppCardProps) {
  const isPublished = app.status === "published";

  return (
    <article className="app-card">
      <div className="card-topline">
        <span className="app-order">{app.order}</span>
        <span className={isPublished ? "status status-published" : "status status-development"}>
          {isPublished ? "公開中" : "開発中"}
        </span>
      </div>

      <div className="app-card-main">
        <span className="category">{app.category}</span>
        <h3>{app.name}</h3>
        <p>{app.description}</p>
      </div>

      <ul className="tag-list" aria-label={`${app.name} の主な内容`}>
        {app.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>

      <div className="card-actions">
        {isPublished && app.href ? (
          <a className="app-action" href={app.href} target="_blank" rel="noreferrer">
            アプリを開く
          </a>
        ) : (
          <button className="app-action app-action-disabled" type="button" disabled>
            近日公開
          </button>
        )}
      </div>
    </article>
  );
}
