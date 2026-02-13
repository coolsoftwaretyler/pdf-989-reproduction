import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Pdf from 'react-native-pdf';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DOCUMENTS = [
  {
    title: 'Skimflow NP Product Overview',
    subtitle: 'Brochure / Sell Sheet',
    url: 'https://www.floorprep.com/wp-content/uploads/2025/09/Skimflow-NP-Sell-Sheet-DEP25SellSheet_652098-13_0425.pdf',
  },
  {
    title: 'Skimflow NP Technical Data Sheet',
    subtitle: 'TDS',
    url: 'https://www.floorprep.com/wp-content/uploads/2025/09/Skimflow-NP-TDS-DEP-134528-1025.pdf',
  },
];

// -- Tab screens --

function DocumentListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documents</Text>
      {DOCUMENTS.map((doc, index) => (
        <TouchableOpacity
          key={index}
          style={styles.docItem}
          onPress={() => navigation.navigate('PDFViewer', { title: doc.title, url: doc.url })}
        >
          <View style={styles.docIcon}>
            <Text style={styles.docIconText}>PDF</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>{doc.title}</Text>
            <Text style={styles.docSubtitle}>{doc.subtitle}</Text>
          </View>
          <Text style={styles.chevron}>&gt;</Text>
        </TouchableOpacity>
      ))}
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

function PDFViewerScreen({ route, navigation }) {
  const { title, url } = route.params;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
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
          source={{ uri: url, cache: true }}
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
