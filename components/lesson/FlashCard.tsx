import { useRef, useState } from "react";
import { StyleSheet, View, Text, Pressable, Animated } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";
export default function FlashCard({
    word,
    direction
}:{
    word: Word;
    direction: "en-zh" | "zh-en";
}){
    const [isFlipped, setIsFlipped] = useState(false)
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const frontInterpolation = flipAnimation.interpolate({
        inputRange:[0,180],
        outputRange:["0deg","180deg"]
    })
    const backInterpolation = flipAnimation.interpolate({
        inputRange:[0,180],
        outputRange:["180deg","360deg"]
    })
    const frontAnimatedStyle ={
        transform: [{rotateY: frontInterpolation}]
    }
    const backAnimatedStyle ={
        transform: [{rotateY: backInterpolation}]
    }
    const flipFront = () =>{
        Animated.timing(flipAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start()
        setIsFlipped(false)
    };
    const flipToBack = () =>{
        Animated.timing(flipAnimation, {
            toValue: 180,
            duration: 250,
            useNativeDriver: true
        }).start()
        setIsFlipped(true)
    }
    const FrontContent = () => {
    if (direction === "en-zh") {
      return (
        <ThemedText style={styles.englishFront}>{word.english}</ThemedText>
      );
    }

    return (
      <View style={styles.mandarinContent}>
        <ThemedText style={styles.pinyin}>{word.pinyin}</ThemedText>
        <ThemedText style={styles.hanzi}>{word.hanzi}</ThemedText>
      </View>
    );
  };

  const BackContent = () => {
    if (direction === "en-zh") {
      return (
        <View style={styles.mandarinContent}>
          <ThemedText style={[styles.pinyin, styles.mandarinBackText]}>
            {word.pinyin}
          </ThemedText>
          <ThemedText style={[styles.hanzi, styles.mandarinBackText]}>
            {word.hanzi}
          </ThemedText>
        </View>
      );
    }

    return (
        <Pressable onPress={isFlipped ? flipFront: flipToBack}>
            <View style={}>
                <Animated.View style={[styles.card,styles.cardFront, frontAnimatedStyle]}>
                    {FrontContent()}
                </Animated.View>
                <Animated.View style={[styles.card,styles.cardBack, backAnimatedStyle]}>
                    {BackContent()}
                </Animated.View>
            </View>
        </Pressable>
    )
}
const styles = StyleSheet.create({
  card: {
    width: 340,
    maxHeight: 440,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  cardFront: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardBack: {
    backgroundColor: "#1a1a2e",
    position: "absolute",
    top: 0,
  },
  mandarinContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  pinyin: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "90%",
  },
  hanzi: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    maxWidth: "90%",
  },
  mandarinBackText: {
    color: "white",
  },
  englishFront: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontWeight: "600",
    maxWidth: "90%",
  },
  englishBack: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: "90%",
  },
});