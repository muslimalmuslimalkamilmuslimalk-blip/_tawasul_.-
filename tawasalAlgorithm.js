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
// ==========================================
// TAWASAL - THE SIX CORE ALGORITHMS
// الخوارزميات الستة الأساسية لتطبيق تواصل
// ==========================================


// 1. خوارزمية التوصيات الذكية
// Smart Recommendation Algorithm

const DEFAULT_CONFIG = {
  watchTimeWeight: 30,
  interestsWeight: 25,
  likesWeight: 10,
  commentsWeight: 10,
  sharesWeight: 15,
  freshnessWeight: 10,
  maxRepeatedCategory: 2,
};

function calculateRecommendationScore(video, user, config = DEFAULT_CONFIG) {
  const duration = Math.max(Number(video.duration) || 1, 1);
  const watchTime = Math.max(Number(video.watchTime) || 0, 0);

  const completion = Math.min(watchTime / duration, 1);

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

  const likes = Math.max(Number(video.likes) || 0, 0);
  const comments = Math.max(Number(video.comments) || 0, 0);
  const shares = Math.max(Number(video.shares) || 0, 0);

  const ageHours = video.createdAt
    ? Math.max(
        0,
        (Date.now() - new Date(video.createdAt).getTime()) / 3600000
      )
    : 720;

  const freshness = Math.exp(-ageHours / 168);

  return (
    completion * config.watchTimeWeight +
    interestScore * config.interestsWeight +
    Math.min(Math.log1p(likes) / 5, 1) * config.likesWeight +
    Math.min(Math.log1p(comments) / 5, 1) * config.commentsWeight +
    Math.min(Math.log1p(shares) / 5, 1) * config.sharesWeight +
    freshness * config.freshnessWeight
  );
}


// 2. خوارزمية تحليل المشاهدة
// Watch Time Algorithm

function analyzeWatch(videoDuration, watchedSeconds) {
  const duration = Number(videoDuration);
  const watched = Number(watchedSeconds);

  if (
    !Number.isFinite(duration) ||
    !Number.isFinite(watched) ||
    duration <= 0 ||
    watched < 0
  ) {
    return {
      valid: false,
      completionRate: 0,
      completed: false,
      skipped: false,
    };
  }

  const completionRate = Math.min(watched / duration, 1);

  return {
    valid: true,
    completionRate,
    completed: completionRate >= 0.9,
    skipped: watched < duration * 0.2,
  };
}


// 3. خوارزمية التفاعل
// Engagement Algorithm

function calculateEngagement(video) {
  const views = Math.max(Number(video.views) || 0, 0);
  const likes = Math.max(Number(video.likes) || 0, 0);
  const comments = Math.max(Number(video.comments) || 0, 0);
  const shares = Math.max(Number(video.shares) || 0, 0);

  if (views === 0) {
    return {
      engagementRate: 0,
      score: 0,
    };
  }

  const engagementRate =
    (likes + comments * 2 + shares * 3) / views;

  return {
    engagementRate,
    score: Math.min(engagementRate, 1),
  };
}


// 4. خوارزمية التحقق من المحتوى
// Content Validation Algorithm

function validateVideo(video) {
  const errors = [];

  if (!video || typeof video !== "object") {
    return {
      valid: false,
      errors: ["بيانات الفيديو غير صحيحة"],
    };
  }

  if (
    typeof video.url !== "string" ||
    video.url.trim() === ""
  ) {
    errors.push("رابط الفيديو مطلوب");
  }

  const duration = Number(video.duration);

  if (
    !Number.isFinite(duration) ||
    duration <= 0 ||
    duration > 180
  ) {
    errors.push("مدة الفيديو يجب أن تكون بين 1 و180 ثانية");
  }

  if (
    typeof video.caption === "string" &&
    video.caption.length > 2000
  ) {
    errors.push("وصف الفيديو طويل جدًا");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


// 5. خوارزمية ترتيب الفيديوهات والتحكم بها
// Feed Ranking and Algorithm Control

function recommendVideos(videos, user, config = DEFAULT_CONFIG) {
  const watchedIds = new Set(
    Array.isArray(user.watchedVideoIds)
      ? user.watchedVideoIds.map(String)
      : []
  );

  const candidates = videos
    .filter(video => video.status !== "removed")
    .filter(video => video.status !== "blocked")
    .filter(video => video.status !== "under_review")
    .filter(video => !watchedIds.has(String(video.id)))
    .map(video => ({
      ...video,
      recommendationScore: calculateRecommendationScore(
        video,
        user,
        config
      ),
    }))
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
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


// 6. خوارزمية تنظيم الإعلانات
// Advertising Algorithm

function selectAdvertisements(ads, user, options = {}) {
  const maxAds = Math.max(
    0,
    Math.floor(Number(options.maxAds) || 2)
  );

  const interests = Array.isArray(user.interests)
    ? user.interests
    : [];

  const now = Date.now();

  return ads
    .filter(ad => ad.status === "active")
    .filter(ad => {
      if (!ad.startsAt || !ad.endsAt) return false;

      const start = new Date(ad.startsAt).getTime();
      const end = new Date(ad.endsAt).getTime();

      return (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start <= now &&
        now <= end
      );
    })
    .filter(ad => {
      const tags = Array.isArray(ad.tags) ? ad.tags : [];

      return (
        tags.length === 0 ||
        tags.some(tag => interests.includes(tag))
      );
    })
    .sort(
      (a, b) =>
        (Number(b.priority) || 0) -
        (Number(a.priority) || 0)
    )
    .slice(0, maxAds)
    .map(ad => ({
      ...ad,
      sponsored: true,
      label: "إعلان مدفوع",
    }));
}


// تصدير الخوارزميات لاستخدامها في خادم تواصل
// Export all algorithms

module.exports = {
  DEFAULT_CONFIG,
  calculateRecommendationScore,
  analyzeWatch,
  calculateEngagement,
  validateVideo,
  recommendVideos,
  selectAdvertisements,
};
