// Global variables
let currentUser = null;
let quizData = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correct: 1
    },
    {
        question: "How many continents are there?",
        options: ["5", "6", "7", "8"],
        correct: 2
    },
    {
        question: "What is the largest ocean?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    },
    {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Au", "Fe", "Pb"],
        correct: 1
    },
    {
        question: "How many sides does a hexagon have?",
        options: ["5", "6", "7", "8"],
        correct: 1
    },
    {
        question: "What is the fastest land animal?",
        options: ["Lion", "Cheetah", "Horse", "Elephant"],
        correct: 1
    },
    {
        question: "Which month has 28 days?",
        options: ["January", "February", "April", "June"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;
let timer = 600; // 10 minutes
let timerInterval;
let userAnswers = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkCurrentPage();
});

// Check current page and run appropriate functions
function checkCurrentPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPath) {
        case 'login.html':
            initLogin();
            break;
        case 'register.html':
            initRegister();
            break;
        case 'quiz.html':
            initQuiz();
            break;
        case 'result.html':
            showResults();
            break;
        case 'profile.html':
            initProfile();
            break;
    }
}

// === AUTHENTICATION ===
function initLogin() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

function initRegister() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', handleRegister);
    }
}
// ADD TEST ACCOUNTS (Run once)
const testUsers = [
    { name: "Test User", email: "test@example.com", password: "123456", quizzes: 3, totalScore: 25, bestScore: 9 },
    { name: "Quiz Student", email: "student@quiz.com", password: "quiz123", quizzes: 5, totalScore: 35, bestScore: 10 },
    { name: "Admin User", email: "admin@quiz.com", password: "admin", quizzes: 10, totalScore: 85, bestScore: 10 }
];

let users = JSON.parse(localStorage.getItem('users') || '[]');
testUsers.forEach(user => {
    if (!users.find(u => u.email === user.email)) {
        users.push(user);
    }
});
localStorage.setItem('users', JSON.stringify(users));
console.log('✅ Test accounts added!');

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple authentication (in real app, use proper backend)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login successful! Redirecting to quiz...');
        window.location.href = 'quiz.html';
    } else {
        alert('Invalid credentials!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    const newUser = { name, email, password, quizzes: 0, totalScore: 0, bestScore: 0 };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert('Registration successful! Starting your first quiz...');
    window.location.href = 'quiz.html';
}

// === QUIZ FUNCTIONALITY ===
function initQuiz() {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }

    loadQuestion();
    initQuizControls();
    startTimer();
}

function loadQuestion() {
    const quizContent = document.getElementById('quizContent');
    const questionNum = document.getElementById('questionNum');
    const currentScoreEl = document.getElementById('currentScore');

    if (currentQuestion < quizData.length) {
        questionNum.textContent = currentQuestion + 1;
        currentScoreEl.textContent = score;

        const q = quizData[currentQuestion];
        quizContent.innerHTML = `
            <div class="question">
                <h3>${currentQuestion + 1}. ${q.question}</h3>
                <div class="options">
                    ${q.options.map((option, index) => `
                        <div class="option" data-index="${index}">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Load previous answer
        if (userAnswers[currentQuestion] !== undefined) {
            document.querySelectorAll('.option')[userAnswers[currentQuestion]].classList.add('selected');
        }

        // Add event listeners to options
        document.querySelectorAll('.option').forEach((option, index) => {
            option.addEventListener('click', () => selectOption(index));
        });

        updateControls();
    }
}

function selectOption(index) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');
    userAnswers[currentQuestion] = index;
}

function initQuizControls() {
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            loadQuestion();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            loadQuestion();
        }
    });

    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
}

function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.disabled = currentQuestion === 0;
    
    if (currentQuestion === quizData.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timer <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
        timer--;
    }, 1000);
}

function submitQuiz() {
    clearInterval(timerInterval);
    
    // Calculate score
    score = 0;
    quizData.forEach((q, index) => {
        if (userAnswers[index] === q.correct) {
            score++;
        }
    });

    // Update user stats
    currentUser.quizzes = (currentUser.quizzes || 0) + 1;
    currentUser.totalScore = (currentUser.totalScore || 0) + score;
    currentUser.bestScore = Math.max(currentUser.bestScore || 0, score);
    
    // Save to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Redirect to results
    localStorage.setItem('latestScore', score);
    window.location.href = 'result.html';
}

// === RESULTS ===
function showResults() {
    const score = parseInt(localStorage.getItem('latestScore') || 0);
    const percentage = Math.round((score / 10) * 100);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('resultMessage').textContent = 
        percentage >= 80 ? "Excellent performance!" :
        percentage >= 60 ? "Good job! Keep practicing!" :
        "Better luck next time!";

    const grade = percentage >= 90 ? 'A' : 
                  percentage >= 80 ? 'B' : 
                  percentage >= 70 ? 'C' : 
                  percentage >= 60 ? 'D' : 'F';
    document.getElementById('grade').textContent = grade;
    
    document.getElementById('resultTitle').textContent = 
        percentage >= 80 ? '🎉 Outstanding!' :
        percentage >= 60 ? '👍 Well Done!' : '📚 Keep Learning!';
}

// === PROFILE ===
function initProfile() {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.email) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    
    const avgScore = currentUser.quizzes > 0 ? 
        Math.round((currentUser.totalScore / currentUser.quizzes) * 10) : 0;
    
    document.getElementById('totalQuizzes').textContent = currentUser.quizzes || 0;
    document.getElementById('avgScore').textContent = avgScore + '%';
    document.getElementById('bestScore').textContent = (currentUser.bestScore || 0) + '/10';
    document.getElementById('userRank').textContent = '#42'; // Simulated rank
}