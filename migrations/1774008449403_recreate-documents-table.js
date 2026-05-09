exports.up = (pgm) => {
  pgm.dropTable('documents', { ifExists: true });

  pgm.createTable('documents', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    filename: {
      type: 'TEXT',
      notNull: true,
    },
    original_name: {
      type: 'TEXT',
      notNull: true,
    },
    size: {
      type: 'INTEGER',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};