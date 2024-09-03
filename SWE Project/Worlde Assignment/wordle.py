# game state: Grayed Letters (a.), Letters in Wrong Spot (a?), Correct Letters (a+)
# Have access to 58,000 english words

import random

# loads list of possible 5-letter words 
def load_words(filename):
    with open(filename, 'r') as file:
        words = file.read().split()
    return words


# sort list of words by priority (better choices are earlier in the list)
def sort_by_priority(words):
    return words


# return word at beginning of list sorted by priority
def choose_word(words):
    sort_by_priority(words)
    return words[0]


# provides feedback symbols for a guess to a given word [Not being used currently]
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


# filters words list based on rules given by user
def filter_words(words, guess, feedback):

    filtered_words = [] # updated list based on filters

    for word in words: # look through all current possible words

        match = True
        for i, char in enumerate(guess): # look through each letter of each word
            if feedback[i] == '+': # green letters
                if word[i] != char:
                    match = False
            elif feedback[i] == '?': # yellow letters
                if char not in word or word[i] == char:
                    match = False
            elif feedback[i] == '.': # gray letters
                if word[i] == char:
                    match = False
                for j,color in enumerate(feedback): 
                    if color == '.' or color == '?': # letter can't be in any other gray or yellow spots
                        if word[j] == char: match = False

        if match: filtered_words.append(word) # add word if it follows rules

    return filtered_words


def main():

    # get list of all possible guesses
    words = load_words('words.txt')
    
    # instructions
    print("Please enter what you know about the game. Add a '.' after incorrect letters, a '?' after letters in the wrong place, and a '+' after correct letter.\n",
          "Input each piece of info you know seperately and re-run to reset rules.\n", "Example: w.o.r?d+s+")

    # all words are possible at first
    possible_words = words[:] 

    userInput = input("Enter what you know (e to exit): ").strip().lower()
    while (userInput != "e"):
        
        # make sure user follows correct format
        if (len(userInput) != 10 and userInput != "e"):
            print("Make sure you follow the required format.")
        
        # seperate symbols and letters
        guess = []
        feedback = []
        for i in range(10):
            if (i % 2 != 0): feedback.append(userInput[i])
            else: guess.append(userInput[i])

        # update possible words
        possible_words = filter_words(possible_words, guess, feedback)
        if (possible_words != []): print("Guess: ", choose_word(possible_words))
        else: print("No possible guesses in word list!")

        # remove suggested word (only suggest a word once)
        possible_words = list(filter(lambda x: x != choose_word(possible_words), possible_words))

        # get user info for next suggestion
        userInput = input("Enter what you know (e to exit): ").strip().lower()


if __name__ == "__main__":
    main()
