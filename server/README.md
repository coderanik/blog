# Blog Server

TypeScript backend server for blog management with MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB credentials:
```
MONGODB_URI=mongodb://localhost:27017/blog
MONGODB_USERNAME=your-username
MONGODB_PASSWORD=your-password
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
PORT=3001
JWT_SECRET=your-secret-key-here
```

4. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

5. Create initial admin user:
```bash
npm run create-admin [username] [password]
# Example: npm run create-admin admin admin123
```

6. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/register` - Register new user (for initial setup)
- `GET /api/auth/verify` - Verify JWT token

### Blogs
- `GET /api/blogs` - Get all blogs (admin, requires auth)
- `GET /api/blogs/published` - Get published blogs (client)
- `GET /api/blogs/:slug` - Get blog by slug
- `GET /api/blogs/id/:id` - Get blog by ID
- `POST /api/blogs` - Create new blog (requires auth)
- `PUT /api/blogs/:id` - Update blog (requires auth)
- `DELETE /api/blogs/:id` - Delete blog (requires auth)
- `GET /api/blogs/drafts/all` - Get all drafts (requires auth)

### Analytics
- `POST /api/analytics/view/:slug` - Track blog view
- `POST /api/analytics/click/:slug` - Track blog click
- `GET /api/analytics/blog/:slug` - Get analytics for a blog
- `GET /api/analytics/summary` - Get analytics summary (requires auth)

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_USERNAME` - MongoDB username (optional)
- `MONGODB_PASSWORD` - MongoDB password (optional)
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Client application URL for CORS
- `ADMIN_URL` - Admin application URL for CORS
- `JWT_SECRET` - Secret key for JWT tokens
