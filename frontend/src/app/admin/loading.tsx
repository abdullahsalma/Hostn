import { DashboardStatSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <DashboardStatSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
