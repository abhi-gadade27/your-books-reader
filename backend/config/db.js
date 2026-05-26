import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Helper to resolve paths
const __dirname = path.resolve();
const DATA_DIR = path.join(__dirname, 'data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure data directory and JSON database exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(JSON_DB_PATH)) {
  const initialData = {
    users: [],
    books: [],
    feedbacks: [],
    bookRequests: [],
    notifications: [],
    ratings: [],
    activityLogs: []
  };
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2));
}

let useMongoDB = false;

// Connect to MongoDB
export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_books_reader';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    useMongoDB = true;
    console.log('>>> MongoDB connected successfully! Running in Mongo Database Mode.');
  } catch (error) {
    useMongoDB = false;
    console.warn(`>>> MongoDB connection failed: ${error.message}`);
    console.warn('>>> Falling back to Local JSON File Database Mode (C:\\Users\\shree\\.gemini\\antigravity\\scratch\\your-books-reader\\backend\\data\\db.json).');
  }
};

// ==========================================
// MONGODB SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profileImage: { type: String, default: '' },
  readingHistory: [{
    bookId: String,
    bookTitle: String,
    bookCover: String,
    progress: Number,
    page: Number,
    lastRead: Date
  }],
  wishlist: [String],
  readingStreak: { type: Number, default: 0 },
  lastReadDate: { type: String, default: '' },
  favoriteCategories: [String],
  badges: [String],
  createdAt: { type: Date, default: Date.now }
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  category: { type: String, required: true },
  language: { type: String, default: 'English' },
  description: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  chapters: [{ title: String, content: String }],
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, required: true },
  resolved: { type: Boolean, default: false },
  reply: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const bookRequestSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  category: { type: String, required: true },
  language: { type: String, required: true },
  notes: { type: String, default: '' },
  userEmail: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'announcement' },
  targetRole: { type: String, default: 'all' },
  createdAt: { type: Date, default: Date.now }
});

const ratingSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
const MongoBook = mongoose.models.Book || mongoose.model('Book', bookSchema);
const MongoFeedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
const MongoBookRequest = mongoose.models.BookRequest || mongoose.model('BookRequest', bookRequestSchema);
const MongoNotification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const MongoRating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
const MongoActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// ==========================================
// LOCAL JSON DB CRUD IMPLEMENTATION
// ==========================================

const readJsonDB = () => {
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB', err);
    return { users: [], books: [], feedbacks: [], bookRequests: [], notifications: [], ratings: [], activityLogs: [] };
  }
};

const writeJsonDB = (data) => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON DB', err);
  }
};

// Generic JSON Query Helpers
const jsonFind = (collectionName, query = {}) => {
  const db = readJsonDB();
  const list = db[collectionName] || [];
  return list.filter(item => {
    for (const key in query) {
      if (query[key] !== undefined && item[key] !== query[key]) {
        return false;
      }
    }
    return true;
  });
};

const jsonFindOne = (collectionName, query = {}) => {
  const list = jsonFind(collectionName, query);
  return list.length > 0 ? list[0] : null;
};

const jsonCreate = (collectionName, doc = {}) => {
  const db = readJsonDB();
  const _id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const newDoc = { _id, ...doc, createdAt: doc.createdAt || new Date().toISOString() };
  if (!db[collectionName]) db[collectionName] = [];
  db[collectionName].push(newDoc);
  writeJsonDB(db);
  return newDoc;
};

const jsonFindByIdAndUpdate = (collectionName, id, update = {}) => {
  const db = readJsonDB();
  const list = db[collectionName] || [];
  const index = list.findIndex(item => item._id === id);
  if (index === -1) return null;
  const current = list[index];
  
  // Basic $push support for wishlist, readingHistory, badges, favoriteCategories etc.
  const updated = { ...current };
  
  // Apply update operators
  if (update.$push) {
    for (const key in update.$push) {
      if (!updated[key]) updated[key] = [];
      updated[key].push(update.$push[key]);
    }
  }
  if (update.$pull) {
    for (const key in update.$pull) {
      if (updated[key]) {
        updated[key] = updated[key].filter(val => val !== update.$pull[key]);
      }
    }
  }
  
  // Apply standard updates
  const cleanUpdate = { ...update };
  delete cleanUpdate.$push;
  delete cleanUpdate.$pull;
  delete cleanUpdate.$set; // In case mongoose syntax is used
  
  Object.assign(updated, cleanUpdate);
  if (update.$set) {
    Object.assign(updated, update.$set);
  }
  
  list[index] = updated;
  writeJsonDB(db);
  return updated;
};

const jsonFindByIdAndDelete = (collectionName, id) => {
  const db = readJsonDB();
  const list = db[collectionName] || [];
  const index = list.findIndex(item => item._id === id);
  if (index === -1) return null;
  const deleted = list.splice(index, 1)[0];
  writeJsonDB(db);
  return deleted;
};

// ==========================================
// UNIFIED DB MODEL EXPORTS
// ==========================================

export const db = {
  Users: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoUser.find(query);
      return jsonFind('users', query);
    },
    findOne: async (query = {}) => {
      if (useMongoDB) return MongoUser.findOne(query);
      return jsonFindOne('users', query);
    },
    findById: async (id) => {
      if (useMongoDB) return MongoUser.findById(id);
      return jsonFindOne('users', { _id: id });
    },
    create: async (doc) => {
      if (useMongoDB) return MongoUser.create(doc);
      return jsonCreate('users', doc);
    },
    findByIdAndUpdate: async (id, update, options = { new: true }) => {
      if (useMongoDB) return MongoUser.findByIdAndUpdate(id, update, options);
      return jsonFindByIdAndUpdate('users', id, update);
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return MongoUser.findByIdAndDelete(id);
      return jsonFindByIdAndDelete('users', id);
    },
    updateOne: async (query, update) => {
      if (useMongoDB) return MongoUser.updateOne(query, update);
      const user = await jsonFindOne('users', query);
      if (user) {
        return jsonFindByIdAndUpdate('users', user._id, update);
      }
      return null;
    }
  },
  Books: {
    find: async (query = {}) => {
      if (useMongoDB) {
        // If title query or author query is passed as regex, handle it
        return MongoBook.find(query);
      }
      // Simple regex search support for local JSON
      const db = readJsonDB();
      let list = db.books || [];
      return list.filter(book => {
        for (const key in query) {
          if (query[key] instanceof RegExp) {
            if (!query[key].test(book[key])) return false;
          } else if (typeof query[key] === 'object' && query[key] !== null) {
            // handles potential MongoDB nested queries
            continue;
          } else if (query[key] !== undefined && book[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    },
    findOne: async (query = {}) => {
      if (useMongoDB) return MongoBook.findOne(query);
      return jsonFindOne('books', query);
    },
    findById: async (id) => {
      if (useMongoDB) return MongoBook.findById(id);
      return jsonFindOne('books', { _id: id });
    },
    create: async (doc) => {
      if (useMongoDB) return MongoBook.create(doc);
      return jsonCreate('books', doc);
    },
    findByIdAndUpdate: async (id, update, options = { new: true }) => {
      if (useMongoDB) return MongoBook.findByIdAndUpdate(id, update, options);
      return jsonFindByIdAndUpdate('books', id, update);
    },
    findByIdAndDelete: async (id) => {
      if (useMongoDB) return MongoBook.findByIdAndDelete(id);
      return jsonFindByIdAndDelete('books', id);
    },
    countDocuments: async (query = {}) => {
      if (useMongoDB) return MongoBook.countDocuments(query);
      const list = jsonFind('books', query);
      return list.length;
    }
  },
  Feedbacks: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoFeedback.find(query).sort({ createdAt: -1 });
      return jsonFind('feedbacks', query).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (doc) => {
      if (useMongoDB) return MongoFeedback.create(doc);
      return jsonCreate('feedbacks', doc);
    },
    findByIdAndUpdate: async (id, update) => {
      if (useMongoDB) return MongoFeedback.findByIdAndUpdate(id, update, { new: true });
      return jsonFindByIdAndUpdate('feedbacks', id, update);
    }
  },
  BookRequests: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoBookRequest.find(query).sort({ createdAt: -1 });
      return jsonFind('bookRequests', query).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (doc) => {
      if (useMongoDB) return MongoBookRequest.create(doc);
      return jsonCreate('bookRequests', doc);
    },
    findByIdAndUpdate: async (id, update) => {
      if (useMongoDB) return MongoBookRequest.findByIdAndUpdate(id, update, { new: true });
      return jsonFindByIdAndUpdate('bookRequests', id, update);
    }
  },
  Notifications: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoNotification.find(query).sort({ createdAt: -1 });
      return jsonFind('notifications', query).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (doc) => {
      if (useMongoDB) return MongoNotification.create(doc);
      return jsonCreate('notifications', doc);
    },
    deleteMany: async (query = {}) => {
      if (useMongoDB) return MongoNotification.deleteMany(query);
      const db = readJsonDB();
      db.notifications = [];
      writeJsonDB(db);
      return { deletedCount: db.notifications.length };
    }
  },
  Ratings: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoRating.find(query).sort({ createdAt: -1 });
      return jsonFind('ratings', query).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    create: async (doc) => {
      if (useMongoDB) return MongoRating.create(doc);
      return jsonCreate('ratings', doc);
    }
  },
  ActivityLogs: {
    find: async (query = {}) => {
      if (useMongoDB) return MongoActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
      const list = jsonFind('activityLogs', query);
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
    },
    create: async (doc) => {
      if (useMongoDB) return MongoActivityLog.create(doc);
      return jsonCreate('activityLogs', doc);
    }
  }
};
