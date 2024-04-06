export default class NullGameFreatureData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
      const fields = foundry.data.fields;
      const requiredStringer = { required: true, blank: true };
      return {
        description: new fields.HTMLField({ required: true, blank: true }),
        details: new fields.SchemaField({
            target: new fields.StringField({...requiredStringer}),
            range: new fields.StringField({...requiredStringer}),
            duration: new fields.StringField({...requiredStringer}),
            actionType: new fields.StringField({...requiredStringer}),
            formula: new fields.StringField({...requiredStringer}),
        })
      };
    }
  }