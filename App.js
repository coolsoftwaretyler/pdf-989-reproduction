import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  NativeModules,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Pdf from 'react-native-pdf';

const { CrashReproducerModule } = NativeModules;

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// -- Tab screens --

function DocumentListScreen({ navigation }) {
  const [pdfPath, setPdfPath] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'android' && CrashReproducerModule) {
      CrashReproducerModule.getAssetPdfPath()
        .then((path) => setPdfPath(path))
        .catch((e) => console.log('Failed to get PDF path:', e));
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documents</Text>
      <TouchableOpacity
        style={styles.docItem}
        onPress={() => navigation.navigate('PDFViewer', { title: 'Sample Document', pdfPath })}
        disabled={!pdfPath}
      >
        <View style={styles.docIcon}>
          <Text style={styles.docIconText}>PDF</Text>
        </View>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>Sample Document</Text>
          <Text style={styles.docSubtitle}>50 pages</Text>
        </View>
        <Text style={styles.chevron}>&gt;</Text>
      </TouchableOpacity>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
    </View>
  );
}

// -- Tab navigator (sits inside the root stack) --

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="DocumentsTab" component={DocumentListScreen} options={{ title: 'Documents' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// -- PDF viewer (pushed onto root stack, above tabs) --
// headerShown: false on root stack, with a custom RN header — matches keene

function PDFViewerScreen({ route, navigation }) {
  const { pdfPath } = route.params;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sample Document</Text>
        <View style={styles.headerRight}>
          {totalPages > 0 && (
            <Text style={styles.pageIndicator}>
              {currentPage} / {totalPages}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.pdfContainer}>
        <Pdf
          source={{ uri: pdfPath, cache: true }}
          style={styles.pdf}
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
          }}
          onError={(error) => {
            console.log('PDF error:', error);
          }}
        />
      </View>
    </View>
  );
}

// Root: native stack with tabs + PDF viewer
// Matches keene's structure: root stack > bottom tabs, with PdfViewer
// pushed onto the root stack above the tabs. When navigating back from
// PdfViewer, the tab navigator's ScreenContainer re-attaches inactive
// tab fragments while the PdfViewer fragment is being removed — creating
// competing fragment transactions that widen the race window.

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={TabNavigator} />
        <RootStack.Screen name="PDFViewer" component={PDFViewerScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 10,
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
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  pageIndicator: {
    fontSize: 13,
    color: '#888',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
});
