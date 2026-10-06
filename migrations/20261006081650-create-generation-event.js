'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GenerationEvents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      activityType: {
        type: Sequelize.ENUM('wordle','wordsearch')
      },
      status: {
        type: Sequelize.ENUM('success','failed')
      },
      failureReason: {
        type: Sequelize.STRING
      },
      wordListId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'WordLists',
          key:'id'
        },
        onDelete:'SET NULL'
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
    await queryInterface.dropTable('GenerationEvents');
  }
};