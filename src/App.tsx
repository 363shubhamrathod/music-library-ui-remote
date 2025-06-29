import { useState, useEffect, useMemo } from 'react';
import './App.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  duration: string;
}

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

const mockSongs: Song[] = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', year: 1975, genre: 'Rock', duration: '5:55' },
  { id: '2', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', year: 1976, genre: 'Rock', duration: '6:30' },
  { id: '3', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', year: 1971, genre: 'Pop', duration: '3:03' },
  { id: '4', title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', year: 1971, genre: 'Rock', duration: '8:02' },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', year: 1982, genre: 'Pop', duration: '4:54' },
  { id: '6', title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', year: 1965, genre: 'Folk Rock', duration: '6:13' },
  { id: '7', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', year: 1991, genre: 'Grunge', duration: '5:01' },
  { id: '8', title: 'Hey Jude', artist: 'The Beatles', album: 'The Beatles 1967-1970', year: 1968, genre: 'Pop Rock', duration: '7:11' },
];

const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin' },
  { id: '2', username: 'user', role: 'user' },
];

const generateMockJWT = (user: User): string => {
  const payload = { userId: user.id, username: user.username, role: user.role };
  return btoa(JSON.stringify(payload));
};

const decodeMockJWT = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token));
    return mockUsers.find(u => u.id === payload.userId) || null;
  } catch {
    return null;
  }
};

function App() {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'album' | 'artist' | 'title'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album' | 'year'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'none' | 'album' | 'artist' | 'year'>('none');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSong, setNewSong] = useState<Omit<Song, 'id'>>({
    title: '',
    artist: '',
    album: '',
    year: new Date().getFullYear(),
    genre: '',
    duration: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('musicLibraryJWT');
    if (token) {
      const user = decodeMockJWT(token);
      if (user) {
        setCurrentUser(user);
        setShowLogin(false);
      }
    }
  }, []);

  const handleLogin = (username: string) => {
    const user = mockUsers.find(u => u.username === username);
    if (user) {
      const token = generateMockJWT(user);
      localStorage.setItem('musicLibraryJWT', token);
      setCurrentUser(user);
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('musicLibraryJWT');
    setCurrentUser(null);
    setShowLogin(true);
  };

  const handleAddSong = () => {
    if (newSong.title && newSong.artist && newSong.album) {
      const song: Song = {
        ...newSong,
        id: Date.now().toString(),
      };
      setSongs(prev => [...prev, song]);
      setNewSong({
        title: '',
        artist: '',
        album: '',
        year: new Date().getFullYear(),
        genre: '',
        duration: '',
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteSong = (id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
  };

  const filteredAndSortedSongs = useMemo(() => {
    let filtered = songs;

    if (searchTerm) {
      filtered = songs.filter(song => {
        const searchLower = searchTerm.toLowerCase();
        return (
          song.title.toLowerCase().includes(searchLower) ||
          song.artist.toLowerCase().includes(searchLower) ||
          song.album.toLowerCase().includes(searchLower) ||
          song.genre.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filterBy !== 'all') {
      const filterValue = searchTerm.toLowerCase();
      filtered = filtered.filter(song => {
        const fieldValue = song[filterBy].toLowerCase();
        return fieldValue.includes(filterValue);
      });
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [songs, searchTerm, filterBy, sortBy, sortOrder]);

  const groupedSongs = useMemo(() => {
    if (groupBy === 'none') return { 'All Songs': filteredAndSortedSongs };

    return filteredAndSortedSongs.reduce((groups, song) => {
      const key = song[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(song);
      return groups;
    }, {} as Record<string, Song[]>);
  }, [filteredAndSortedSongs, groupBy]);

  const stats = useMemo(() => {
    return songs.reduce((acc, song) => {
      acc.totalSongs++;
      acc.artists.add(song.artist);
      acc.albums.add(song.album);
      acc.genres.add(song.genre);
      acc.totalDuration += parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]);
      return acc;
    }, {
      totalSongs: 0,
      artists: new Set<string>(),
      albums: new Set<string>(),
      genres: new Set<string>(),
      totalDuration: 0,
    });
  }, [songs]);

  if (showLogin) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Music Library Login</h2>
          <p>Choose a user to login:</p>
          <div className="login-buttons">
            <button onClick={() => handleLogin('admin')} className="login-btn admin">
              Login as Admin
            </button>
            <button onClick={() => handleLogin('user')} className="login-btn user">
              Login as User
            </button>
          </div>
          <div className="credentials">
            <p><strong>Admin:</strong> Can add and delete songs</p>
            <p><strong>User:</strong> Can only view and filter songs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="music-library">
      <header className="header">
        <h1>🎵 Music Library</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.username} ({currentUser?.role})</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{stats.totalSongs}</span>
          <span className="stat-label">Songs</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.artists.size}</span>
          <span className="stat-label">Artists</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.albums.size}</span>
          <span className="stat-label">Albums</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.genres.size}</span>
          <span className="stat-label">Genres</span>
        </div>
        <div className="stat">
          <span className="stat-number">{Math.floor(stats.totalDuration / 60)}:{String(stats.totalDuration % 60).padStart(2, '0')}</span>
          <span className="stat-label">Total Duration</span>
        </div>
      </div>

      <div className="controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Filter by All</option>
            <option value="title">Filter by Title</option>
            <option value="artist">Filter by Artist</option>
            <option value="album">Filter by Album</option>
          </select>
        </div>

        <div className="sort-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="year">Sort by Year</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="group-section">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="group-select"
          >
            <option value="none">No Grouping</option>
            <option value="album">Group by Album</option>
            <option value="artist">Group by Artist</option>
            <option value="year">Group by Year</option>
          </select>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="add-song-btn"
          >
            + Add Song
          </button>
        )}
      </div>

      {showAddForm && currentUser?.role === 'admin' && (
        <div className="add-song-form">
          <h3>Add New Song</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Title"
              value={newSong.title}
              onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Artist"
              value={newSong.artist}
              onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Album"
              value={newSong.album}
              onChange={(e) => setNewSong(prev => ({ ...prev, album: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Year"
              value={newSong.year}
              onChange={(e) => setNewSong(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
            />
            <input
              type="text"
              placeholder="Genre"
              value={newSong.genre}
              onChange={(e) => setNewSong(prev => ({ ...prev, genre: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Duration (MM:SS)"
              value={newSong.duration}
              onChange={(e) => setNewSong(prev => ({ ...prev, duration: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddSong} className="save-btn">Save Song</button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}

      <div className="songs-container">
        {Object.entries(groupedSongs).map(([groupName, groupSongs]) => (
          <div key={groupName} className="song-group">
            {groupBy !== 'none' && <h3 className="group-title">{groupName}</h3>}
            <div className="songs-grid">
              {groupSongs.map(song => (
                <div key={song.id} className="song-card">
                  <div className="song-info">
                    <h4 className="song-title">{song.title}</h4>
                    <p className="song-artist">{song.artist}</p>
                    <p className="song-album">{song.album}</p>
                    <div className="song-meta">
                      <span className="song-year">{song.year}</span>
                      <span className="song-genre">{song.genre}</span>
                      <span className="song-duration">{song.duration}</span>
                    </div>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedSongs.length === 0 && (
        <div className="no-results">
          <p>No songs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default App;
