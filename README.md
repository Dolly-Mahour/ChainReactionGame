# Chain Reaction Game (Angular)

## Description
Chain Reaction is a strategic multiplayer game built using Angular where players take turns placing orbs in a grid. When a cell reaches its critical mass, it explodes and spreads orbs to neighboring cells, potentially triggering chain reactions.

The goal is to eliminate all opponent orbs and dominate the board.

---

## Live Demo
 https://cerulean-travesseiro-6ab0a9.netlify.app/

---

## Tech Stack
- **Frontend:** Angular  
- **Language:** TypeScript  
- **Styling:** CSS / Bootstrap  
- **Real-time Logic:** Custom game logic (WebSocket-ready if implemented)

---

## ✨ Features
-  Turn-based multiplayer gameplay  
-  Chain reaction explosion logic  
-  Interactive UI with animations  
-  Strategic gameplay mechanics  
-  Real-time updates (if WebSocket integrated)  
-  Responsive design  

---

## How to Play
1. Players take turns placing an orb in any cell.  
2. Each cell has a limit (critical mass).  
3. When the limit is reached, the cell explodes.  
4. Orbs spread to adjacent cells and convert opponent orbs.  
5. The player who removes all opponent orbs wins.  

---

## Installation & Setup

### Clone the repository
```bash
git clone https://github.com/Dolly-Mahour/ChainReactionGame.git
cd ChainReactionGame
