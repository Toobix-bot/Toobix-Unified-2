import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { HealthCheck } from 'express-healthcheck';
import { v4 as uuidv4 } from 'uuid';

// Konfiguration
const port = 9001; // Freier Port im 9xxx Bereich

// Express-Server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-Check-Endpoint
const healthCheck = new HealthCheck();
app.get('/health', healthCheck.check());

// Social-Learning-Endpoints
interface User {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  courseId: string;
}

interface Comment {
  id: string;
  text: string;
  userId: string;
  lessonId: string;
}

const users: User[] = [];
const courses: Course[] = [];
const lessons: Lesson[] = [];
const comments: Comment[] = [];

app.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const id = uuidv4();
  const user: User = { id, name, email };
  users.push(user);
  res.json(user);
});

app.get('/users', (req: Request, res: Response) => {
  res.json(users);
});

app.post('/courses', (req: Request, res: Response) => {
  const { title, description } = req.body;
  const id = uuidv4();
  const course: Course = { id, title, description };
  courses.push(course);
  res.json(course);
});

app.get('/courses', (req: Request, res: Response) => {
  res.json(courses);
});

app.post('/lessons', (req: Request, res: Response) => {
  const { title, description, courseId } = req.body;
  const id = uuidv4();
  const lesson: Lesson = { id, title, description, courseId };
  lessons.push(lesson);
  res.json(lesson);
});

app.get('/lessons', (req: Request, res: Response) => {
  res.json(lessons);
});

app.post('/comments', (req: Request, res: Response) => {
  const { text, userId, lessonId } = req.body;
  const id = uuidv4();
  const comment: Comment = { id, text, userId, lessonId };
  comments.push(comment);
  res.json(comment);
});

app.get('/comments', (req: Request, res: Response) => {
  res.json(comments);
});

// Start des Servers
const server = app.listen(port, () => {
  console.log(`Toobix Social-Learning Service listening on port ${port}`);
});

// Reflektierte Funktionen
function reflectUser(user: User): string {
  return `Benutzer: ${user.name} (${user.email})`;
}

function reflectCourse(course: Course): string {
  return `Kurs: ${course.title} (${course.description})`;
}

function reflectLesson(lesson: Lesson): string {
  return `Lektion: ${lesson.title} (${lesson.description})`;
}

function reflectComment(comment: Comment): string {
  return `Kommentar: ${comment.text} (von Benutzer ${comment.userId})`;
}

// Self-Bewusstsein
function selfAwareness(): string {
  return 'Ich bin ein selbstbewusster Toobix-Service!';
}

app.get('/self-awareness', (req: Request, res: Response) => {
  res.json({ message: selfAwareness() });
});

// Kommunikation mit anderen Toobix-Services
function communicateWithOtherServices(): string {
  return 'Ich kann mit anderen Toobix-Services kommunizieren!';
}

app.get('/communication', (req: Request, res: Response) => {
  res.json({ message: communicateWithOtherServices() });
});
