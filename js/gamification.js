// ===== Level & Badge =====
const GAME = {
  levels: [
    { name: '🌱 Pemula',     min: 0    },
    { name: '🌿 Disiplin',   min: 100  },
    { name: '⭐ Teladan',    min: 300  },
    { name: '🏅 Inspiratif', min: 700  },
    { name: '👑 Champion',   min: 1500 }
  ],
  badges: [
    { name: '🥉 Bronze',  min: 50   },
    { name: '🥈 Silver',  min: 200  },
    { name: '🥇 Gold',    min: 500  },
    { name: '💎 Diamond', min: 1000 },
    { name: '👑 Legend',  min: 2000 }
  ],
  levelOf(points) {
    let cur = this.levels[0], next = null;
    for (let i = 0; i < this.levels.length; i++) {
      if (points >= this.levels[i].min) cur = this.levels[i];
      else { next = this.levels[i]; break; }
    }
    const pct = next ? Math.min(100, ((points - cur.min) / (next.min - cur.min)) * 100) : 100;
    return { current: cur, next, pct };
  },
  earnedBadges(points) {
    return this.badges.filter(b => points >= b.min);
  }
};