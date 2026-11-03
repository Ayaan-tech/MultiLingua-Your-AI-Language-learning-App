import AsyncStorage from "@react-native-async-storage/async-storage";
const STATs_KEY = "@speaking_listening_stats";

export interface SpeakingListeningStats {
    minutesSpoken: number;
    minutesListened: number;
    lastUpdate: String;
    questionAnswered: number;
    questionListened: number;
    conversationTurns: number
}
const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

const readStats = async(): Promise<SpeakingListeningStats>=>{
    try {
        const raw=  await AsyncStorage.getItem(STATs_KEY)
        if(!raw){
            return getDefaultStats();
        }
        return JSON.parse(raw) as SpeakingListeningStats;
    } catch (error) {
        return getDefaultStats();
    }
}
const writeStats = async(stats: SpeakingListeningStats): Promise<void>=>{
    try {
        await AsyncStorage.setItem(STATs_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to save stats", error);
    }
}

const getDefaultStats = (): SpeakingListeningStats => {
    return {
        minutesSpoken: 0,
        minutesListened: 0,
        lastUpdate: new Date().toISOString(),
        questionAnswered: 0,
        questionListened: 0,
        conversationTurns: 0
    };
}

export const recordQuestionsAnswered = async():Promise<void>=>{
    const stats = await readStats()
    stats.questionAnswered += 1;
    stats.minutesListened = stats.questionAnswered*MINUTES_PER_QUESTION
    stats.lastUpdate = new Date().toISOString()
    await writeStats(stats)
}
export const recordQuestionsListened = async():Promise<void>=>{
    const stats = await readStats()
    stats.questionListened += 1;
    stats.minutesListened = stats.questionListened*MINUTES_PER_QUESTION
    stats.lastUpdate = new Date().toISOString()
    await writeStats(stats)
} 
export const recordConversationTurn = async () => {
  const stats = await readStats();
  stats.conversationTurns += 1;

  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const getWeekStatistics = async() =>{
    const stats = await readStats()
    return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    weeklyChange: {
      spoken: 0,
      listened: 0,
    },
  };
};
