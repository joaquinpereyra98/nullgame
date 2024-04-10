export default class NullGameFreatureData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
      const fields = foundry.data.fields;
      const requiredString = { required: true, blank: true };
      return {
        description: new fields.HTMLField({ required: true, blank: true }),
        details: new fields.SchemaField({
            target: new fields.StringField({...requiredString}),
            range: new fields.StringField({...requiredString}),
            duration: new fields.StringField({...requiredString}),
            actionType: new fields.StringField({...requiredString}),
            formula: new fields.StringField({...requiredString}),
        }),
        roll: new fields.SchemaField({
            diceNum: new fields.NumberField({nullable: false, integer: true, initial: 1, min: 1 }),
            diceSize: new fields.StringField({ initial: "d20" }),
            diceBonus: new fields.StringField({ blank: true })
        }),
        category: new fields.StringField({...requiredString})
      };
    }
  }