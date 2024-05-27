export class NullGameTokenDocument extends TokenDocument {
  static defineSchema() {
    const parentSchema = super.defineSchema();
    return Object.assign({}, parentSchema, {
      bar3: new foundry.data.fields.SchemaField({
        attribute: new foundry.data.fields.StringField({
          required: true,
          nullable: true,
          blank: false,
          initial: null,
        }),
      }),
    });
  }
  getBarAttribute(barName, { alternative } = {}) {
    if (barName === "bar3") {
      this[barName] = foundry.utils.getProperty(this, "flags.nullgame.bar3")
        ? this.getFlag("nullgame", "bar3")
        : {};
    }
    const attribute = alternative || this[barName]?.attribute;
    if (!attribute || !this.actor) return null;
    const system = this.actor.system;
    const isSystemDataModel = system instanceof foundry.abstract.DataModel;
    const templateModel = game.model.Actor[this.actor.type];

    // Get the current attribute value
    const data = foundry.utils.getProperty(system, attribute);
    if (data === null || data === undefined) return null;

    // Single values
    if (Number.isNumeric(data)) {
      let editable = foundry.utils.hasProperty(templateModel, attribute);
      if (isSystemDataModel) {
        const field = system.schema.getField(attribute);
        if (field) editable = field instanceof foundry.data.fields.NumberField;
      }
      return { type: "value", attribute, value: Number(data), editable };
    }

    // Attribute objects
    else if ("value" in data && "max" in data) {
      let editable = foundry.utils.hasProperty(
        templateModel,
        `${attribute}.value`
      );
      if (isSystemDataModel) {
        const field = system.schema.getField(`${attribute}.value`);
        if (field) editable = field instanceof foundry.data.fields.NumberField;
      }
      return {
        type: "bar",
        attribute,
        value: parseInt(data.value || 0),
        max: parseInt(data.max || 0),
        editable,
      };
    }

    // Otherwise null
    return null;
  }
  async _preUpdate(changed, options, user) {
    if (foundry.utils.hasProperty(changed, "bar3")) {
      this.setFlag("nullgame", "bar3", changed.bar3);
    }
    return super._preUpdate(changed, options, user);
  }
}
