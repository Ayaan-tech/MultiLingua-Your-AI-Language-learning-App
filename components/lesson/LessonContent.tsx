import { Animated, View } from "react-native";
import { Question } from "@/constants/courseData";
import { Text, StyleSheet } from "react-native";
import ProgressHeader from "./ProgressHeader";
import { useMemo, useRef, useState } from "react";
import ConfirmDialog from "../ui/confirmDialog";
import { router } from "expo-router";
import {Audio} from 'expo-av'
import AudioPrompt from "./AudioPrompt";

interface WrongQuestion{
    english:string;
    mandarin:{
        hanzi:string;
        pinyin:string;
    };
    attempts:number
}

export interface LessonStats {
    correctAnswer: number;
    totalQuestions: number;
    accuracy: number;
    wrongQuestions?: WrongQuestion[]
}
export default function LessonContent({
    questions, 
    lessonId}:
    {questions:Question[], 
    lessonId:string}) {
        const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
        const [exitConfirmVisible, setExitConfirmVisible] = useState(false)
        const [showMandarin, setShowMandarin] = useState(false)
        const [selectedOption , setSelectedOption] = useState<number | null>(null)
        const [isLoading, setIsLoading] = useState(false)
        const [showResult, setShowResult] = useState(false)
        const [haslistenedToAudio ,setHaslistenedToAudio] = useState(false)
        const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
        const [attemptedCount, setAttemptedCount] = useState(0)
        const [isRecognizing, setIsRecognizing] = useState(false)
        const recordingRef = useRef<Audio.Recording | null>(null)
        const [transcription , setTranscription] = useState<{
            expected:String;
            said: String
        } | null>(null)
        const currentQuestion = useMemo(()=>questions[currentQuestionIndex],[questions, currentQuestionIndex])
        const [isSpeechPlaying, setSpeechPlaying] = useState(false)
        //Lesson Completion
        const [showCompleteScreen , setShowCompleteScreen ] = useState<boolean|null>(false)
        const [lessonStats, setLessonStats] = useState<LessonStats | null>(null)
        const [questionAttempts, setQuestionAttempts] = useState<Record<number, number>>([])
        const [correctAnswersCount, setCorrecAnswersCount] = useState(0)
        const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set())
        const fadeAnim =useRef(new Animated.Value(0)).current
        const scaleAnim =useRef(new Animated.Value(1)).current
        const optionalAnimvalue = useRef(new Animated.Value(0)).current
        const audioSectionAnimationHeight = useRef(new Animated.Value(0)).current
        const optionSelectionAnimation = useRef(new Animated.Value(0)).current
        const instructionOpacity = useRef(new Animated.Value(1)).current
        const listeningOpacity = useRef(new Animated.Value(0)).current
        const listeningScale = useRef(new Animated.Value(0.95)).current
        const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false)


        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
        <View style={styles.container}>
            <ConfirmDialog
            visible={exitConfirmVisible}
            title="Exit Practice"
            description="Are you sure you want to quit ? Your progress will be lost"
            cancelLabel="Cancel"
            confirmLabel="Confirm"
            onConfirm={()=>{
                setExitConfirmVisible(false)
                router.push("/lessons")
            }}
            onCancel={()=>setExitConfirmVisible(false)}/>
            <ProgressHeader
            progress={progress}
            currentCount={currentQuestionIndex + 1}
            totalCount={questions.length}
            onClose={()=>setExitConfirmVisible(true)}/>
            {/**Main content */}
            <View style={styles.content}>
                <Animated.View style={[styles.audioSection, {
                    backgroundColor:"#f9fafb",
                    minHeight: audioSectionAnimationHeight,
                    flex: haslistenedToAudio ? 0: 1,
                    justifyContent?: "center",
                    opacity: isLoading || showResult ? 0.6 : 1
                },
                ]}
                pointerEvents={isLoading || showResult? "none" : "auto"}>
                    <AudioPrompt
                    isPlaying={isSpeechPlaying}
                    isRecognizing={isRecognizing}
                    haslistenedToAudio={hasStartedFirstPlay}
                    onPlay={()=>{}}
                    onStartRecord={()=>{}}
                    onStopRecord={()=>{}}
                    onRevealMandarin={()=>{}}
                    currentQuestion={currentQuestion}
                    showMandarin={showMandarin}
                    selectedOption={selectedOption}
                    scaleAnim={scaleAnim}
                    instructionOpacity={instructionOpacity}
                    listeningOpacity={listeningOpacity}
                    listingScale={listeningScale}
                    fadeAnim={fadeAnim}/>
                </Animated.View>
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
  },
  audioSection: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  optionsSection: {
    flex: 1,
    marginBottom: 30,
  },
  bottomSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  feedbackWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
});