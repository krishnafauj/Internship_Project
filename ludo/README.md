Ludo Game
A modern React-based implementation of the classic Ludo board game with smooth animations and intuitive gameplay.

🎮 Features
4 Player Game: Play with Green, Red, Blue, and Yellow teams

Interactive Dice: Realistic dice rolling animation

Visual Movement: Pawns move smoothly around the board

Auto Game Logic: Automatic turn management and rule enforcement

Score Tracking: Real-time score calculation for each player

Responsive Design: Works on different screen sizes

🚀 How to Play
Basic Rules
Each player has 4 pawns starting from their home base

Players take turns rolling the dice

Roll a 6 to move a pawn from home to the starting position

Move pawns clockwise around the board

Enter the home stretch when you reach your color's entry point

First player to get all 4 pawns home wins!

Game Mechanics
Rolling 6: Get an extra turn and can bring new pawns into play

Cutting Opponents: Land on an opponent's pawn to send it back to their home

Home Stretch: Exact dice roll needed to enter and move in home path

Safe Positions: No cutting allowed on safe spots

Link: <https://internship-project-gs99oqe6l-krishnafaujs-projects.vercel.app/>
🛠️ Installation
Clone the repository

bash
git clone <https://github.com/krishnafauj/Internship_Project>
cd ludo-game
Install dependencies

bash
npm install
Start the development server

bash
npm start
Open your browser
Navigate to http://localhost:3000

🎯 Game Components
Board Layout
The game board consists of:

4 Corner Areas: Home bases for each color

4 U-shaped Paths: Main movement tracks

Center Area: Common playing field

Home Paths: Final stretch to reach home

Player Colors & Starting Positions
Green: Starts at position 0 (Bottom-left)

Red: Starts at position 13 (Top-left)

Blue: Starts at position 26 (Top-right)

Yellow: Starts at position 39 (Bottom-right)

Key Positions
Home Base: Position -1 (pawns waiting to enter)

Main Board: Positions 0-51 (circular path)

Home Paths: Positions 52-75 (final stretch)

Final Home: Last position in home path

🎲 How to Use
Starting the Game

The game begins with Green player's turn

Click "Roll Dice" to start playing

Moving Pawns

Roll the dice

If only one pawn can move, it moves automatically

If multiple pawns can move, click on the pawn you want to move

Pawns move clockwise around the board

Winning the Game

Get all 4 pawns to the final home position

Player with all pawns home wins!
