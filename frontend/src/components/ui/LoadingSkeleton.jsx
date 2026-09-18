import React from 'react';
import { twMerge } from 'tailwind-merge';
const sweep = 'rounded-md bg-[linear-gradient(90deg,#eceef3_25%,#f5f6f9_37%,#eceef3_63%)] bg-[length:400%_100%] animate-skeleton-sweep';
export function Skeleton({ className }) {
    return <div aria-hidden="true" className={twMerge(sweep, 'h-4 w-full', className)}/>;
}
export function PollCardSkeleton() {
    return (<div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-5 w-2/3"/>
        <Skeleton className="h-6 w-20 rounded-full"/>
      </div>
      <Skeleton className="mt-4 h-3 w-1/2"/>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-20 rounded-lg"/>
        <Skeleton className="h-9 w-20 rounded-lg"/>
      </div>
    </div>);
}
export function StatsSkeleton() {
    return (<div className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((index) => <div key={index} className="rounded-xl border border-line bg-white p-5">
          <Skeleton className="h-3 w-24"/>
          <Skeleton className="mt-4 h-8 w-16"/>
        </div>)}
    </div>);
}
export function ResultsSkeleton({ rows = 4 }) {
    return (<div className="space-y-5" aria-label="Loading results" role="status">
      {Array.from({ length: rows }).map((_, index) => <div key={index}>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton className="h-4 w-28"/>
            <Skeleton className="h-4 w-12"/>
          </div>
          <Skeleton className="h-2.5 w-full rounded-full"/>
        </div>)}
    </div>);
}
