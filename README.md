Pet project — a real-time auction platform built to showcase full-stack development skills.
Stack: Frontend — Next.js (App Router) with TypeScript, Redux for state management (`auth`, `socket`), styled with Tailwind CSS and SCSS. Backend — Node.js with Socket.IO for real-time, MongoDB (Mongoose) for storage.
Mechanics:
- Authorization: Page `/login` — form sends `email` and `password` via Socket.IO (`login`), server returns `user` and JWT token. Google authorization via `@react-oauth/google` sends a token (`googleLogin`), server responds similarly. Data is stored in Redux and `localStorage`.
- Auction Creation: Page `/add-auction` — form sends auction data to MongoDB via Socket.IO, `creator` is taken from the JWT token in Redux. Images are uploaded to Cloudinary, with only URLs stored in MongoDB.
- Auction List: Main page `/auctions` requests active auctions via Socket.IO (`getAuctions`), server returns data with usernames, rendered in `Lot`.
- Bidding: In `Lot`, the "Place Bid" button sends a bid via Socket.IO (`placeBid`). Server updates the auction in MongoDB and broadcasts changes to all clients via `bidUpdated`.
- Timer: Client-side `useEffect` in `Lot` and `/auctions/[id]` displays a timer ("X days, Y hours, Z min, W sec"). Server ends the auction via `closeAuction` and notifies all clients via `auctionClosed`.
- Auction Details: Page `/auctions/[id]` requests data via `getAuctionDetails` (Socket.IO), displays bid history and timer, updated via `bidUpdated`.
- Profile: Page `/profile` requests data via `getProfileData` (Socket.IO), shows user data from Redux and auction lists (created, bids, won).
Features: Real-time via Socket.IO, JWT authorization, TypeScript, modular components (`Lot`, `Profile`).
Data: MongoDB: `users` (name, email, avatar), `auctions` (title, bids, winner).
Deployment: Frontend — Vercel, backend — Railway with MongoDB Atlas.
