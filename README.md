# Discord Bot Demo for cwk-gen

This is a demo bot showcasing the capabilities of the `cwk-gen` package for generating Discord images.

## Features

- Automatic welcome images when new members join
- `/rank` command to view level and XP
- `/profile` command to view user profiles
- `/serverbanner` command to generate server banners
- Simple XP system with leveling

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Deploy commands: `npm run deploy`
5. Start the bot: `npm start`

## Configuration

Edit `config.json` to customize:
- Default embed color
- Welcome channel ID
- XP system settings

## Commands

- `/rank [user]` - Shows a rank card with level and XP
- `/profile [user]` - Displays a user profile card
- `/serverbanner` - Generates a banner for the server

## Database

The bot uses MongoDB to store user XP data. Set up a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas/database) and add your connection string to `.env`.

## Customization

To customize the images:
1. Edit the options passed to the generators in the command files
2. Add custom fonts by registering them in the commands
3. Use different background images or colors
