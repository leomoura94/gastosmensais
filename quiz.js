const quizContainer = document.getElementById('quiz');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const restartButton = document.getElementById('restart');
const reviewButton = document.getElementById('review');

let questions = [];
let currentQuestionIndex = 0;
let answers = [];

function fetchQuestions() {
    return fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            showQuestion(questions[currentQuestionIndex]);
        });
}

function showQuestion(question) {
    quizContainer.innerHTML = `
        <div class="question">${question.question}</div>
        <ul class="answers">
            ${question.answers.map((answer, index) => `
                <li class="answer" data-index="${index}" data-correct="${answer.correct}">
                    ${answer.text}
                </li>
            `).join('')}
        </ul>
    `;
}

function handleAnswerClick(event) {
    if (event.target.classList.contains('answer')) {
        const isCorrect = event.target.getAttribute('data-correct') === 'true';
        const index = event.target.getAttribute('data-index');
        answers[currentQuestionIndex] = { index, isCorrect };

        const allAnswers = document.querySelectorAll('.answer');
        allAnswers.forEach(answer => {
            if (answer.getAttribute('data-correct') === 'true') {
                answer.classList.add('correct');
            } else {
                answer.classList.add('incorrect');
            }
            answer.removeEventListener('click', handleAnswerClick);
        });

        if (isCorrect) {
            event.target.classList.add('correct');
        } else {
            event.target.classList.add('incorrect');
        }

        nextButton.style.display = 'block';
        prevButton.style.display = 'block';
    }
}

function showResult() {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = questions.length;
    quizContainer.innerHTML = `
        <div class="result">
            <h2>Fim do Questionário!</h2>
            <p>Você acertou ${correctAnswers} de ${totalQuestions} perguntas.</p>
            <p>Clique em "Reiniciar Questionário" para jogar novamente ou "Revisar Perguntas" para ver as respostas.</p>
        </div>
    `;
    nextButton.style.display = 'none';
    prevButton.style.display = 'none';
    restartButton.style.display = 'block';
    reviewButton.style.display = 'block';
}

function showReview() {
    quizContainer.innerHTML = `
        <div class="review">
            ${questions.map((question, index) => `
                <div class="question">${question.question}</div>
                <ul class="answers">
                    ${question.answers.map((answer, i) => `
                        <li class="answer ${answers[index] && answers[index].index == i ? 
                            (answer.correct ? 'correct' : 'incorrect') 
                            : ''}" data-index="${i}">
                            ${answer.text}
                        </li>
                    `).join('')}
                </ul>
            `).join('')}
        </div>
    `;
    nextButton.style.display = 'none';
    prevButton.style.display = 'none';
    restartButton.style.display = 'none';
    reviewButton.style.display = 'none';
}

function handleNextClick() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
        prevButton.style.display = 'block';
    } else {
        showResult();
    }
}

function handlePrevClick() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(questions[currentQuestionIndex]);
        nextButton.style.display = 'block';
        if (currentQuestionIndex === 0) {
            prevButton.style.display = 'none';
        }
    }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    fetchQuestions();
    restartButton.style.display = 'none';
    reviewButton.style.display = 'none';
}

fetchQuestions();
quizContainer.addEventListener('click', handleAnswerClick);
nextButton.addEventListener('click', handleNextClick);
prevButton.addEventListener('click', handlePrevClick);
restartButton.addEventListener('click', restartQuiz);
reviewButton.addEventListener('click', showReview);
