'use strict';


const EVENTS = [
  { activityType: 'wordle',     status: 'success', failureReason: null, listIndex: 0, daysBack: 0 },
  { activityType: 'wordsearch', status: 'success', failureReason: null, listIndex: 0, daysBack: 0 },
  { activityType: 'wordle',     status: 'success', failureReason: null, listIndex: 1, daysBack: 1 },
  { activityType: 'wordsearch', status: 'failed',  failureReason: 'No words with phonemes in this wordlist', listIndex: 1, daysBack: 1 },
  { activityType: 'wordle',     status: 'success', failureReason: null, listIndex: 0, daysBack: 2 },
  { activityType: 'wordsearch', status: 'success', failureReason: null, listIndex: 1, daysBack: 3 },
  { activityType: 'wordle',     status: 'failed',  failureReason: 'Could not load words', listIndex: 0, daysBack: 4 },
  { activityType: 'wordsearch', status: 'success', failureReason: null, listIndex: 0, daysBack: 5 },
  { activityType: 'wordle',     status: 'success', failureReason: null, listIndex: 1, daysBack: 6 },
  { activityType: 'wordsearch', status: 'success', failureReason: null, listIndex: 1, daysBack: 8 },
  { activityType: 'wordle',     status: 'failed',  failureReason: 'No words with phonemes in this wordlist', listIndex: 1, daysBack: 9 },
  { activityType: 'wordle',     status: 'success', failureReason: null, listIndex: 0, daysBack: 10 },
  { activityType: 'wordsearch', status: 'success', failureReason: null, listIndex: 0, daysBack: 12 },
  { activityType: 'wordsearch', status: 'failed',  failureReason: 'Could not load words', listIndex: 1, daysBack: 13 },
];


const daysAgo = (n) => {
  const d = new Date(Date.now() - n * 86400000);
  d.setUTCSeconds(0, 0);
  return d;
};

const SEED_MARKER = "createdAt LIKE '%:00.000 +00:00'";

const seededRowsFilter = () => {
  const pairs = EVENTS.map(() => '(activityType = ? AND status = ? AND failureReason IS ?)').join(' OR ');
  const replacements = EVENTS.flatMap(e => [e.activityType, e.status, e.failureReason]);
  return { where: `${SEED_MARKER} AND (${pairs})`, replacements };
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const sequelize = queryInterface.sequelize;

  
    const lists = await sequelize.query(
      'SELECT id FROM WordLists ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );


    if (lists.length === 0) {
      console.log('No word lists found, skipping generation events. Create a list first, then re-run.');
      return;
    }


    const { where, replacements } = seededRowsFilter();
    const [{ count }] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM GenerationEvents WHERE ${where}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    if (count > 0) {
      console.log(`GenerationEvents already seeded (${count} rows found), skipping.`);
      return;
    }


    await queryInterface.bulkInsert('GenerationEvents', EVENTS.map(e => ({
      activityType: e.activityType,
      status: e.status,
      failureReason: e.failureReason,
      wordListId: lists[e.listIndex % lists.length].id,
      createdAt: daysAgo(e.daysBack),
      updatedAt: daysAgo(e.daysBack),
    })));
  },

  async down (queryInterface) {
    // delete only the seeded rows, not real events recorded since
    const { where, replacements } = seededRowsFilter();
    await queryInterface.sequelize.query(
      `DELETE FROM GenerationEvents WHERE ${where}`,
      { replacements }
    );
  }
};
