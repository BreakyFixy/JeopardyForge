# JeopardyForge

JeopardyForge is an interactive web application that allows users to create and play customized Jeopardy-style quiz games. Perfect for educators, trainers, or anyone looking to make learning more engaging.

![JeopardyForge Banner](https://ntglsc.pages.dev/images/banner.png)

## Features

- 🎮 Interactive game board with customizable categories and questions
- 📊 Real-time score tracking for multiple teams
- 🖼️ Support for image-based questions
- 💾 Automatic game state saving
- 🎯 Easy-to-use CSV upload for game content
- 🎨 Modern, responsive design
- ✏️ Editable team names and game title

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jeopardyforge
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## CSV Guide

To create your game questions, prepare a CSV file with the following structure OR download the template file and fill it in:

### Format:
- Row 1: Category names (any number of columns)
- Following rows must be in sets of three:
  1. Question text for each category
  2. Answer text for each category
  3. Image URL or "none" for each category

### Example CSV:
```csv
History,Science,Literature
Who was the first U.S. President?,What is H2O?,Who wrote Romeo and Juliet?
George Washington,Water,William Shakespeare
none,https://example.com/water.jpg,none
```

## Playing the Game

1. **Upload Questions**: Start by uploading your CSV file with questions
2. **Team Setup**: Add and name your teams
3. **Game Play**: 
   - Click on point values to reveal questions
   - Select answering team
   - Mark answers as correct/incorrect
   - Track scores automatically

## Features in Detail

### Game Board
- Dynamic grid layout based on categories
- Visual indicators for answered questions
- Points displayed in ascending order
- Image indicators for questions with visuals

### Team Management
- Add/remove teams at any time
- Edit team names on the fly
- Real-time score updates
- Negative scoring support

### Game State
- Automatic saving to localStorage
- Resume games from where you left off
- Reset game option available

### Audio
JeopardyForge includes theme music and sound effects to enhance gameplay. All
audio files are located in `public/Sounds`:

- `daily-double-101soundboards.mp3`
- `jeopardy-ding-101soundboards.mp3`
- `jeopardy-incorrect-101soundboards.mp3`
- `jeopardy-think-101soundboards.mp3`
- `this-is-jeopardy-1992-101soundboards.mp3`
- `zapsplat_multimedia_click_button_short_sharp_73510.mp3`
- `zapsplat_multimedia_game_sound_negative_error_fail_plonky_synth_002_81113.mp3`
- `zapsplat_multimedia_ui_notification_classic_bell_synth_success_107505.mp3`

Sound helpers let you play these effects from your components:

```ts
import { playSound } from './utils/sound';

playSound('jeopardy-ding-101soundboards.mp3');
```

## Technical Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Contributing

While this is a demonstration project, suggestions and improvements are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Browser Support

JeopardyForge works best in modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open-source and available under the MIT License.

## Acknowledgments

- Inspired by the classic Jeopardy! game show format
- Built with modern web technologies
- Designed for educational purposes

## Support

For support or questions, please open an issue in the repository.

---

Made with ❤️ using React and TypeScript
