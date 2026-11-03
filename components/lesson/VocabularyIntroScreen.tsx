import { Question } from "@/constants/courseData"
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native"
import ProgressHeader from "./ProgressHeader";
import ConfirmDialog from "../ui/confirmDialog";
import { router } from "expo-router";
import { ThemedText } from "../themed-text";
import FlashCard from "./FlashCard";
interface StudyCard{
    key: string;
    word: Word;
    direction: "zh-en" | "en-zh"
}
interface DeckBuckets {
    recognition: StudyCard[];
    recall: StudyCard[];
    total: number;
}
type StudyPhase = "recognition" | "recall"
interface StudyPhrase {
    phase: StudyPhase;
    queue: string[];
    recallKeys: string[];
    card: Record<string, StudyCard>
    total: number;
    completed: number
}
const getUniqueWords = (questions: Question[]):Word[]=>{
    const allWords = new Map<string, Word>()
    questions.forEach((question)=>{
        const wordSource = "listening_mc"
        ? question.mandarin.words
        : question.options.flatMap((option)=>option.mandarin.words)
        wordSource.forEach((word)=>{
            if(word && word.hanzi && !allWords.has(word.hanzi)){
                allWords.set(word.hanzi, word)
            }
        })
    });
    return Array.from(allWords.values())
}
const buildDeck = (words: Word[]): DeckBuckets=>{
    const recognition : StudyCard[] = words.map((word)=>({
        key:`${word.hanzi}-recall`,
        word,
        direction:"zh-en"
    }))
    const recall : StudyCard[] = words.map((word)=>({
        key:`${word.hanzi}-recall`,
        word,
        direction:"zh-en"
    })) 
    return {
        recognition,
        recall,
        total: recognition.length + recall.length
    }
};
const initializeStudyState = (deck: DeckBuckets):StudyState =>{
    const cards :Record<string, StudyCard>={};
    [...deck.recognition, ...deck.recall].forEach((entry)=>{
        cards[entry.key]=entry
    })
    return{
        phrase:"recognition",
        queue:deck.recognition.map((card)=>card.key),
        recallKeys:[],
        card:cards,
        total:deck.total,
        completed:0
    }
}
export default function VocabularyIntroScreen({
    questions,
    onStartLesson
}: {
    questions: Question[]
    onStartLesson: () => void
}) {
    const vocabulary = useMemo(()=>getUniqueWords(questions), [questions])
    const deck=  useMemo(()=>buildDeck(vocabulary), [vocabulary])
    const [studyState, setStudyState] = useState<StudyState>(()=>initializeStudyState(deck))
    const [exitContainerVisible , setExitContainerVisible] = useState(false)
    useEffect(()=>{
        if(studyState.queue.length === 0 
            && studyState.recallKeys.length === 0 
            && studyState.completed >= studyState.total ){
            onStartLesson()
        }   
    },[studyState])

    const handleGrade = useCallback((grade: "again" | "good")=>{
      setStudyState((prev)=>{
        if(!prev.queue.length) return prev;
        const [activeKey, ...restQueue] = prev.queue;
        const entry  =prev.cards[activeKey];
        if(!entry) return  {...prev, queue: restQueue}
        let queue = [...restQueue]
        let completed = prev.completed
        let phase: StudyPhase = prev.phase
        let recallKeys = prev.recallKeys

        if(grade === "again"){
          const insertIndex = Math.min(2,queue.length)
          queue.splice(insertIndex, 0, activeKey)
        }else{
          completed = Math.min(prev.completed +1, prev.total)
        }
        if(queue.length ===0 && phase === "recognition" && recallKeys.length > 0){
          queue = [...recallKeys];
          recallKeys = []
          phase = "recall"
        }
        return{
          ...prev,
          queue,
          completed,
          phase,
          recallKeys
        }
      })
    }, [])
    if(deck.total == 0){
      onStartLesson()
      return null
    }

    const ProgressPercent = studyState.total ===0 ?0:(studyState.completed/ studyState.total)*100
    const currentKey = studyState.queue[0]
    const currentCard = currentKey ? studyState.cards[currentKey] : undefined;
    const headerCount = currentCard ? Math.min(studyState.completed +1, studyState.total) : studyState.completed
    
    return (
        <View style={styles.container}>
            <ConfirmDialog 
            visible={exitContainerVisible}
            title="Exit Practice"
            description="Are you sure want to exit? Your progress with lost"
            cancelLabel="Cancel"
            confirmLabel="Exit"
            destructive
            onCancel={()=>setExitContainerVisible(false)}
            onConfirm={()=>{
                setExitContainerVisible(false)
                router.push("/lessons")
            }} />
            <ProgressHeader
            progress={ProgressPercent}
            currentCount={headerCount}
            totalCount={studyState.total}
            onClose={()=>setExitContainerVisible(true)}/>
            <View style={styles.content}>
              <View style={ styles.instructionContainer}>
                <ThemedText style={styles.instructionTitle}>Lesson Vocabulary</ThemedText>
                <ThemedText style={styles.instructionText}>Tap the flip. Retry cards you still need to review</ThemedText>
              </View>
              {currentCard ? (
                <View style={styles.flashcardContainer}>
                  <FlashCard
                  key={currentCard.key}
                  word={currentCard.word}
                  direction={currentCard.direction}/>
                </View>
              ):(null)}
              <View style={styles.bottomActions}>
                <View style={styles.gradeButtons}>
                  <Pressable 
                  onPress={()=>handleGrade("again")}
                  style={({pressed})=>[
                    styles.gradeButton,
                    styles.againButton,
                    !!currentCard ? styles.disabledButton : null,
                    pressed && !!currentCard ? styles.pressedButton : null,
                  ]}>
                    <ThemedText style={styles.gradeButtonText}>Again</ThemedText>
                  </Pressable>
                  <Pressable
                  onPress={()=>handleGrade("good")}
                  disabled={!currentCard}
                  style={({pressed})=>[
                    styles.gradeButton,
                    styles.gotItButton,
                    !!currentCard ? styles.disabledButton : null,
                    pressed && !!currentCard ? styles.pressedButton : null,
                  ]}>
                    <ThemedText style={styles.gradeButtonText}>Got it</ThemedText>
                  </Pressable>
                </View>
                <Pressable 
                onPress={onStartLesson}
                style={({pressed})=>[
                  styles.skipButton,
                  pressed && styles.skipButtonPressed
                ]}>
                  <ThemedText style={styles.skipButtonText}>Skip to Lesson</ThemedText>
                </Pressable>
              </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  instructionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 15,
    color: Colors.subduedTextColor,
    textAlign: "center",
    lineHeight: 22,
  },
  flashcardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  bottomActions: {
    marginTop: "auto",
    paddingTop: 16,
    gap: 16,
  },
  gradeButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  againButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  gotItButton: {
    backgroundColor: Colors.primaryAccentColor,
    borderColor: Colors.primaryAccentColor,
  },
  disabledButton: {
    opacity: 0.4,
  },
  pressedButton: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  gradeButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
  },
  gradeButtonTextWhite: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
  },
  skipButton: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.subduedTextColor,
  },
});