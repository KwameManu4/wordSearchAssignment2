'use strict';

// Demo page visits spread over the last two weeks, durations from 5s to 5min.
const VISITS = [
  { page: '/',           durationSeconds: 12,  daysAgo: 0 },
  { page: '/wordle',     durationSeconds: 145, daysAgo: 0 },
  { page: '/wordsearch', durationSeconds: 210, daysAgo: 1 },
  { page: '/manage',     durationSeconds: 95,  daysAgo: 1 },
  { page: '/wordle',     durationSeconds: 60,  daysAgo: 2 },
  { page: '/',           durationSeconds: 5,   daysAgo: 3 },
  { page: '/wordsearch', durationSeconds: 300, daysAgo: 4 },
  { page: '/wordle',     durationSeconds: 45,  daysAgo: 5 },
  { page: '/manage',     durationSeconds: 180, daysAgo: 6 },
  { page: '/wordsearch', durationSeconds: 120, daysAgo: 8 },
  { page: '/',           durationSeconds: 20,  daysAgo: 9 },
  { page: '/wordle',     durationSeconds: 230, daysAgo: 10 },
  { page: '/manage',     durationSeconds: 35,  daysAgo: 12 },
  { page: '/wordsearch', durationSeconds: 75,  daysAgo: 13 },
];

// Seeded rows are stamped on an exact minute (00.000 seconds). Real visits are
// stamped by Sequelize with a live clock, so they almost never land on that.
// That, plus matching page + duration, lets `down` and the re-run check find
// only the seeded rows.
const daysAgo = (n) => {
  const d = new Date(Date.now() - n * 86400000);
  d.setUTCSeconds(0, 0);
  return d;
};

const SEED_MARKER = "createdAt LIKE '%:00.000 +00:00'";

const seededRowsFilter = () => {
  const pairs = VISITS.map(() => '(page = ? AND durationSeconds = ?)').join(' OR ');
  const replacements = VISITS.flatMap(v => [v.page, v.durationSeconds]);
  return { where: `${SEED_MARKER} AND (${pairs})`, replacements };
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const sequelize = queryInterface.sequelize;
    const { where, replacements } = seededRowsFilter();

    // Seeders aren't tracked like migrations: running this twice would insert
    // every row twice and silently double the stats. So skip if already seeded.
    const [{ count }] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM PageVisits WHERE ${where}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    if (count > 0) {
      console.log(`PageVisits already seeded (${count} rows found), skipping.`);
      return;
    }

    await queryInterface.bulkInsert('PageVisits', VISITS.map(({ page, durationSeconds, daysAgo: n }) => ({
      page,
      durationSeconds,
      createdAt: daysAgo(n),
      updatedAt: daysAgo(n),
    })));
  },

  async down (queryInterface) {
    // Only remove the demo rows, not real visits recorded since.
    const { where, replacements } = seededRowsFilter();
    await queryInterface.sequelize.query(
      `DELETE FROM PageVisits WHERE ${where}`,
      { replacements }
    );
  }
};
