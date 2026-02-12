import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Platform, NativeModules, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';

const { CrashReproducerModule } = NativeModules;

export default function App() {
  const [showPdf, setShowPdf] = useState(true);
  const [pdfPath, setPdfPath] = useState(null);
  const [crashResult, setCrashResult] = useState(null);

  // Copy the bundled PDF asset to cache and get the file path
  useEffect(() => {
    if (Platform.OS === 'android' && CrashReproducerModule) {
      CrashReproducerModule.getAssetPdfPath()
        .then((path) => setPdfPath(path))
        .catch((e) => console.log('Failed to get PDF path:', e));
    }
  }, []);

  const togglePdf = useCallback(() => {
    setShowPdf((prev) => !prev);
  }, []);

  // Deterministic crash reproduction: double-close a PdfPage via native module
  const reproduceCrash = useCallback(async () => {
    if (!CrashReproducerModule) {
      Alert.alert('Error', 'CrashReproducerModule not available (Android only)');
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
      </View>

      {showPdf && pdfPath && (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: pdfPath }}
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
