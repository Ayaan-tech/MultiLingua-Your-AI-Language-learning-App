import { getWeekStatistics } from "@/lib/speakingListeningStats";
import { useEffect, useState } from "react";

interface WeekStats {
    minutesSpoken: number;
    minutesListened: number;
    weeklyChange: {
        spoken: number;
        listened: number;
    };
}
export const useSpeakingListening = () => {
    const [stas, setStats] = useState<WeekStats | null>(null)
    const [loading, setLoading] = useState(true)
    const refresh = async()=>{
        try {
            const weeklyStats = await getWeekStatistics();
            setStats(weeklyStats) 
        } catch (error) {
            console.error("Error fetching week statistics:", error)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        refresh()
    }, [])
    return { stats: stas, loading, refresh }
}
