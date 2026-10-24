// Tawasal Smart Recommendation Algorithm

const DEFAULT_CONFIG = {
  watchTime: 30,
  interests: 25,
  likes: 10,
  comments: 10,
  shares: 15,
  freshness: 10,
  maxRepeatedCategory: 2,
};

function calculateScore(video, user, config = DEFAULT_CONFIG) {
  const duration = Math.max(Number(video.duration) || 1, 1);
  const watchTime = Math.max(Number(video.watchTime) || 0, 0);

  const completion = Math.min(watchTime / duration, 1);

  const likes = Math.max(Number(video.likes) || 0, 0);
  const comments = Math.max(Number(video.comments) || 0, 0);
  const shares = Math.max(Number(video.shares) || 0, 0);

  const interests = Array.isArray(user.interests)
    ? user.interests
    : [];

  const tags = Array.isArray(video.tags) ? video.tags : [];

  const matchingTags = tags.filter(tag =>
    interests.includes(tag)
  ).length;

  const interestScore = tags.length
    ? matchingTags / tags.length
    : 0;

  const ageHours = video.createdAt
    ? Math.max(
        0,
        (Date.now() - new Date(video.createdAt).getTime()) / 3600000
      )
    : 720;

  const freshness = Math.exp(-ageHours / 168);

  const score =
    completion * config.watchTime +
    interestScore * config.interests +
    Math.min(Math.log1p(likes) / 5, 1) * config.likes +
    Math.min(Math.log1p(comments) / 5, 1) * config.comments +
    Math.min(Math.log1p(shares) / 5, 1) * config.shares +
    freshness * config.freshness;

  return score;
}

function recommendVideos(videos, user, config = DEFAULT_CONFIG) {
  const watched = new Set(user.watchedVideoIds || []);

  const candidates = videos
    .filter(video => video.status !== "removed")
    .filter(video => video.status !== "blocked")
    .filter(video => !watched.has(video.id))
    .map(video => ({
      ...video,
      recommendationScore: calculateScore(video, user, config),
    }))
    .sort(
      (a, b) => b.recommendationScore - a.recommendationScore
    );

  const result = [];
  const categoryCounts = new Map();

  while (candidates.length > 0) {
    let index = candidates.findIndex(video => {
      const category = video.category || "general";
      return (
        (categoryCounts.get(category) || 0) <
        config.maxRepeatedCategory
      );
    });

    if (index === -1) index = 0;

    const [video] = candidates.splice(index, 1);
    const category = video.category || "general";

    categoryCounts.set(
      category,
      (categoryCounts.get(category) || 0) + 1
    );

    result.push(video);
  }

  return result;
}

module.exports = {
  calculateScore,
  recommendVideos,
  DEFAULT_CONFIG,
};
