exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'TEXT', notNull: true },
    email: { type: 'VARCHAR(100)', notNull: true, unique: true },
    password: { type: 'TEXT', notNull: true },
    role: { type: 'VARCHAR(50)', notNull: true },
    created_at: { type: 'TEXT', notNull: true },
    updated_at: { type: 'TEXT', notNull: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
