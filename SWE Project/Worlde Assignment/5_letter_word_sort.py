with open('SWE Project/Worlde Assignment/words.txt', 'r') as file:
    words = file.read().splitlines()

five_letter_words = [word for word in words if len(word) == 5]

with open('5_letter_words_list.txt', 'w') as file:
    for word in five_letter_words:
        file.write(word + '\n')

print("Words with exactly 5 letters have been written to '5_letter_words_list.txt'.")
