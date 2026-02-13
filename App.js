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
import Pdf from 'react-native-pdf';

const Stack = createNativeStackNavigator();

// Public PDF URLs for testing (real-world documents, like keene uses)
const DOCUMENTS = [
  {
    title: 'Technical Data Sheet',
    subtitle: '4 pages',
    url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
  },
  {
    title: 'Sample Report',
    subtitle: '8 pages',
    url: 'https://www.africau.edu/images/default/sample.pdf',
  },
];

function DocumentListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
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

function PDFViewerScreen({ route }) {
  const { url } = route.params;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {totalPages > 0 && (
        <View style={styles.pageBar}>
          <Text style={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
      )}
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
      <Stack.Navigator>
        <Stack.Screen
          name="Documents"
          component={DocumentListScreen}
          options={{ headerLargeTitle: true }}
        />
        <Stack.Screen
          name="PDFViewer"
          component={PDFViewerScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  pageBar: {
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
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
