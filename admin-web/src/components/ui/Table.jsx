import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from './Skeleton';

const cn = (...args) => twMerge(clsx(args));

export default function Table({ columns, data, loading, className }) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-border bg-card', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            {columns.map((col) => (
              <th
                key={col.accessorKey ?? col.header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.accessorKey ?? col.header} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-text-muted text-sm">
                    No records found.
                  </td>
                </tr>
              )
            : data.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  {columns.map((col) => (
                    <td key={col.accessorKey ?? col.header} className="px-4 py-3 text-text-primary">
                      {col.cell ? col.cell(row[col.accessorKey], row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
