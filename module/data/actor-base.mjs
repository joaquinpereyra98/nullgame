export default class NullGameActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredStringer = { required: true, blank: true };
    return {
      bars: new fields.SchemaField({
        firstBar: new fields.SchemaField({
          label: new fields.StringField({ ...requiredStringer }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        }),
        secondBar: new fields.SchemaField({
          label: new fields.StringField({ ...requiredStringer }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        }),
        thirdBar: new fields.SchemaField({
          label: new fields.StringField({ ...requiredStringer }),
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
          max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
        }),
      }),
      biography: new fields.HTMLField(...requiredStringer),
      textBoxs: new fields.SchemaField({
        firstTextBox: new fields.StringField({ ...requiredStringer }),
        secondTextBox: new fields.StringField({ ...requiredStringer }),
        thirdTextBox: new fields.StringField({ ...requiredStringer }),
      }),
      level: new fields.NumberField({...requiredStringer, min: 0}),
      size: new fields.StringField({...requiredStringer})
    };
  }
}