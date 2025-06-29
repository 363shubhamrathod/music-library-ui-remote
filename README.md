# Music Library - Micro Frontend

This is the Music Library micro frontend application that provides a comprehensive music management system with authentication, filtering, sorting, and role-based features. It's designed to be loaded dynamically by the main host application using Module Federation.

## 🎯 Features

### Core Features
- **Music Library UI**: Clean, modern interface for displaying songs
- **Advanced Filtering**: Filter by album, artist, title, or genre
- **Sorting**: Sort by title, artist, album, or year (ascending/descending)
- **Grouping**: Group songs by album, artist, or year
- **Statistics**: Real-time statistics using JavaScript reduce functions

### Authentication & Authorization
- **Mock JWT Authentication**: Simple in-memory JWT approach
- **Role-Based Access Control**: Two distinct roles with different permissions
- **Persistent Sessions**: JWT stored in localStorage for session persistence

### JavaScript Functions Implementation
- **map()**: Used for transforming song data and UI rendering
- **filter()**: Used for search and filtering functionality
- **reduce()**: Used for calculating statistics and grouping songs

## 🔐 Authentication System

### User Roles

#### Admin User
- **Username**: `admin`
- **Role**: `admin`
- **Permissions**:
  - View all songs
  - Add new songs
  - Delete existing songs
  - Filter and sort songs
  - Group songs by various criteria

#### Regular User
- **Username**: `user`
- **Role**: `user`
- **Permissions**:
  - View all songs
  - Filter and sort songs
  - Group songs by various criteria
  - **Cannot** add or delete songs

### JWT Implementation

The application uses a mock JWT system for demonstration purposes:

```typescript
// Mock JWT generation
const generateMockJWT = (user: User): string => {
  const payload = { userId: user.id, username: user.username, role: user.role };
  return btoa(JSON.stringify(payload)); // Simple base64 encoding
};

// Mock JWT decoding
const decodeMockJWT = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    return mockUsers.find(u => u.id === payload.userId) || null;
  } catch {
    return null;
  }
};
```

## 🎵 Music Management Features

### Song Data Structure
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  duration: string;
}
```

### Sample Songs Included
- Bohemian Rhapsody - Queen
- Hotel California - Eagles
- Imagine - John Lennon
- Stairway to Heaven - Led Zeppelin
- Billie Jean - Michael Jackson
- Like a Rolling Stone - Bob Dylan
- Smells Like Teen Spirit - Nirvana
- Hey Jude - The Beatles

### Advanced Features

#### Filtering
- **Global Search**: Search across all song fields
- **Specific Filtering**: Filter by title, artist, album, or genre
- **Real-time Results**: Instant filtering as you type

#### Sorting
- **Multiple Criteria**: Sort by title, artist, album, or year
- **Direction Control**: Ascending or descending order
- **Visual Indicators**: Clear sort direction indicators

#### Grouping
- **Dynamic Grouping**: Group by album, artist, or year
- **Collapsible Sections**: Organized display of grouped songs
- **Statistics per Group**: Count and duration statistics

#### Statistics Dashboard
Real-time statistics calculated using JavaScript reduce functions:
- Total number of songs
- Number of unique artists
- Number of unique albums
- Number of unique genres
- Total duration of all songs

## 🏗️ Architecture

### Module Federation Configuration
```typescript
// vite.config.ts
federation({
  name: "music-library-ui-remote",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App.tsx",
  },
  shared: ["react"],
})
```

### Component Structure
```
src/
├── App.tsx          # Main application component
├── App.css          # Comprehensive styling
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd music-library-ui-remote
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4173`

### Building for Production

```bash
npm run build
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Implementation Details

#### JavaScript Functions Usage

**map() Function:**
```typescript
// Transforming song data for display
const songCards = songs.map(song => (
  <SongCard key={song.id} song={song} />
));
```

**filter() Function:**
```typescript
// Filtering songs based on search criteria
const filteredSongs = songs.filter(song => {
  const searchLower = searchTerm.toLowerCase();
  return (
    song.title.toLowerCase().includes(searchLower) ||
    song.artist.toLowerCase().includes(searchLower) ||
    song.album.toLowerCase().includes(searchLower) ||
    song.genre.toLowerCase().includes(searchLower)
  );
});
```

**reduce() Function:**
```typescript
// Calculating statistics
const stats = songs.reduce((acc, song) => {
  acc.totalSongs++;
  acc.artists.add(song.artist);
  acc.albums.add(song.album);
  acc.genres.add(song.genre);
  acc.totalDuration += parseInt(song.duration.split(':')[0]) * 60 + 
                      parseInt(song.duration.split(':')[1]);
  return acc;
}, {
  totalSongs: 0,
  artists: new Set<string>(),
  albums: new Set<string>(),
  genres: new Set<string>(),
  totalDuration: 0,
});
```

#### State Management
- Uses React hooks (useState, useEffect, useMemo)
- Local state for UI interactions
- localStorage for JWT persistence
- No external state management libraries

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

### Deploy to GitHub Pages

1. Add GitHub Pages configuration to your repository
2. Set the build output directory to `dist`
3. Deploy on push to main branch

## 🎨 Styling

### Design System
- **Color Palette**: Modern gradient backgrounds with clean white cards
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first responsive design

### CSS Features
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming
- Smooth transitions and animations
- Mobile-responsive breakpoints
- Modern card-based design

## 🔍 Testing

### Manual Testing Checklist
- [ ] Login with admin credentials
- [ ] Login with user credentials
- [ ] Add new song (admin only)
- [ ] Delete song (admin only)
- [ ] Filter songs by various criteria
- [ ] Sort songs in ascending/descending order
- [ ] Group songs by album, artist, or year
- [ ] Search functionality
- [ ] Responsive design on mobile
- [ ] Logout functionality
- [ ] Session persistence

## 🔍 Troubleshooting

### Common Issues

1. **Module Federation not working**:
   - Ensure the remote entry point is accessible
   - Check CORS settings
   - Verify shared dependencies

2. **Authentication issues**:
   - Clear localStorage and try again
   - Check browser console for errors
   - Verify JWT token format

3. **Build errors**:
   - Clear `node_modules` and reinstall
   - Check TypeScript configuration
   - Verify all dependencies

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Music Library](https://music-library-ui-remote.vercel.app)
- **Main Application**: [Host App](https://main-host.vercel.app)
- **Repository**: [GitHub](https://github.com/yourusername/music-library)

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
