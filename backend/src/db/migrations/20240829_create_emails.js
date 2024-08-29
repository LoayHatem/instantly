/**
 * @param {import('knex')} knex
 * @returns
 */
export function up(knex) {
  return knex.schema
    .createTable("emails", (table) => {
      table.increments("id");
      table.string("subject").notNullable();
      table.text("body");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("leads", (table) => {
      table.increments("id");
      table.string("email").notNullable().unique();
      table.string("firstName");
      table.string("lastName");
      table.string("job");
      table.timestamps(true, true);
    })
    .createTable("email_lead", (table) => {
      table.increments("id");
      table.integer("email_id").unsigned().references("id").inTable("emails").onDelete("CASCADE");
      table.integer("lead_id").unsigned().references("id").inTable("leads").onDelete("CASCADE");
      table.enum("type", ["to", "cc", "bcc"]).notNullable();
      table.timestamps(true, true);
      table.unique(["email_id", "lead_id", "type"]);
    });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("email_lead").dropTableIfExists("leads").dropTableIfExists("emails");
}
