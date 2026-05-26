import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, db } from './config/db.js';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static assets if any
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all fallback route
app.get('/', (req, res) => {
  res.send('Your Books Reader Backend API is running!');
});

// Seed Initial Premium Books if Library is Empty
const seedInitialBooks = async () => {
  try {
    const bookCount = await db.Books.countDocuments({});
    if (bookCount === 0) {
      console.log('>>> Library is empty. Seeding premium default books (English & Marathi)...');
      
      const seedBooks = [
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
          pdfUrl: "",
          rating: 4.8,
          reviewsCount: 15,
          category: "Fiction",
          language: "English",
          description: "A gorgeous story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.",
          isFeatured: true,
          chapters: [
            { title: "Prologue", content: "The alchemist picked up a book that someone in the caravan had brought. Leafing through the pages, he found a story about Narcissus. The alchemist knew the legend of Narcissus, a youth who knelt daily beside a lake to contemplate his own beauty. He was so fascinated by himself that, one morning, he fell into the lake and drowned. At the spot where he fell, a flower was born, which was called the narcissus..." },
            { title: "Part 1 - Chapter 1", content: "The boy's name was Santiago. Dust was falling as he arrived with his herd at an abandoned church. The roof had fallen in long ago, and an enormous sycamore had grown on the spot where the sacristy once stood. He decided to spend the night there. He saw to it that all the sheep entered through the ruined gate, and then he laid some planks across it to prevent the flock from wandering away during the night. There were no wolves in the region, but once an animal had strayed, and the boy had to spend all the next day searching for it." },
            { title: "Part 1 - Chapter 2", content: "He swept the floor with his jacket and lay down, using the book he had just finished reading as a pillow. He told himself that he would have to start reading thicker books: they lasted longer and made more comfortable pillows. When he awoke, it was still dark. Looking up, he could see the stars through the half-ruined roof. 'I wanted to sleep a little longer,' he thought. He had had the same dream that night as a week ago, and once again he had awakened before it ended." }
          ]
        },
        {
          title: "Shyamchi Aai (श्यामची आई)",
          author: "Sane Guruji",
          coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=600&auto=format&fit=crop&q=80",
          pdfUrl: "",
          rating: 4.9,
          reviewsCount: 24,
          category: "Classic Literature",
          language: "Marathi",
          description: "श्यामची आई हे साने गुरुजी यांनी लिहिलेले मराठीतील अत्यंत लोकप्रिय आणि भावनिक आत्मचरित्रात्मक पुस्तक आहे. या पुस्तकातून आईबद्दलचे अपार प्रेम, संस्कार आणि कौटुंबिक मूल्यांचे सुंदर दर्शन घडते.",
          isFeatured: true,
          chapters: [
            { title: "प्रस्तावना (Introduction)", content: "श्यामची आई हे केवळ पुस्तक नसून तो मानवी भावनांचा एक पवित्र झरा आहे. साने गुरुजी यांनी आपल्या आईच्या आठवणी अत्यंत भावूक आणि रसाळ भाषेत मांडल्या आहेत. या कथेतील संस्कार आजही महाराष्ट्रातील प्रत्येक घराघरात आदर्श मानले जातात." },
            { title: "रात्र पहिली: सांजवात (First Night: Evening Prayer)", content: "आश्रम शांत झाला होता. प्रार्थना संपली होती. सर्व मुले कोंडाळ करून बसली होती. श्याम आज काहीतरी सांगणार होता. श्यामने डोळे मिटले आणि त्याला त्याची आई आठवली. श्याम सांगू लागला: 'माझी आई मला लहानपणी सांजवात लावायला शिकवायची. ती म्हणायची, श्याम, घरात देव्हाऱ्यात दिवा लागला की मनातील अंधार दूर होतो. प्रकाश हा ईश्वराचे रूप आहे. दिव्याकडे पाहून प्रार्थना कर: तिमिरोनी तेजाकडे ने आम्हा प्रभू...'" },
            { title: "रात्र दुसरी: आईचे डोळे (Second Night: Mother's Eyes)", content: "दुसऱ्या रात्री मुले पुन्हा जमली. श्यामने पुढे सांगायला सुरुवात केली: 'माझी आई साधी होती, पण तिच्या डोळ्यांत अथांग माया होती. एकदा मी खूप हट्ट केला. मला नवीन सदरा हवा होता. पण वडिलांची परिस्थिती बेताची होती. आईने मला जवळ घेतले आणि माझ्या डोक्यावरून हात फिरवत म्हणाली: श्याम, फाटकं असलं तरी चालेल, पण स्वच्छ असावं. गर्वाचे कपडे घालण्यापेक्षा समाधानाचे सुती कपडे अंगी शोभतात. तिचे ते शब्द माझ्या हृदयात कोरले गेले.'" }
          ]
        },
        {
          title: "Mrityunjay (मृत्युंजय)",
          author: "Shivaji Sawant",
          coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
          pdfUrl: "",
          rating: 4.9,
          reviewsCount: 38,
          category: "Novel",
          language: "Marathi",
          description: "मृत्युंजय ही शिवाजी सावंत यांची महाभारतातील महानायक कर्ण याच्या जीवनावर आधारित मराठीतील कालजयी कादंबरी आहे. कर्णाची दानशूरता, त्याचे संघर्ष आणि त्याचे दुःखद जीवन अत्यंत प्रभावीपणे रेखाटले आहे.",
          isFeatured: true,
          chapters: [
            { title: "प्रारंभ: सूतपुत्र (The Beginning: Suta's Son)", content: "गंगाकाठचा तो सकाळचा सूर्य अत्यंत तेजस्वी होता. मी पाण्यात उभा राहून सूर्याची उपासना करत होतो. माझे कवच आणि कुंडल सुवर्णप्रकाशात चकाकत होते. लोक मला 'सूतपुत्र कर्ण' म्हणत. पण माझ्या अंतरात एक राजा जन्माला आला होता. समाजाच्या नियमांनी मला नेहमीच नाकारले, पण गंगामाईने आणि भगवान भास्करने मला कधीही परके मानले नाही." },
            { title: "अध्याय १: कवच आणि कुंडल (Chapter 1: The Armor and Earrings)", content: "माझ्या जन्मासोबतच लाभलेले ते दैवी कवच-कुंडल माझी कवच ढाल होते. माता राधेने मला मुलासारखे सांभाळले. अदिरथाने मला सूतकुळातील धनुर्विद्या शिकवली. पण माझे लक्ष्य काही वेगळेच होते. मला श्रेष्ठ धनुर्धर व्हायचे होते, पण प्रत्येक वेळी माझं कुळ आडवं येत होतं. मी द्रोणाचार्यांकडे गेलो, पण त्यांनी मला सूतपुत्र म्हणून नाकारले. तिथूनच माझ्या संघर्षाची ठिणगी पडली." }
          ]
        },
        {
          title: "Wings of Fire",
          author: "A.P.J. Abdul Kalam",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
          pdfUrl: "",
          rating: 4.9,
          reviewsCount: 30,
          category: "Biography",
          language: "English",
          description: "An inspiring autobiography of Dr. A.P.J. Abdul Kalam, former President of India. It traces his early life, his work on India's missile and space research programs, and his rise to the highest office in the country.",
          isFeatured: false,
          chapters: [
            { title: "Chapter 1: Orientation", content: "I was born into a middle-class Tamil family in the island town of Rameswaram in the erstwhile Madras State. My father, Jainulabdeen, had neither much formal education nor much wealth; despite these disadvantages, he possessed great innate wisdom and a true generosity of spirit. My mother, Ashiamma, was an ideal helpmate to him. I was one of many children—a short boy with rather undistinguished looks, born to handsome and tall parents." },
            { title: "Chapter 2: Academic Journey", content: "After completing my school education at the Schwartz High School, Ramanathapuram, I was filled with a burning desire to pursue higher education. I went to Saint Joseph's College, Tiruchirappalli, to study for a B.Sc. degree. Science was starting to dominate my thoughts, and physics was my favorite subject. I wanted to fly, to touch the sky, and engineering was the only path that could lead me there." }
          ]
        },
        {
          title: "Swami (स्वामी)",
          author: "Ranjit Desai",
          coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80",
          rating: 4.7,
          reviewsCount: 18,
          category: "Historical Fiction",
          language: "Marathi",
          description: "स्वामी ही श्रीमंत माधवराव पेशवे यांच्या पराक्रमावर आणि वैयक्तिक आयुष्यावर आधारित एक सुप्रसिद्ध ऐतिहासिक कादंबरी आहे. माधवराव आणि रमाबाई यांच्यातील नाते आणि मराठी साम्राज्याची कथा यात आहे.",
          isFeatured: false,
          chapters: [
            { title: "प्रकरण १: शनिवारवाडा (Chapter 1: Shaniwar Wada)", content: "पुण्याचा शनिवारवाडा आज शांत होता. थोरले बाजीराव पेशवे यांच्या निधनानंतर नानासाहेबांनी कारभार हाती घेतला होता. पण तरुण माधवराव यांच्या खांद्यावर लवकरच मोठी जबाबदारी पडणार होती. राघोबादादांची कारस्थाने आणि निजामाचे आक्रमण या दुहेरी संकटात अडकलेला महाराष्ट्र माधवरावांच्या नेतृत्वाची वाट पाहत होता." },
            { title: "प्रकरण २: कर्तव्याची हाक (Chapter 2: Call of Duty)", content: "माधवरावांनी वयाच्या सोळाव्या वर्षी पेशवेपदाची वस्त्रे स्वीकारली. शनिवारवाड्यातील दरबार भरला होता. राघोबादादा समोर बसले होते. माधवरावांचे डोळे तेजस्वी होते. त्यांनी स्पष्टपणे सांगितले: 'पेशवेपद ही उपभोगाची वस्तू नसून स्वराज्याची सेवा करण्याचे व्रत आहे. जो कोणी स्वराज्याशी प्रतारणा करेल, तो आमचा शत्रू असेल.' संपूर्ण दरबारात शांतता पसरली." }
          ]
        },
        {
          title: "Chhava (छावा)",
          author: "Shivaji Sawant",
          coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80",
          rating: 4.9,
          reviewsCount: 42,
          category: "Novel",
          language: "Marathi",
          description: "छत्रपती संभाजी महाराजांच्या दिव्य आणि शौर्यशाली चरित्रावर आधारित शिवाजी सावंत यांची गाजलेली कादंबरी. संभाजी महाराजांचे बालपण, त्यांचा संघर्ष, त्यांचे शौर्य आणि त्यांचे अद्वितीय बलिदान या पुस्तकात वर्णन केले आहे.",
          isFeatured: true,
          chapters: [
            { title: "अध्याय १: सिंहाचा छावा (Chapter 1: The Lion's Cub)", content: "किल्ले पुरंदरवर वीरश्री सळसळत होती. शिवपुत्र संभाजी महाराजांचा जन्म झाला होता. जिजाऊंच्या मार्गदर्शनाखाली संभाजीराजे घडत होते. लहानपणापासूनच त्यांच्यात अफाट बुद्धिमत्ता, युद्धकौशल्य आणि स्वराज्याबद्दलची निष्ठा दिसून येत होती. शिवरायांचा हा छावा शत्रूला धडकी भरवणारा होता." },
            { title: "अध्याय २: संघर्षाची वाट (Chapter 2: Path of Struggle)", content: "संभाजीराजांचे आयुष्य सोपे नव्हते. आग्र्याहून सुटका, अनेक आक्रमणे आणि अंतर्गत विरोधकांचा कट या सर्व संकटांना त्यांनी समर्थपणे तोंड दिले. वयाच्या लहान वयातच त्यांनी संस्कृतचे ज्ञान आणि राजनीती हस्तगत केली होती. स्वराज्याचा वारसा पुढे नेण्यासाठी ते सज्ज झाले होते." }
          ]
        }
      ];

      for (const book of seedBooks) {
        await db.Books.create(book);
      }
      console.log('>>> Seeding complete! 6 premium books added.');
    }
    
    // Seed admin account on startup if it doesn't exist
    const adminExists = await db.Users.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('>>> Seeding default Admin account...');
      const bcryptjs = await import('bcryptjs');
      const salt = await bcryptjs.default.genSalt(10);
      const hashedPassword = await bcryptjs.default.hash('Admin@123', salt);
      
      await db.Users.create({
        username: 'Administrator',
        email: 'admin@yourbooksreader.com',
        password: hashedPassword,
        role: 'admin',
        profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
        wishlist: [],
        readingHistory: [],
        readingStreak: 0,
        badges: ['Grandmaster']
      });
      console.log('>>> Default Admin credentials: admin / Admin@123');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

// Start Server and Connect DB
connectDB().then(() => {
  // Seed data
  seedInitialBooks();
  
  app.listen(PORT, () => {
    console.log(`>>> Server running on port ${PORT}...`);
  });
});
