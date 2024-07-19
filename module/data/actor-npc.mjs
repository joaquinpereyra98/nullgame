export default class NullGameNPCData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredStringer = { required: true, blank: true };
    return {
      bars: new fields.SchemaField({
        firstBar: new fields.SchemaField({
          label: new fields.StringField({ required: true, inital: "Bar 1" }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
        }),
        secondBar: new fields.SchemaField({
          label: new fields.StringField({ required: true, inital: "Bar 2" }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        }),
        thirdBar: new fields.SchemaField({
          label: new fields.StringField({ required: true, inital: "Bar 3" }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        }),
      }),
      biography: new fields.HTMLField({
        required: true,
        initial:
          '<div style="display: flex;"><div style="flex: 48%; padding-right: 10px; border-right: 2px groove rgb(238, 238, 238);"><p></p></div><div style="flex: 48%; padding-left: 10px;"><p></p></div> </div>',
      }),
      gmNotes: new fields.HTMLField({
        required: true,
        initial:
          '<div style="display: flex;"><div style="flex: 48%; padding-right: 10px; border-right: 2px groove rgb(238, 238, 238);"><p></p></div><div style="flex: 48%; padding-left: 10px;"><p></p></div> </div>',
      }),
      textBoxs: new fields.SchemaField({
        firstTextBox: new fields.StringField({ ...requiredStringer }),
        secondTextBox: new fields.StringField({ ...requiredStringer }),
        thirdTextBox: new fields.StringField({ ...requiredStringer }),
      }),
      level: new fields.NumberField({
        required: true,
        integer: true,
        min: 0,
        initial: 0,
      }),
      size: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
      categories: new fields.SchemaField({
        features: new fields.ArrayField(new fields.ObjectField(), {
          initial: [{ label: "Uncategorized", items: [] }],
        }),
      }),
    };
  }
  prepareBaseData() {
    this.categories.features.forEach((category) => {
      category.items = category.items.filter(
        (i) => i.system.category === category.label
      );
    });
  }
}
