"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { useWellness } from "@/context/wellness-context"
import { getOverallScore } from "@/utils/chart-utils"
import type { WellnessEntryData } from "@/types/wellness"
import { ListChecks } from "lucide-react"

interface EntriesListProps {
  onEdit: (entry: WellnessEntryData) => void
}

export function EntriesList({ onEdit }: EntriesListProps) {
  const { filteredEntries, removeEntry } = useWellness()
  const [page, setPage] = useState(0)
  const entriesPerPage = 5

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Paginate entries
  const paginatedEntries = sortedEntries.slice(page * entriesPerPage, (page + 1) * entriesPerPage)
  const totalPages = Math.ceil(sortedEntries.length / entriesPerPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          <ListChecks className="h-5 w-5 text-blue-600" />
          Recent Entries
        </h2>
        <div className="flex items-center gap-2"></div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Your wellness data entries</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-muted-foreground">No entries found for the selected date range</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getOverallScore(entry)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => onEdit(entry)}>
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => removeEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
