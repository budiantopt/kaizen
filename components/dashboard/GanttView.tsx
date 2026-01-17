'use client'

import { useState, useMemo } from 'react'
import { Task } from '@/types'
import {
    format,
    differenceInCalendarDays,
    addDays,
    startOfDay,
    endOfDay,
    startOfWeek,
    addWeeks,
    differenceInWeeks,
    startOfMonth,
    addMonths,
    differenceInMonths,
    parseISO,
    isValid
} from 'date-fns'

type ViewMode = 'Day' | 'Week' | 'Month'

export function GanttView({ tasks }: { tasks: Task[] }) {
    const [viewMode, setViewMode] = useState<ViewMode>('Day')

    const normalizeDate = (dateStr: string) => {
        return startOfDay(parseISO(dateStr))
    }

    // 1. Sort tasks by start date
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const dA = normalizeDate(a.start_date).getTime()
            const dB = normalizeDate(b.start_date).getTime()
            return dA - dB
        })
    }, [tasks])

    // 2. Determine global timeline range
    const { startDate, endDate, totalUnits, dates } = useMemo(() => {
        if (sortedTasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalUnits: 0, dates: [] }

        // Find min/max from string comparisons is actually safe for ISO format
        const minStr = sortedTasks.reduce((min, t) => t.start_date < min ? t.start_date : min, sortedTasks[0].start_date)
        const maxStr = sortedTasks.reduce((max, t) => t.end_date > max ? t.end_date : max, sortedTasks[0].end_date)

        const minDate = normalizeDate(minStr)
        const maxDate = normalizeDate(maxStr)

        let start: Date, end: Date, units: number, dateArray: Date[] = [];

        // Add buffer
        if (viewMode === 'Day') {
            start = addDays(startOfDay(minDate), -2)
            end = addDays(endOfDay(maxDate), 5)
            units = differenceInCalendarDays(end, start) + 1
            dateArray = Array.from({ length: units }, (_, i) => addDays(start, i))
        } else if (viewMode === 'Week') {
            start = startOfWeek(addWeeks(minDate, -1), { weekStartsOn: 1 }) // Monday start
            end = addWeeks(maxDate, 2)
            units = differenceInWeeks(end, start) + 1
            dateArray = Array.from({ length: units }, (_, i) => addWeeks(start, i))
        } else { // Month
            start = startOfMonth(addMonths(minDate, -1))
            end = addMonths(maxDate, 2)
            units = differenceInMonths(end, start) + 1
            dateArray = Array.from({ length: units }, (_, i) => addMonths(start, i))
        }

        return { startDate: start, endDate: end, totalUnits: units, dates: dateArray }
    }, [sortedTasks, viewMode])


    // 3. Grid sizing
    // Week: 100px per week. Month: 15px per day approx -> 450? No, let's keep Month wider.
    const columnWidth = viewMode === 'Day' ? 50 : viewMode === 'Week' ? 140 : 200
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `250px repeat(${totalUnits}, ${columnWidth}px)`,
    }

    if (tasks.length === 0) return <div className="p-8 text-center text-muted-foreground">No tasks to display.</div>

    return (
        <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-2">View by:</span>
                    {(['Day', 'Week', 'Month'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === mode ? 'bg-foreground text-background shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-muted-foreground">
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                </div>
            </div>

            {/* Scrollable Chart Area */}
            <div className="overflow-auto flex-1 relative">
                <div className="min-w-fit">
                    {/* Header Row */}
                    <div style={gridStyle} className="border-b border-border bg-muted/40 sticky top-0 z-20">
                        <div className="p-3 text-sm font-bold text-muted-foreground border-r border-border sticky left-0 bg-background/95 backdrop-blur-sm z-30 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
                            Task
                        </div>
                        {dates.map((date, i) => (
                            <div key={i} className={`p-2 text-center border-r border-border/30 flex flex-col items-center justify-center text-xs text-muted-foreground`}>
                                {viewMode === 'Day' && (
                                    <>
                                        <span className="uppercase text-[10px]">{format(date, 'EEE')}</span>
                                        <span className="font-bold text-foreground">{format(date, 'd')}</span>
                                    </>
                                )}
                                {viewMode === 'Week' && (
                                    <>
                                        <span className="uppercase text-[10px]">Week of</span>
                                        <span className="font-bold text-foreground">{format(date, 'MMM d')}</span>
                                    </>
                                )}
                                {viewMode === 'Month' && (
                                    <span className="font-bold text-foreground">{format(date, 'MMMM yyyy')}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-border/30">
                        {sortedTasks.map((task, index) => {
                            const taskStart = normalizeDate(task.start_date)
                            const taskEnd = normalizeDate(task.end_date)
                            const color = task.project?.color_code || '#3b82f6'

                            // -- LOGIC: Always calculate DURATION in Days --
                            // This gives us the total "days block" size, regardless of view mode.
                            const durationInDays = differenceInCalendarDays(taskEnd, taskStart) + 1

                            // -- LOGIC: Calculate Left Offset and Width based on Unit Scale --
                            let leftOffsetPx = 0
                            let widthPx = 0

                            if (viewMode === 'Day') {
                                // Simple: 1 unit = 1 day
                                const dayOffset = differenceInCalendarDays(taskStart, startDate)
                                leftOffsetPx = dayOffset * columnWidth
                                widthPx = durationInDays * columnWidth
                            }
                            else if (viewMode === 'Week') {
                                // 1 unit = 1 week (7 days)
                                // We need fractional weeks for precise positioning within the week cell
                                const daysFromStart = differenceInCalendarDays(taskStart, startDate)
                                const weeksOffset = daysFromStart / 7
                                leftOffsetPx = weeksOffset * columnWidth
                                // Width is simply proportional to days
                                widthPx = (durationInDays / 7) * columnWidth
                            }
                            else { // Month
                                // Month is tricky because days per month vary (28, 30, 31).
                                // Approximation: Calculate pixel position of Key Dates relative to StartDate
                                const getMonthPixelPos = (date: Date) => {
                                    // Full months difference
                                    const monthsDiff = differenceInMonths(date, startDate)
                                    // Remaining days into the month
                                    const startOfMonthDate = addMonths(startDate, monthsDiff)
                                    const daysIntoMonth = differenceInCalendarDays(date, startOfMonthDate)
                                    // Improve: get actual days in this specific month for precision
                                    const daysInThisMonth = differenceInCalendarDays(addMonths(startOfMonthDate, 1), startOfMonthDate)

                                    const fractionalMonth = daysIntoMonth / daysInThisMonth
                                    return (monthsDiff + fractionalMonth) * columnWidth
                                }

                                leftOffsetPx = getMonthPixelPos(taskStart)
                                // We calculate end position and subtract to get width, handles cross-month tasks nicely
                                // Add 1 day to end date to encompass the full day block
                                const taskEndInclusive = addDays(taskEnd, 1)
                                const endPixelPos = getMonthPixelPos(taskEndInclusive)
                                widthPx = endPixelPos - leftOffsetPx
                            }

                            // Improve: We can't use Simple Grid Columns anymore because we need fractional/pixel precision.
                            // We will place the bar in the FIRST column (after label) and use marginLeft/width.
                            // Grid Column 2 is where the timeline starts.

                            return (
                                <div key={task.id} style={gridStyle} className="group hover:bg-muted/10 transition-colors relative min-h-[50px]">

                                    {/* Column 1: Task Label */}
                                    <div className="p-3 border-r border-border sticky left-0 bg-background z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-center">
                                        {task.project && (
                                            <span
                                                className="text-[10px] uppercase font-bold tracking-wider mb-0.5"
                                                style={{ color: task.project.color_code }}
                                            >
                                                {task.project.name}
                                            </span>
                                        )}
                                        <span className="text-sm font-medium truncate" title={task.title}>{task.title}</span>
                                    </div>

                                    {/* Grid Lines Background */}
                                    {dates.map((_, i) => (
                                        <div key={i} className="border-r border-border/20 h-full w-full" style={{ gridColumn: i + 2, gridRow: 1 }}></div>
                                    ))}

                                    {/* The Gantt Bar */}
                                    {/* We place it covering the entire timeline track, then position absolutely inside */}
                                    <div
                                        className="relative z-0 h-full py-3 pointer-events-none"
                                        style={{
                                            gridColumn: `2 / -1`, // Span entire timeline area
                                            gridRow: 1
                                        }}
                                    >
                                        <div
                                            className="h-6 rounded-md shadow-sm border border-white/20 flex items-center px-2 text-[10px] text-white font-medium whitespace-nowrap absolute"
                                            style={{
                                                backgroundColor: color,
                                                left: `${leftOffsetPx}px`,
                                                width: `${widthPx}px`
                                            }}
                                        >
                                            <span className="drop-shadow-md sticky left-2">
                                                {durationInDays} days
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
