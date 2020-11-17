var app = new Vue({
    el: '#app',
    data: {
        title: 'Trivia',
        token: undefined,
        questionAmount: 5,
        questions: {},
        totalQuestionsAnswered: 0,
        totalQuestionsCorrect: 0,
        currentCategoryIndex: undefined,
        currentCategoryName: undefined,
        turnsInCategory: 0, // How many times you've done a certain category
        turnsPerCategory: 3, // How many question reloads per category
        categories: [ // These are pulled from the site
            {
                "id": 9,
                "name": "General Knowledge"
            }, {
                "id": 10,
                "name": "Entertainment: Books"
            }, {
                "id": 11,
                "name": "Entertainment: Film"
            }, {
                "id": 12,
                "name": "Entertainment: Music"
            }, {
                "id": 13,
                "name": "Entertainment: Musicals & Theatres"
            }, {
                "id": 14,
                "name": "Entertainment: Television"
            }, {
                "id": 15,
                "name": "Entertainment: Video Games"
            }, {
                "id": 16,
                "name": "Entertainment: Board Games"
            }, {
                "id": 17,
                "name": "Science & Nature"
            }, {
                "id": 18,
                "name": "Science: Computers"
            }, {
                "id": 19,
                "name": "Science: Mathematics"
            }, {
                "id": 20,
                "name": "Mythology"
            }, {
                "id": 21,
                "name": "Sports"
            }, {
                "id": 22,
                "name": "Geography"
            }, {
                "id": 23,
                "name": "History"
            }, {
                "id": 24,
                "name": "Politics"
            }, {
                "id": 25,
                "name": "Art"
            }, {
                "id": 26,
                "name": "Celebrities"
            }, {
                "id": 27,
                "name": "Animals"
            }, {
                "id": 28,
                "name": "Vehicles"
            }, {
                "id": 29,
                "name": "Entertainment: Comics"
            }, {
                "id": 30,
                "name": "Science: Gadgets"
            }, {
                "id": 31,
                "name": "Entertainment: Japanese Anime & Manga"
            }, {
                "id": 32,
                "name": "Entertainment: Cartoon & Animations"
            }]
    },
    computed: {
        correctPercentage() {
            return Math.floor((this.totalQuestionsCorrect / this.totalQuestionsAnswered) * 100)
        }
    },
    methods: {
        getQuestions() {
            this.questions = {}; // Clears out questions when we request new ones                        

            $('#categoryName').hide()

            let oldTitle = this.title
            this.title = 'Loading..'

            this.turnsInCategory += 1

            if(this.turnsInCategory > this.turnsPerCategory){
                let categorySelection = Math.floor(Math.random() * this.categories.length)
                this.currentCategoryIndex = this.categories[categorySelection].id;
                this.currentCategoryName = this.categories[categorySelection].name;
                this.turnsInCategory = 1;
            }
            
            // Async load questions
            $.getJSON("https://opentdb.com/api.php?amount="+this.questionAmount+"&category="+this.currentCategoryIndex+"&token="+this.token, function (data) {
                app.questions = data.results;
                for (q of app.questions) {
                    // The answer index is needed to add icons when checking users answers
                    q.correctAnswerIndex = Math.round(Math.random() * q.incorrect_answers.length)

                    // Insert correct_answer randomly into incorrect_answers array
                    q.incorrect_answers.splice(q.correctAnswerIndex, 0, q.correct_answer)

                    // Additional question properties
                    q.chosen_answer = ""
                    q.chosenAnswerIndex = undefined // Necessary for checking answers and adding icons 
                }
            }).then(() => {
                // Reset visuals after load
                this.title = oldTitle
                $('#loadingLabel').hide()
                $('#moreQuestionsButton').hide()
                $('#categoryName').show()
                $('#submitButton').show()
            }); 
        },
        domDecoder(str) {
            // Required to turn things like &quot; into "
            let parser = new DOMParser();
            let dom = parser.parseFromString('<!doctype html><body>' + str, 'text/html');
            return dom.body.textContent;
        },
        submit() {
            this.totalQuestionsAnswered += this.questionAmount
            for ([index, q] of this.questions.entries()) {
                // Marks correct answer, regardless of the guess
                $('#q' + index + 'a' + q.correctAnswerIndex).prepend('<i class="check circle icon"></i>')

                // If the guess is incorrect
                if (q.chosenAnswerIndex !== q.correctAnswerIndex && typeof q.correctAnswerIndex !== undefined) {
                    // Marks incorrect answer if an answer is selected and the guess is incorrect
                    $('#q' + index + 'a' + q.chosenAnswerIndex).prepend('<i class="ban icon"></i>')
                    // Marks the container with a red line
                    $('#questionsForm > div:nth-child(' + (index + 1) + ')').addClass('red')
                }
                // If guess is correct
                if (q.chosen_answer == q.correct_answer) {
                    $('#questionsForm > div:nth-child(' + (index + 1) + ')').addClass('green')
                    this.totalQuestionsCorrect += 1
                }
            }
            $('.questionOption').attr('disabled', 'disabled') // Turns off radio buttons
            $('#submitButton').hide()
            $('#moreQuestionsButton').show()
        },
        hideElement(selector) {
            $(selector).toggle()
        },
        setChosenAnswerIndex(qIndex, aIndex) {
            this.questions[qIndex].chosenAnswerIndex = aIndex
        }
    },
    mounted: function () {
        $.getJSON("https://opentdb.com/api_token.php?command=request", function (data) {
            app.token = data.token // has to be app. 'this' is likely the data object
        }).then(()=>{
            // Initial category choice - do before getting questions
            let categorySelection = Math.floor(Math.random() * this.categories.length)
            this.currentCategoryIndex = this.categories[categorySelection].id;
            this.currentCategoryName = this.categories[categorySelection].name;
            this.getQuestions(this.questionAmount)
        })
    }
})

// window.onbeforeunload = function(event){
//     return confirm("Confirm refresh. All progress will be lost.")
// }