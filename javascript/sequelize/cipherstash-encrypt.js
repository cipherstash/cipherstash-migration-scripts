const { sequelize } = require("./models");

const PAGE_SIZE = 1000;

// To migrate and encrypt plaintext data run: node cipherstash-encrypt.js <Model> field_one field_two field_three
//
// Example:
//
// node cipherstash-encrypt.js User full_name email dob
if (process.argv.length < 4) {
    console.error("Usage: node script.js <modelName> <field1> <field2> ...");
    process.exit(1);
}

const modelName = process.argv[2];
const fieldsToChange = process.argv.slice(3);

if (!modelName || fieldsToChange.length === 0) {
  console.error(
    "Usage: node cipherstash-encrypt.js <modelName> <field1> <field2> ..."
  );
  process.exit(1);
}

/**
 * @param {import('sequelize').Model} modelInstance
 */
async function forceSave(modelInstance, fields) {
  fields.forEach((field) => {
    if (field in modelInstance.constructor.rawAttributes) {
      modelInstance.changed(field, true);
    }
  });

  return await modelInstance.save();
}

/**
 * Process a batch of models
 * @param {import('sequelize').Model} model
 */
async function processModel(model) {
  let offset = 0;

  // Iterate through all the instances of the model in batches and save them
  while (true) {
    const instances = await model.findAll({
      offset,
      limit: PAGE_SIZE,
      order: [["id", "ASC"]],
    });

    if (instances.length === 0) {
      break;
    }

    await Promise.all(
      instances.map((instance) => forceSave(instance, fieldsToChange))
    );

    offset += PAGE_SIZE;
  }
}

(async () => {
  const model = sequelize.models[modelName];
  if (!model) {
    console.error(`Model ${modelName} not found.`);
    process.exit(1);
  }

  await processModel(model);

  console.log("Migration successful!");
})();
