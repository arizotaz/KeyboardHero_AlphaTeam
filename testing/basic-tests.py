from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException 
from time import sleep

def test_playbutton(driver):
    #Check if correct menu is loaded when website loads
    if driver.execute_script("return MenuManager.currentMenu == MENU_MAIN"):
        print("Main menu found!")
        try: 
            #Find buttons to check if page has loaded correctly
            button = driver.find_element(By.XPATH, "//button[@onclick='MenuManager.GoTo(MENU_ABOUT);']")
            print("Button Found!") 
            return 1
        except NoSuchElementException: 
            print("Button Not Found!") 
            return 0
    else:
        print("Could not find main menu!")



def test_keyboardinputs(driver, inputs = [68,70,74,75,76]):

    #Allow the website to load
    sleep(2)

    #Navigate to first button, will need adjusting if layout is changed
    driver.find_element(By.XPATH, "//button[@onclick='MenuManager.GoTo(MENU_SINGLEPLAYER);']").click()


    #Allow the game to load
    sleep(1)

    if driver.execute_script("return MenuManager.currentMenu == MENU_SINGLEPLAYER"):
        #This whole loop is mainly a placeholder (lacks a way to stop in the event of failure), will later use a different variable to test the 
        #last pressed key the game registered to avoid the need to spam. Will check the other keys then. 

        #Variable to store the result of the javascript variable, as by the time the loop condition is checked its likely already been cleared.
        returnedKey = 0
        #Target the p5js canvas the game is on, likely redundant. 
        game = driver.find_element(By.CLASS_NAME, "p5Canvas")
        while not returnedKey:
            #Needs to spam d to register input, inefficient & will be replaced.
            spam = chr(inputs[0]) * 20
            ActionChains(driver)\
                .send_keys_to_element(game, spam)\
                .perform()
            
            #Pull input, might take a few tries due to how quickly the variable is cleared and as such this is looped.
            returnedKey = driver.execute_script("return boards[0].input[0];")

            #Print if input was registered by game.
            if returnedKey:
                print("Key Registered")
                driver.refresh()
                return 1
    else:
        print("Wrong menu loaded!")

def test_settings(driver):
    #Allow the website to load
    sleep(2)
                     
    # Default Keybinds for the game
    #                       V Unused
    #                 D  F  J  K  L 
    DefaultInputs = [68,70,74,75,76]

    # Set of test keybinds to test settings with
    #                    V Unused
    #              1  2  3  4  5
    TestInputs = [49,50,51,52,53]
    
    print("Current inputs are " + driver.execute_script("return Settings.GetKey(Setting_KeyArray)"))

    # Change to a set of test values
    print("Setting new ones and saving...")
   # driver.execute_script("Settings.SetKey(Setting_KeyArray,JSON.stringify([49,50,51,52,53]))") #Set, old
    driver.execute_script("Settings.SetKey(Setting_KeyArray,JSON.stringify([[32],[70,74],[70,74],[49,50,52,53],[49,50,51,52,53]]))") #Set
    driver.execute_script("localStorage.setItem(\"game.settings\", Settings.GetAsText())") #Save


    print("Inputs are now " + driver.execute_script("return Settings.GetKey(Setting_KeyArray)"))

    # Due to how Selenium works, profiles are wiped each time and changing it requires screwing around with paths,
    # Opting to test by refreshing to keep tests functional regardless of system
    driver.refresh()

    # Test functionality of the settings
    print("Testing if settings are correctly loaded and applied...")
    if test_keyboardinputs(driver, TestInputs):
        print("Settings function as expected")
        #Allow website to refresh
        sleep(2)
        #Redundant at the moment, for future testing
        print("Resetting back to default values...")
        # driver.execute_script("Settings.SetKey(Setting_KeyArray,JSON.stringify([68,70,74,75,76]))") #Set
        driver.execute_script("Settings.SetKey(Setting_KeyArray,JSON.stringify([[32],[70,74],[70,74],[68,70,74,75],[68,70,74,75,76]]))") #Set
        driver.execute_script("localStorage.setItem(\"game.settings\", Settings.GetAsText())") #Save
        print("Current inputs are now " + driver.execute_script("return Settings.GetKey(Setting_KeyArray)"))
        return 1
    else:
        print("Settings failed to be applied")
        return 0

        


if __name__ == "__main__":
    driver = webdriver.Chrome()
    driver.get(f"https://beta.keyboardhero.arizotaz.com/")
    assert "Keyboard Hero" in driver.title

    #Let website load
    sleep(2)
  
    #No point in continuing if button cannot be found
    print("Checking if the menu has loaded...")
    if test_playbutton(driver):
        print("Checking if input works...")
        if test_keyboardinputs(driver):
            print("Checking if settings function...")
            if test_settings(driver):
                print("All tests passed")


    #test_settings()
    driver.close()
    print("done.")
