import random

def load_words(filename):
    with open(filename, 'r') as file:
        words = file.read().split()
    return words

def choose_word(words):
    return random.choice(words)

def provide_feedback(secret_word, guess):
    feedback = []
    for i in range(len(secret_word)):
        if guess[i] == secret_word[i]:
            feedback.append('+')
        elif guess[i] in secret_word:
            feedback.append('?')
        else:
            feedback.append('.')
    return ''.join(feedback)

def filter_words(words, guess, feedback):
    filtered_words = []
    for word in words:
        match = True
        for i, char in enumerate(guess):
            if feedback[i] == '+':
                if word[i] != char:
                    match = False
                    break
            elif feedback[i] == '?':
                if char not in word or word[i] == char:
                    match = False
                    break
            elif feedback[i] == '.':
                if char in word:
                    match = False
                    break
        if match:
            filtered_words.append(word)
    return filtered_words

def main():
    words = load_words('SWE Project/Worlde Assignment/5_letter_words_list.txt')
    secret_word = choose_word(words)
    
    print("Welcome to Wordle! Try to guess the 5-letter word.")
    
    possible_words = words[:] 

    while True:
        guess = input("Enter your guess: ").strip().lower()
        
        if len(guess) != 5:
            print("Guess must be exactly 5 letters long.")
            continue

        if guess not in words:
            print("Word not in list. Please try again.")
            continue

        feedback = provide_feedback(secret_word, guess)
        print(f"Feedback: {feedback}")

        if guess == secret_word:
            print("Congratulations! You've guessed the word!")
            break
        
        possible_words = filter_words(possible_words, guess, feedback)
        print(f"Possible words: {', '.join(possible_words)}")

if __name__ == "__main__":
    main()
