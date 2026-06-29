import type { PortalApp } from "@/data/apps";

type AppCardProps = {
  app: PortalApp;
  featured?: boolean;
};

export function AppCard({ app, featured = false }: AppCardProps) {
  const isReady = app.status === "利用できます";

  return (
    <article className={featured ? "app-card app-card-featured" : "app-card"}>
      <div className="card-topline">
        <span className="category">{app.category}</span>
        <span className={isReady ? "status ready" : "status soon"}>{app.status}</span>
      </div>
      <div className="app-card-main">
        <div className="app-icon" aria-hidden="true">
          {app.shortName.slice(0, 2)}
        </div>
        <div>
          <h3>{app.name}</h3>
          <p>{app.description}</p>
        </div>
      </div>
      <div className="best-for">
        <span>向いている人</span>
        <p>{app.bestFor}</p>
      </div>
      <ul className="tag-list" aria-label={`${app.name} の主な機能`}>
        {app.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="card-actions">
        {isReady && app.href ? (
          <a className="primary-link" href={app.href} target="_blank" rel="noreferrer">
            開く
          </a>
        ) : (
          <button className="primary-link disabled" type="button" aria-disabled="true">
            準備中
          </button>
        )}
      </div>
    </article>
  );
}
