
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar
} from "react-native";

export default function App() {
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState([]);
  
  function addTask() {
    if (!message.trim()) return;
    setTasks([...tasks, message.trim()]);
    setMessage("");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>A</Text>
        <Text style={styles.title}>ALFRED</Text>
        <Text style={styles.subtitle}>
          Votre assistant personnel
        </Text>

        <View style={styles.status}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>
            Système prêt
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Bonjour.</Text>
          <Text style={styles.description}>
            Je suis ALFRED. Votre assistant personnel.
            Comment puis-je vous aider aujourd'hui ?
          </Text>
        </View>

        <Text style={styles.section}>CENTRE DE COMMANDE</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Intelligence</Text>
          <Text style={styles.description}>
            Votre espace de conversation sera bientôt connecté.
          </Text>
        </View>

        <Text style={styles.section}>VOTRE ORGANISATION</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mes tâches</Text>

          {tasks.map((task, index) => (
            <Text key={index} style={styles.task}>
              • {task}
            </Text>
          ))}

          <TextInput
            style={styles.input}
            placeholder="Ajouter une tâche..."
            placeholderTextColor="#777"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={addTask}
          >
            <Text style={styles.buttonText}>
              + Ajouter une tâche
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ALFRED • PERSONAL INTELLIGENCE
          </Text>
          <Text style={styles.footerText}>
            Conçu pour vous.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B16"
  },
  content: {
    padding: 24,
    paddingTop: 65
  },
  logo: {
    color: "#8B7CFF",
    fontSize: 54,
    fontWeight: "bold",
    textAlign: "center"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 8
  },
  subtitle: {
    color: "#9299B5",
    textAlign: "center",
    marginTop: 8
  },
  status: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#36D6A0",
    marginRight: 8
  },
  statusText: {
    color: "#36D6A0",
    fontSize: 12
  },
  card: {
    backgroundColor: "#141A2B",
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#252D48"
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 12
  },
  description: {
    color: "#AAB1C8",
    fontSize: 14,
    lineHeight: 23
  },
  section: {
    color: "#8B7CFF",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 13,
    fontWeight: "bold"
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  input: {
    backgroundColor: "#0B1020",
    borderRadius: 12,
    padding: 15,
    color: "#FFFFFF",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#343B5C"
  },
  button: {
    backgroundColor: "#6557D9",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 12
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },
  task: {
    color: "#DCE1F5",
    marginTop: 8,
    fontSize: 14
  },
  footer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30
  },
  footerText: {
    color: "#69718D",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 5
  }
});
