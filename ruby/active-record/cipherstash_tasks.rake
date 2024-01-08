require "active_record"
require "logger"

# To migrate and encrypt plaintext data to encrypted columns:
# - Copy this file to lib/tasks
# - Run rake cipherstash:migrate[Model Name]
#
# e.g to migrate data in the Users model
#
# bash => rake cipherstash:migrate[Users]
# zsh => rake cipherstash:migrate\[Users\]

namespace :cipherstash do
  desc "Re-saves a model to migrate it when its config is set to plaintext-duplicate or encrypted-duplicate."
  task :migrate, [:model_name, :batch_size] => "db:load_config" do |_task, args|
    logger = Logger.new(STDOUT)

    config = ActiveRecord::Base.connection_db_config

    model_name = args[:model_name]
    batch_size = args[:batch_size] || 1000

    if model_name.nil?
      abort "Please provide a model name, eg. rake cipherstash:migrate[User]"
    end
    model = Object.const_get(model_name) # raises NameError on failure

    unless model < ActiveRecord::Base
      abort "Not an ActiveRecord model: #{model_name}"
    end

    logger.info "Migrating #{model_name} in batches of #{batch_size}."

    primary_keys = Array(model.primary_key)
    model.find_each(:batch_size => batch_size) do |record|
      id_info = primary_keys.map { |key| record.public_send(key) }.join(", ")
      logger.info "Processing record with ID #{id_info} ..."

      record.update_columns(
        record.attributes.filter { |attr| !attr.starts_with?("__") }
      )
    end

    logger.info "Done."
  end
end
