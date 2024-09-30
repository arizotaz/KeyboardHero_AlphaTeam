# Keyboard Hero
Keyboard hero is the project that we have decided to develop for the 10 week final project of software engineering.  There is a lot to do and it is good to get started as soon as possible.
For our web-server, it is ideal to have everyone working in the same enviorment.  We will be using NodeJS to manage the webserver and allow other features such as multiplayer down the line.  The game will use P5JS for the interactive part of the game, a collection of HTML pages, and JQuery to manage html screens.

## Installation

Keyboard Hero requires [Node.js](https://nodejs.org/) to run.
Download the latest LTS version of Node.js and install it on your system.

Once have NodeJS and the project cloned, navigate to the root of the project and install the dependencies to start the server.

```sh
cd ..../Team-Alpha/SWE-Project/KeyboardHero
npm i
```

When the dependencies are done installing, run the development environment.
```sh
npm run dev
```

## Web Server
The webserver is contained in the webserver.js file.  It is recommended to not touch this file.  All game assets and menus are available in the /client/assets folder.

The Web Server runs on express.  When you start the server, it will print the http port into the console.
Once you know the port, you can access the application with http://localhost:port. 

The default is [http://localhost:32787/](http://localhost:32787/)


## Software Layout
flowchart TD
    mysql
    p5js[p5js] --> BManager(Boot Manager)
    LocalStorage --> SettingsFile
    UserInput
    BManager[Boot Script] --> GameLoop
    GameLoop[Mainn Game Loop] --> MenuManager
    GameLoop --> SettingsFile
    MenuManager --> MainMenu
    MenuManager --> SettingsMenu
    MenuManager --> AudioCalibrationMenu
    MenuManager --> AboutMenu
    MenuManager --> SinglePlayerGame
    MenuManager --> GameCompletedMenu
    SinglePlayerGame --> GameBoard
    SinglePlayerGame --> SettingsFile

### Main Game & Board
classDiagram
    SinglePlayerGame <|-- Menu

    
    class Menu{
      Open()
      Update()
      Render()
      Leave()
    }
    class SinglePlayerGame{
      GameBoard boards[0]
    }
    class GameBoard{
        bool canUpdate = false;
        bool canRender = true;
        int[] input = [];
        int[] inputOneShots = [];

        int gameScore = 0;
        int gameComboMultiplier = 0;

        JSON gameFileData;
        int numberOfNotes = 0;
        int gameTotalTiles = 0;
        int gameMissedTiles = 0;
        bool gameComplete = false;

        Start()
        ProcessInput(array_of_keys)
        Update(x,y,w,h,gameAudio)
        Render()
        Exit()

        LoadFileData(json)
        Ready()
        Completed()
        MarkReady()
    }