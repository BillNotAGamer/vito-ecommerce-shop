import Container from "@/components/layout/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="pb-24">
      <Container className="space-y-8 pt-10">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>

        <Card className="overflow-hidden border-gray-200 bg-white">
          <CardHeader className="space-y-3 border-b border-gray-100">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableHead key={index} className={index === 0 ? "pl-6" : index === 4 ? "pr-6 text-right" : undefined}>
                      <Skeleton className="h-4 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className={
                          cellIndex === 0
                            ? "pl-6"
                            : cellIndex === 3
                              ? "pr-6 text-right"
                              : cellIndex === 4
                                ? "pr-6 text-right"
                                : undefined
                        }
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
