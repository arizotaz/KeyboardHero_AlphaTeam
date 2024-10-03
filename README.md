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

## Database
Download the mysql server, on mac you can install it with homebrew by by typing this command into your terminal:
```sh
brew install mysql
```
On Windows you can install from this link:
[https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)

Make sure you have the .env that is posted in the #files chat in the discord. DO NOT COMMIT THIS FILE TO GITHUB

Then you need to copy the schema into your mysql database from  the schema.sql file in github (make sure the schema in your mysql server is updated if anybody made changes to the file).
The database that you copy this into needs to have the same name as the DB_NAME from the .env file

You may need to download the dotenv dependency if node doesn’t do it automatically, to do that run this command into the terminal:
```sh
Npm i dotenv
```

## Software Layout
[![](https://mermaid.ink/img/pako:eNqFkk1PwzAMhv_KlBNIG2Md7KPiMgbiwgRi4raL27htpDSpUmfSNPrfSdZ9dFNhOTT168d2a3vLYs2RhSyWUJYvAlID-Up13Fmgsp2nn16vswChvHWpL5FIqLRs880sF3oOUkQGSOjW-FmkLbUmdlklfkrYoHmDHC_9XpvrvJBIyE8Jdv9QY9ta8eejQHVze7K_Cw6ETeULFUfTVN4R1kekqq-zGvuONMqcsTXV7M__ZFu3rkQcenflEy462aC9-azB8E7kny3BJ-KvIqzLcjQ5CO5WaAetGGXoJsZC98oxAStpxVaqcihY0suNillIxmKXGW3TjIUJyNJZdjeX_QoeEOSCtFnsd9RfB_B15zlGSw1uhizcMtoUHk5FSQ6OtUpE6nVrpJMzoqIM-33vvksFZTa6i3XeLwXPwFC2no76o2A0gWCIo_EQHodDHkeD6SQJHgYJH98PAmBVVf0CKQP--A?type=png)](https://mermaid.live/edit#pako:eNqFkk1PwzAMhv_KlBNIG2Md7KPiMgbiwgRi4raL27htpDSpUmfSNPrfSdZ9dFNhOTT168d2a3vLYs2RhSyWUJYvAlID-Up13Fmgsp2nn16vswChvHWpL5FIqLRs880sF3oOUkQGSOjW-FmkLbUmdlklfkrYoHmDHC_9XpvrvJBIyE8Jdv9QY9ta8eejQHVze7K_Cw6ETeULFUfTVN4R1kekqq-zGvuONMqcsTXV7M__ZFu3rkQcenflEy462aC9-azB8E7kny3BJ-KvIqzLcjQ5CO5WaAetGGXoJsZC98oxAStpxVaqcihY0suNillIxmKXGW3TjIUJyNJZdjeX_QoeEOSCtFnsd9RfB_B15zlGSw1uhizcMtoUHk5FSQ6OtUpE6nVrpJMzoqIM-33vvksFZTa6i3XeLwXPwFC2no76o2A0gWCIo_EQHodDHkeD6SQJHgYJH98PAmBVVf0CKQP--A)

### Main Game & Board
[![](https://mermaid.ink/img/pako:eNp1k99P2zAQx_8Vy09FCvTXVqBsD9tg0yZK0QJPTYWu8SXxcOzIdhhR1_99dtq0aSl9cHN3n6_vfD4vaawY0jGNBRhzzSHVkEeSuF_IZSrwXkCF-gfkSD79Oz0lE5RlJNfEeq2VtX-5dhAyLVB2ThrrsWBgcWf_RslQ7-xbhJdteNXe9LCEbQJvfFWgGVn41cx68yPyLbXVEccrQWKQ66LIZ5KAMHj1FlhX6QCry3acSzubu7UorQvO5sdDU4lhpqxpkD2IpK6wMFba5-9dvY19U_lCTUpheSF4XURvb49f4fSuBr9zgddg4WAPWeYL1NPkTlk07-R4UBbEg9O_B0y4MciOEXWLNnUWAvfauKNCC9rubpmQe61iNOan708HtIbqSSVPz1iZFrQZltegCv4GWeCzfCkZVy3kcH4IuXnldaad51YBa5rT-WOU3NMDq9ry5his7ZyAft4jVzSgOeocOHPvpR6piNoMc4zo2H0yTMBdWUQj6VEorQorGdOxH6CAalWmGR3XfQpoWR9z894aBBm3Sk82D9L_NeBNHdmqhTsdOnNJbVV4OOXGOjhWMuGp95daOHdmbWHG3a4Pn6XcZuXiLFZ513CWucvJXi5H3dFgdAGDIY7Oh_BxOGTxon95kQw-9BN23usPgK5Wq_-VtEO2?type=png)](https://mermaid.live/edit#pako:eNp1k99P2zAQx_8Vy09FCvTXVqBsD9tg0yZK0QJPTYWu8SXxcOzIdhhR1_99dtq0aSl9cHN3n6_vfD4vaawY0jGNBRhzzSHVkEeSuF_IZSrwXkCF-gfkSD79Oz0lE5RlJNfEeq2VtX-5dhAyLVB2ThrrsWBgcWf_RslQ7-xbhJdteNXe9LCEbQJvfFWgGVn41cx68yPyLbXVEccrQWKQ66LIZ5KAMHj1FlhX6QCry3acSzubu7UorQvO5sdDU4lhpqxpkD2IpK6wMFba5-9dvY19U_lCTUpheSF4XURvb49f4fSuBr9zgddg4WAPWeYL1NPkTlk07-R4UBbEg9O_B0y4MciOEXWLNnUWAvfauKNCC9rubpmQe61iNOan708HtIbqSSVPz1iZFrQZltegCv4GWeCzfCkZVy3kcH4IuXnldaad51YBa5rT-WOU3NMDq9ry5his7ZyAft4jVzSgOeocOHPvpR6piNoMc4zo2H0yTMBdWUQj6VEorQorGdOxH6CAalWmGR3XfQpoWR9z894aBBm3Sk82D9L_NeBNHdmqhTsdOnNJbVV4OOXGOjhWMuGp95daOHdmbWHG3a4Pn6XcZuXiLFZ513CWucvJXi5H3dFgdAGDIY7Oh_BxOGTxon95kQw-9BN23usPgK5Wq_-VtEO2)
