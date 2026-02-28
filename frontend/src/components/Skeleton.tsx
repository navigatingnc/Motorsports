/**
 * Skeleton — Phase 16: Responsive UI Polish & Dark Mode
 *
 * Reusable skeleton loading components that adapt to the current theme
 * via CSS custom properties defined in dark-mode.css.
 */

interface SkeletonProps {
  /** Width of the skeleton block (default: 100%) */
  width?: string;
  /** Height of the skeleton block (default: 1rem) */
  height?: string;
  /** Additional CSS class names */
  className?: string;
  /** Border radius (default: 4px) */
  borderRadius?: string;
}

/** Single skeleton shimmer block */
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  className = '',
  borderRadius = '4px',
}: SkeletonProps) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

/** Skeleton for a vehicle / driver card */
export const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-card-header">
      <Skeleton width="60%" height="1.2rem" />
      <Skeleton width="3rem" height="1.5rem" borderRadius="20px" />
    </div>
    <div className="skeleton-card-body">
      <Skeleton width="40%" height="1rem" className="skeleton-mb" />
      <Skeleton width="70%" height="0.85rem" className="skeleton-mb" />
      <Skeleton width="55%" height="0.85rem" />
    </div>
    <div className="skeleton-card-footer">
      <Skeleton width="30%" height="2rem" borderRadius="4px" />
      <Skeleton width="30%" height="2rem" borderRadius="4px" />
      <Skeleton width="30%" height="2rem" borderRadius="4px" />
    </div>
  </div>
);

/** Skeleton for a list row (event list, parts table, etc.) */
export const SkeletonRow = () => (
  <div className="skeleton-row" aria-hidden="true">
    <Skeleton width="35%" height="1rem" />
    <Skeleton width="15%" height="1rem" />
    <Skeleton width="20%" height="1rem" />
    <Skeleton width="15%" height="1rem" />
  </div>
);

/** Skeleton for a detail page header */
export const SkeletonDetailHeader = () => (
  <div className="skeleton-detail-header" aria-hidden="true">
    <div>
      <Skeleton width="12rem" height="0.85rem" className="skeleton-mb" />
      <Skeleton width="24rem" height="2rem" className="skeleton-mb" />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Skeleton width="5rem" height="1.5rem" borderRadius="20px" />
        <Skeleton width="5rem" height="1.5rem" borderRadius="20px" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Skeleton width="6rem" height="2.25rem" borderRadius="4px" />
      <Skeleton width="5rem" height="2.25rem" borderRadius="4px" />
    </div>
  </div>
);

/** Skeleton grid of cards (e.g., vehicle list, driver list) */
export const SkeletonCardGrid = ({ count = 6 }: { count?: number }) => (
  <div className="skeleton-card-grid" aria-label="Loading content…">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/** Skeleton for a stat card (analytics dashboard) */
export const SkeletonStatCard = () => (
  <div className="skeleton-stat-card" aria-hidden="true">
    <Skeleton width="50%" height="1.75rem" className="skeleton-mb" />
    <Skeleton width="70%" height="0.8rem" />
  </div>
);

/** Skeleton for the analytics stats grid */
export const SkeletonStatsGrid = ({ count = 4 }: { count?: number }) => (
  <div className="skeleton-stats-grid" aria-label="Loading statistics…">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);

/** Skeleton for a table body */
export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="skeleton-table-wrapper" aria-label="Loading table…">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="skeleton-table-row">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton
            key={c}
            width={c === 0 ? '35%' : c === cols - 1 ? '10%' : '20%'}
            height="0.9rem"
          />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
