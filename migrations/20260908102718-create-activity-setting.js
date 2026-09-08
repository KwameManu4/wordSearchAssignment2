'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivitySettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('wordle','wordsearch')
      },
      difficulty: {
        type: Sequelize.ENUM('easy','medium','hard')
      },
      hintsEnabled: {
        type: Sequelize.BOOLEAN
      },
      wordListId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'WordLists',
          key:'id'
        },
        onDelete:'CASCADE'
      },
      gridSize: {
        type: Sequelize.INTEGER
      },
      maxGuesses: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivitySettings');
  }
};