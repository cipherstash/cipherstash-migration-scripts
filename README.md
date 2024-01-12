# CipherStash migration scripts

This repo contains scripts that can be used to do a data migration of plaintext data over to encrypted data in the encrypted columns.

There are currently scripts for Rails and Sequelize.

## Usage

### Rails

Copy over the `/ruby/active-record/cipherstash_tasks.rake` file to `lib/tasks`.

After completing the initial setup and running Tandem:

Run:

```bash
rails cipherstash:migrate[Model Name]
```

```zsh
rails cipherstash:migrate\[Model Name\]
```

### Sequelize

Copy over the `/javascript/sequelize/cipherstash-encrypt.js` file to your project.

After completing the initial setup and running Tandem:

Run:

```bash
node cipherstash-encrypt.js <Model> field_one field_two field_three
```
