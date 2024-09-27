from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException 
from time import sleep

def test_playbutton():
    driver = webdriver.Chrome()
    driver.get(f"https://beta.keyboardhero.arizotaz.com/")
    assert "Keyboard Hero" in driver.title

    sleep(2)
    try: 
        #Find buttons to check if page has loaded correctly
        button = driver.find_element(By.XPATH, "//button[@onclick='MenuManager.GoTo(MENU_GAME);']")
        print("Button Found") 
    except NoSuchElementException: 
        print("Button Not Found") 

    #Housekeeping.
    driver.close()

def test_keyboardinputs():
    driver = webdriver.Chrome()
    driver.get(f"https://beta.keyboardhero.arizotaz.com/")
    assert "Keyboard Hero" in driver.title

    #Allow the website to load
    sleep(2)

    #Navigate to first button, will need adjusting if layout is changed
    driver.find_element(By.XPATH, "//button[@onclick='MenuManager.GoTo(MENU_GAME);']").click()

    #Allow the game to load
    sleep(1)


    #This whole loop is mainly a placeholder (lacks a way to stop in the event of failure), will later use a different variable to test the 
    #last pressed key the game registered to avoid the need to spam. Will check the other keys then. 

    #Variable to store the result of the javascript variable, as by the time the loop condition is checked its likely already been cleared.
    returnedKey = 0
    #Target the p5js canvas the game is on, likely redundant. 
    game = driver.find_element(By.CLASS_NAME, "p5Canvas")
    while not returnedKey:
        #Needs to spam d to register input, inefficient & will be replaced.
        ActionChains(driver)\
            .send_keys_to_element(game, "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")\
            .perform()
        
        #Pull input, might take a few tries due to how quickly the variable is cleared and as such this is looped.
        returnedKey = driver.execute_script("return input[0];")

        #Print if input was registered by game.
        if returnedKey:
            print("Key Registered")

    #House Keeping.
    driver.close()

if __name__ == "__main__":
    test_playbutton()
    test_keyboardinputs()
    print("done.")
