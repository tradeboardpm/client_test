
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
 const JournalCardSkeleton = () => {
    return (
      <Card className="transition-all duration-300 group shadow-[0px_5px_10px_2px_rgba(0,0,0,0.04)] max-w-[22.5rem] border-[1rem] bg-card/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="h-[1px] w-full bg-muted mt-2" />
        </CardHeader>
        <CardContent className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-10 bg-muted animate-pulse rounded mr-2" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center">
              <div className="h-4 w-14 bg-muted animate-pulse rounded mr-2" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center">
              <div className="h-4 w-12 bg-muted animate-pulse rounded mr-2" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-[1px] w-full bg-muted" />
        </CardContent>
        <CardFooter className="p-0">
          <div className="flex justify-between space-x-4 w-full p-2">
            <div className="flex flex-col items-center w-full space-y-1">
              <div className="h-3 w-8 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex flex-col items-center w-full space-y-1 border-x border-muted px-2">
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex flex-col items-center w-full space-y-1">
              <div className="h-3 w-10 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }


  export default JournalCardSkeleton