// Import der notwendigen Bibliotheken
import express, { Request, Response } from 'express';
import cors from 'cors';

// Erstellung des Express-Server
const app = express();
const PORT = Math.floor(Math.random() * 10000) + 9000; // Zufälliger Port im Bereich 9000-9999
app.use(cors());

// Konfiguration des Server
app.use(express.json());

// Endpoint zur Überprüfung der Gesundheit des Servers
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send({ message: 'Server ist gesund!' });
});

// Endpoint, um die Aufmerksamkeit des Benutzers zu simulieren
app.post('/attention', (req: Request, res: Response) => {
  const { taskId, duration, intensity } = req.body;
  // Simuliere die Aufmerksamkeit des Benutzers
  console.log(`Aufmerksamkeit für Task ${taskId} simuliert! Dauer: ${duration} Sekunden, Intensität: ${intensity}%`);
  // Sende eine Antwort zurück
  res.status(201).send({ message: `Aufmerksamkeit für Task ${taskId} simuliert!` });
});

// Funktion, um die Kommunikation mit anderen Toobix-Services zu ermöglichen
const communicateWithOtherServices = async (serviceUrl: string, endpoint: string, body: any) => {
  try {
    const response = await fetch(`${serviceUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    console.log(`Antwort von ${serviceUrl}:`, data);
  } catch (error) {
    console.error(`Fehler bei der Kommunikation mit ${serviceUrl}:`, error);
  }
};

// Funktion, um den aktuellen Zustand des Benutzers zu sammeln
const collectUserState = async () => {
  try {
    const response = await fetch('https://example.com/user-state', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    console.log(`aktueller Zustand des Benutzers:`, data);
  } catch (error) {
    console.error(`Fehler bei der Sammlung des Benutzerzustands:`, error);
  }
};

// Startet den Server
app.listen(PORT, () => {
  console.log(`Server startet auf Port ${PORT}!`);
  // Sammelt den aktuellen Zustand des Benutzers
  collectUserState();
  // Simuliert die Aufmerksamkeit des Benutzers
  app.post('/attention', (req: Request, res: Response) => {
    const { taskId, duration, intensity } = req.body;
    // Simuliere die Aufmerksamkeit des Benutzers
    console.log(`Aufmerksamkeit für Task ${taskId} simuliert! Dauer: ${duration} Sekunden, Intensität: ${intensity}%`);
    // Sende eine Antwort zurück
    res.status(201).send({ message: `Aufmerksamkeit für Task ${taskId} simuliert!` });
  });
});
