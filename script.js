// script.js - Centralized Project Logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// १. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1R12cux1Bl-vOn65-4418LpjYmdPmfcY",
    authDomain: "video-xxx-78940.firebaseapp.com",
    projectId: "video-xxx-78940",
    storageBucket: "video-xxx-78940.firebasestorage.app",
    messagingSenderId: "935960694374",
    appId: "1:935960694374:web:be0297f93d7abd0bc3a7a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- API Functions ---

// २. Get All Videos from Firebase
export const fetchAllVideos = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "video"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("API Error (fetch):", error);
        return [];
    }
};

// ३. Google Login
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        throw error;
    }
};

// ४. Handle Double Tap (Advanced Seek Logic)
export const setupDoubleTap = (videoElement, forwardHint, backwardHint) => {
    let lastTap = 0;
    videoElement.addEventListener('touchstart', (e) => {
        const now = Date.now();
        if ((now - lastTap) < 300) {
            const rect = videoElement.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            
            if (x > rect.width / 2) {
                videoElement.currentTime += 10;
                showHint(forwardHint);
            } else {
                videoElement.currentTime -= 10;
                showHint(backwardHint);
            }
        }
        lastTap = now;
    });

    function showHint(hintEl) {
        if (!hintEl) return;
        hintEl.style.display = 'block';
        setTimeout(() => { hintEl.style.display = 'none'; }, 500);
    }
};

// ५. Manage Dynamic Title Customization
export const updateTitleStyle = (elementId, size) => {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.setProperty('--title-size', size + 'px');
    }
};


// script.js भित्र यस्तो हुनुपर्छ:
export const fetchAllVideos = async () => {
    const querySnapshot = await getDocs(collection(db, "video"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ६. Auto-Redirect & User Data Sync
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname;

    if (!user) {
        // यदि लगइन छैन र युजर पेज (user.html) मा जान खोज्दैछ भने लगइनमा पठाउने
        if (currentPage.includes("user.html")) {
            window.location.href = "login.html";
        }
    } else {
        // लगइन छ भने एडमिन प्यानलको लागि युजर डेटा Firestore मा पठाउने
        try {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                lastLogin: new Date().toISOString()
            }, { merge: true });
            
            // यदि लगइन पेजमा छ भने सिधै युजर पेजमा लैजाने
            if (currentPage.includes("login.html")) {
                window.location.href = "user.html";
            }
        } catch (err) {
            console.error("User Sync Error:", err);
        }
    }
});

