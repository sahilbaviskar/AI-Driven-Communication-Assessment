import os
import sys
import subprocess
import speech_recognition as sr
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import cmudict
import numpy as np
import whisper
import pandas as pd
import re


class SpeechAnalyzer:
    def __init__(self):
        # Download necessary NLTK resources
        nltk.download('punkt', quiet=True)
        nltk.download('averaged_perceptron_tagger', quiet=True)
        nltk.download('cmudict', quiet=True)

        self.pronouncing_dict = cmudict.dict()
        self.whisper_model = whisper.load_model("base")
        self.recognizer = sr.Recognizer()

    def transcribe_audio(self, audio_path):
        if not os.path.exists(audio_path):
            print("Error: File not found.")
            return {'text': "File not found", 'confidence': 0.0}

        try:
            result = self.whisper_model.transcribe(audio_path, language='en')
            return {'text': result['text'], 'confidence': result.get('confidence', 0.7)}
        except Exception as e:
            print(f"Whisper error: {e}")

        try:
            with sr.AudioFile(audio_path) as source:
                audio = self.recognizer.record(source)
            text = self.recognizer.recognize_google(audio)
            return {'text': text, 'confidence': 0.6}
        except sr.UnknownValueError:
            return {'text': "Could not understand audio", 'confidence': 0.0}
        except Exception as e:
            print(f"SpeechRecognition error: {e}")
            return {'text': "Transcription failed", 'confidence': 0.0}

    def analyze_grammar(self, text):
        tokens = word_tokenize(text.lower())
        return {
            'pos_tags': nltk.pos_tag(tokens),
            'error_score': 0  # Placeholder for grammar analysis
        }

    def analyze_pronunciation(self, text):
        words = word_tokenize(text.lower())
        return {'unique_word_count': len(set(words))}

    def analyze_fluency(self, text):
        tokens = word_tokenize(text.lower())
        filler_words = {'um', 'uh', 'like', 'so', 'basically'}
        filler_count = sum(1 for word in tokens if word in filler_words)
        return {
            'speaking_rate': len(tokens) / 2,
            'filler_word_percentage': (filler_count / max(1, len(tokens))) * 100
        }

    def comprehensive_analysis(self, audio_path):
        transcription = self.transcribe_audio(audio_path)
        text = transcription['text']
        return {
            'transcription': transcription,
            'grammar_analysis': self.analyze_grammar(text),
            'pronunciation_analysis': self.analyze_pronunciation(text),
            'fluency_analysis': self.analyze_fluency(text)
        }


def main():
    audio_path = input("Enter the path to your .wav file: ").strip()
    if not audio_path.lower().endswith('.wav'):
        print("Please provide a valid .wav file.")
        return

    analyzer = SpeechAnalyzer()
    results = analyzer.comprehensive_analysis(audio_path)

    report = pd.DataFrame({
        'Metric': ['Confidence', 'Unique Words', 'Speaking Rate', 'Filler %'],
        'Value': [
            results['transcription'].get('confidence', 0),
            results['pronunciation_analysis'].get('unique_word_count', 0),
            results['fluency_analysis'].get('speaking_rate', 0),
            results['fluency_analysis'].get('filler_word_percentage', 0)
        ]
    })

    print("\n--- Speech Analysis Report ---")
    print(report)
    print("\nTranscription:")
    print(results['transcription'].get('text', 'No transcription available'))


if __name__ == "__main__":
    main()