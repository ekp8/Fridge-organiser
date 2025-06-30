# Fridge Organizer

[![Deployed on Vercel](https://img.shields.io/badge/deployed-vercel-brightgreen)](https://fridge-organiser.vercel.app/)

A mobile app for tracking what’s in your fridge, managing expiry dates, and reducing food waste—built with [Expo](https://docs.expo.dev/) + [React Native](https://reactnative.dev/).

## Features

- Add, edit, and delete fridge items
- Highlight items expiring soon
- Local storage using AsyncStorage (Firebase support may be added in a future version)
- Clean UI with customizable categories

## Live Demo

- [Fridge Organizer App](https://fridge-organiser.vercel.app/)

## Getting Started

1. Clone the repo:  
   `git clone https://github.com/ekp8/Fridge-organiser.git`
2. Install dependencies:  
   `npm install`
3. Start the app (Expo):  
   `expo start`

For more details, see the [Expo Documentation](https://docs.expo.dev/).

## Known Issues

- **Expo version mismatch:**  
  The deployed app on Vercel uses Expo version 0.24.25 instead of 7.7. Please refer to the [deployment logs](https://vercel.com/ekp8s-projects/fridge-organiser) for more details. Updating to Expo 7.7 is planned.

## License

[MIT](LICENSE)
