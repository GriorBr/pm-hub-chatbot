document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const openChatButton = document.getElementById('open-chat-btn');
    const closeChatButton = document.getElementById('close-chat-btn');

    const chatInitialView = document.getElementById('chat-initial-view');
    const chatConversationView = document.getElementById('chat-conversation-view');
    const suggestedActionsList = document.getElementById('suggested-actions-list');
    const quickQuestionsDisplayArea = document.getElementById('quick-questions-display-area');
    const chatLog = document.getElementById('chat-log');
    const backToCategoriesButton = document.getElementById('back-to-categories-btn');

    // --- English Q&A with Emojis - !!! INCOLLA QUI IL TUO OGGETTO predefinedQA COMPLETO !!! ---
    const predefinedQA = {
        "general help / other": "I'm here for you! 🙋‍♂️ Feel free to ask me about the 'Calendar', where to find lecture notes, what 'RBS Blackboard' or 'Virtual Campus' are, how the 'Community' works... basically, anything about the PM Hub! Put me to the test, I love processing requests! 🤓",
        "what is rbs blackboard?": "Ready when you are! 'RBS Blackboard' is your digital passport 🛂 to RBS's official e-learning platform. Imagine it as a boundless library full of course materials, important announcements, and all the school's knowledge, just a click away!",
        "what is virtual campus?": "Sure thing! 'Virtual Campus' is like the main square of Rome Business School, but in digital form! 🏛️ From there, you can access a ton of other resources, course-specific services, and feel part of the great RBS family. Click on it, it's a world to discover!",
        "what is the forum for?": "The 'Forum' is the beating heart ❤️ of our community! It's the perfect space to exchange ideas on course topics with other students, ask those questions buzzing in your head 🐝, share brilliant insights, and, why not, collaborate on epic projects. Don't be shy, my logic says participation is beneficial!",
        "where can i find the hub's rules?": "You'll find them in the 'Rules' section, of course! 📜 They're like the fundamental laws of our galaxy: few, clear, and they ensure our community is a constructive and respectful place for everyone. A quick read never hurts, take a bot's word for it!",
        "where are the lecture notes?": "Absolutely! In 'Lecture Notes' you'll find a real treasure trove 💎: notes, shared materials, and, get this, even Podcasts 🎧 created especially for your course! Think of me as your personal DJ of knowledge. It's a goldmine for studying, don't miss out!",
        "what are suggested books?": "This section is like a Project Management bookworm's 🐛 wish list! You'll find highly recommended books and texts to dive even deeper into the course topics. Great for feeding your neurons! 📚",
        "how do i read the calendar?": "The 'Calendar' is your oracle for course commitments! 📅 It shows you lectures, Q&A sessions, exercises, kick-offs... you name it! You can view it in 'Weekly' mode (for a hawk-eye view of the week) or 'Monthly' mode (to plan like a true strategist). You'll never miss an appointment again!",
        "what are ai resources?": "These are my digital colleagues! 🤖 Jokes aside, they are links to Artificial Intelligence tools that can give you a big hand with studying, research, or when you need a brilliant idea. They're like personal trainers for your brain. Try them out, you might be amazed! 🤯",
        // ... Aggiungi altre corrispondenze esatte se necessario
    };

    // --- !!! INCOLLA QUI IL TUO OGGETTO categorySubQuestions COMPLETO !!! ---
    const categorySubQuestions = {
        "navigation": ["What is RBS Blackboard?", "What is Virtual Campus?"],
        "community": ["What is the Forum for?", "Where can I find the Hub's Rules?"],
        "library": ["Where are the lecture notes?", "What are suggested books?"],
        "calendar-ai": ["How do I read the calendar?", "What are AI Resources?"]
    };

    const defaultResponse = "I'm sorry, I couldn't find a specific answer for that. Please try one of the suggestions. 🤔";

    function switchToInitialView() {
        chatInitialView.style.display = 'block';
        chatConversationView.style.display = 'none';
        quickQuestionsDisplayArea.innerHTML = '';
        quickQuestionsDisplayArea.style.display = 'none';
    }

    function switchToConversationView(isNewChatSession = true) {
        chatInitialView.style.display = 'none';
        chatConversationView.style.display = 'flex';
        if (isNewChatSession && chatLog.children.length === 0) {
            addMessageToLog("Hi there! 👋 How can I assist you with the PM Hub today?", "bot");
        }
    }

    openChatButton.addEventListener('click', () => {
        chatContainer.style.display = 'flex'; // Cambiato da 'flex' a 'flex' per attivare l'animazione
        void chatContainer.offsetWidth; // Force reflow
        chatContainer.classList.add('active');
        openChatButton.style.display = 'none';
        switchToInitialView();
        // Non puliamo il log qui, lo facciamo alla chiusura
    });

    closeChatButton.addEventListener('click', () => {
        chatContainer.classList.remove('active');
        openChatButton.style.display = 'flex';
        setTimeout(() => {
            if (!chatContainer.classList.contains('active')) {
                // chatContainer.style.display = 'none'; // Opzionale, display:none dopo animazione
                switchToInitialView();
                chatLog.innerHTML = ''; // Pulisci il log per la prossima sessione
            }
        }, 300);
    });

    backToCategoriesButton.addEventListener('click', () => {
        switchToInitialView();
    });

    suggestedActionsList.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.suggested-action');
        if (!clickedItem) return;

        const category = clickedItem.dataset.category; // Potrebbe non essere definito se è direct-question senza data-category
        const actionText = clickedItem.querySelector('span').textContent.trim();

        switchToConversationView(chatLog.children.length === 0);

        if (clickedItem.classList.contains('direct-question') || (category && !categorySubQuestions[category])) {
            processQuestion(actionText);
            quickQuestionsDisplayArea.style.display = 'none';
        } else if (category && categorySubQuestions[category]) {
            quickQuestionsDisplayArea.innerHTML = '';
            const subQuestions = categorySubQuestions[category];
            subQuestions.forEach(qText => {
                const btn = document.createElement('button');
                btn.classList.add('quick-question-btn');
                btn.textContent = qText;
                btn.addEventListener('click', () => {
                    processQuestion(qText);
                    // Non nascondere quickQuestionsDisplayArea qui, il pulsante Back gestisce il ritorno
                });
                quickQuestionsDisplayArea.appendChild(btn);
            });
            quickQuestionsDisplayArea.style.display = 'flex';
            addMessageToLog(`You selected: ${actionText.replace(/^[^\w\s]+|[^\w\s]+$/g, "")}. Choose an option:`, "bot");
        } else {
            // Fallback se manca data-category ma non è direct-question
            processQuestion(actionText);
            quickQuestionsDisplayArea.style.display = 'none';
        }
    });

    function processQuestion(questionText) {
        addMessageToLog(questionText, "user");
        const questionTextLower = questionText.toLowerCase();
        let botResponse = defaultResponse;

        if (predefinedQA.hasOwnProperty(questionTextLower)) {
            botResponse = predefinedQA[questionTextLower];
        }
        // Non c'è più fallback 'includes' perché l'input è solo da pulsanti

        setTimeout(() => {
            addMessageToLog(botResponse, "bot");
        }, 400 + Math.random() * 300);
    }

    function addMessageToLog(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

        const textNode = document.createElement('span');
        textNode.textContent = text;
        messageDiv.appendChild(textNode);

        chatLog.appendChild(messageDiv);
        // Scrolla solo se la chat è visibile e c'è overflow
        if (chatLog.scrollHeight > chatLog.clientHeight) {
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    }
});
