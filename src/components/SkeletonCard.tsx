import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 aspect-[2/3] w-full">
      <Skeleton className="h-full w-full rounded-xl" />
    </div>
  );
}
