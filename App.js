import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, Platform, NativeModules, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Pdf from 'react-native-pdf';

const { CrashReproducerModule } = NativeModules;

// Use bundled asset on Android (remote URLs fail in emulator due to SSL trust manager issue)
const PDF_SOURCES = [
  Platform.OS === 'android'
    ? { uri: 'bundle-assets://sample.pdf' }
    : { uri: 'https://pdfobject.com/pdf/sample-3pp.pdf' },
  Platform.OS === 'android'
    ? { uri: 'bundle-assets://sample.pdf' }
    : { uri: 'https://pdfobject.com/pdf/sample-3pp.pdf' },
];

export default function App() {
  const [showPdf, setShowPdf] = useState(true);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [crashResult, setCrashResult] = useState(null);

  const togglePdf = useCallback(() => {
    setShowPdf((prev) => !prev);
  }, []);

  const swapSource = useCallback(() => {
    setSourceIndex((prev) => (prev + 1) % PDF_SOURCES.length);
  }, []);

  // Deterministic crash reproduction: double-close a PdfPage via native module
  const reproduceCrash = useCallback(async () => {
    if (!CrashReproducerModule) {
      Alert.alert('Error', 'CrashReproducerModule not available');
      return;
    }
    setCrashResult('Running...');
    try {
      const result = await CrashReproducerModule.triggerDoubleClose();
      setCrashResult(result);
    } catch (e) {
      setCrashResult(`ERROR: ${e.message}`);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>PDF Crash Reproducer (Issue #989)</Text>
      <Text style={styles.instructions}>
        Tap "REPRODUCE CRASH" to trigger a deterministic double-close{'\n'}
        of a PdfPage — the exact scenario from the race condition.
      </Text>

      <View style={styles.buttons}>
        <Button
          title="REPRODUCE CRASH"
          onPress={reproduceCrash}
          color="#e74c3c"
        />
      </View>

      {crashResult && (
        <View style={[
          styles.resultBox,
          crashResult.startsWith('CRASH') ? styles.resultCrash :
          crashResult.startsWith('SUCCESS') ? styles.resultSuccess : styles.resultPending
        ]}>
          <Text style={styles.resultText}>{crashResult}</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Button title={showPdf ? 'Unmount PDF' : 'Mount PDF'} onPress={togglePdf} />
        <Button title="Swap Source" onPress={swapSource} />
      </View>

      {showPdf && (
        <View style={styles.pdfContainer}>
          <Pdf
            source={PDF_SOURCES[sourceIndex]}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded: ${numberOfPages} pages`);
            }}
            onError={(error) => {
              console.log('PDF error:', error);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 12,
  },
  resultBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  resultCrash: {
    backgroundColor: '#fde8e8',
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  resultSuccess: {
    backgroundColor: '#e8fde8',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  resultPending: {
    backgroundColor: '#f0f0f0',
  },
  resultText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  pdf: {
    flex: 1,
  },
});
