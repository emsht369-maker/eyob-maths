const readProgress = key => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    return {};
  }
};

const savedTopicProgress = readProgress('mathmaster');
const topicProgress = {
  ...savedTopicProgress,
  done: savedTopicProgress.done && typeof savedTopicProgress.done === 'object' ? savedTopicProgress.done : {},
  passed: savedTopicProgress.passed && typeof savedTopicProgress.passed === 'object' ? savedTopicProgress.passed : {}
};
const roomProgress = window.TOPIC_LOCKS_API.readRoomProgress(localStorage);
const cards = [...document.querySelectorAll('.roadmap-card[data-index]')];
const statusEl = document.getElementById('course-status');
const summaryEl = document.getElementById('course-summary');
const courseStageEl = document.getElementById('course-stage');
const courseCountEl = document.getElementById('course-count');
const courseCompleteEl = document.getElementById('course-complete');
const continueLink = document.getElementById('continue-course-link');

const topicRoomLinks = {
  0: ['gcse-bidmas'],
  1: ['gcse-fractions', 'gcse-percentages'],
  2: ['gcse-linear-equations'],
  9: ['gcse-statistics'],
  14: ['ml-dot-product']
};

const topicNames = {
  0: 'Basic Arithmetic & Number Skills',
  2: 'Algebra',
  4: 'Geometry',
  5: 'Trigonometry',
  8: 'Probability',
  14: 'Vectors',
  7: 'Calculus',
  23: 'Differential Equations',
  21: 'Linear Algebra'
};

const isTopicPassed = index => window.TOPIC_LOCKS_API.isTopicPassed(
  index,
  topicRoomLinks,
  roomProgress,
  topicProgress
);
const practiceMode = roomProgress.practiceMode === true;
const courseOrder = cards.map(card => Number(card.dataset.index));
const passedCount = courseOrder.filter(isTopicPassed).length;
const activePosition = practiceMode
  ? 0
  : courseOrder.findIndex((index, position) =>
    !isTopicPassed(index) && courseOrder.slice(0, position).every(isTopicPassed)
  );
const stages = ['Stage 1', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 3', 'Stage 4', 'Stage 4', 'Stage 4', 'Stage 4'];

cards.forEach((card, position) => {
  const index = Number(card.dataset.index);
  const done = isTopicPassed(index);
  const locked = !practiceMode && !done && position !== activePosition;
  const current = !practiceMode && !done && position === activePosition;
  const action = card.querySelector('.course-actions > .secondary-link');
  const universityLinks = card.querySelector('.university-course-links');

  card.classList.toggle('done', done);
  card.classList.toggle('current', current);
  card.classList.toggle('locked-course', locked);

  if (universityLinks) universityLinks.hidden = locked;
  if (!action) return;

  if (locked) {
    const previousIndex = courseOrder[position - 1];
    action.removeAttribute('href');
    action.setAttribute('aria-disabled', 'true');
    action.setAttribute('tabindex', '-1');
    action.textContent = `🔒 Pass ${topicNames[previousIndex] || 'the previous course'} first`;
    return;
  }

  action.href = `index.html?topic=${encodeURIComponent(topicNames[index])}&from=courses`;
  action.removeAttribute('aria-disabled');
  action.removeAttribute('tabindex');
  if (done) {
    action.textContent = 'Review course';
    action.title = 'You completed this course assessment';
  } else if (practiceMode) {
    action.textContent = 'Open for practice';
  } else {
    action.textContent = 'Continue course';
  }
});

if (statusEl) {
  const index = courseOrder[activePosition];
  statusEl.textContent = index === undefined
    ? 'All courses complete'
    : `${practiceMode ? 'Practice any course' : 'Continue'}: ${topicNames[index]}`;
}

if (summaryEl) {
  const index = courseOrder[activePosition];
  summaryEl.textContent = practiceMode
    ? 'Practice mode is on. You can explore every course without changing your completion progress.'
    : index === undefined
      ? 'You have completed every course in this roadmap. Revisit any course to practise.'
      : `Complete ${topicNames[index]} to unlock the next course. Earlier courses stay available to review.`;
}

if (courseStageEl) courseStageEl.textContent = stages[activePosition] || 'Complete';
if (courseCountEl) {
  const unlockedCount = practiceMode ? cards.length : Math.min(cards.length, passedCount + (activePosition >= 0 ? 1 : 0));
  courseCountEl.textContent = `${unlockedCount}/${cards.length}`;
}
if (courseCompleteEl) courseCompleteEl.textContent = String(passedCount);

if (continueLink) {
  const index = courseOrder[activePosition] ?? courseOrder[courseOrder.length - 1];
  continueLink.href = `index.html?topic=${encodeURIComponent(topicNames[index] || topicNames[0])}&from=courses`;
  continueLink.textContent = index === undefined ? 'Review final course' : practiceMode ? 'Start practice' : 'Continue course';
}
