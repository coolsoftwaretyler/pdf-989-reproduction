import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  NativeModules,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';

const { CrashReproducerModule } = NativeModules;

export default function App() {
  const [pdfPath, setPdfPath] = useState(null);
  const [viewing, setViewing] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && CrashReproducerModule) {
      CrashReproducerModule.getAssetPdfPath()
        .then((path) => setPdfPath(path))
        .catch((e) => console.log('Failed to get PDF path:', e));
    }
  }, []);

  const openDocument = useCallback(() => {
    setViewing(true);
  }, []);

  // Navigating back from the PDF viewer simulates the real crash scenario:
  // the component unmounts while the background rendering thread is still
  // working, causing a double-close of the PdfPage — exactly issue #989.
  //
  // Without the fix: the app force-closes (uncaught IllegalStateException).
  // With the fix: navigates back cleanly.
  const closeDocument = useCallback(() => {
    setViewing(false);
    if (CrashReproducerModule) {
      CrashReproducerModule.triggerDoubleClose();
    }
  }, []);

  // PDF viewer screen
  if (viewing && pdfPath) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity onPress={closeDocument} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sample Document</Text>
          <View style={styles.backButton} />
        </View>
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
      </SafeAreaView>
    );
  }

  // Document list screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Documents</Text>

      <TouchableOpacity style={styles.docItem} onPress={openDocument} disabled={!pdfPath}>
        <View style={styles.docIcon}>
          <Text style={styles.docIconText}>PDF</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>Sample Document</Text>
          <Text style={styles.docSubtitle}>50 pages</Text>
        </View>
        <Text style={styles.chevron}>&gt;</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Document list
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  docSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#ccc',
  },
  // PDF viewer
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
});
