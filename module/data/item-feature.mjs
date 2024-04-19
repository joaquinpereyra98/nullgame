export default class NullGameFeatureData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
      const fields = foundry.data.fields;
      const requiredString = { required: true, blank: true };
      const requiredNumber = { required: true, min: 0 };
      return {
        descriptions: new fields.SchemaField({
          description: new fields.HTMLField({...requiredString}),
        }),
        details: new fields.SchemaField({
          duration: new fields.SchemaField({
            value: new fields.NumberField({...requiredNumber}),
            units: new fields.StringField({...requiredString})
          }),
          range: new foundry.data.fields.SchemaField({
            min: new foundry.data.fields.NumberField({...requiredNumber}),
            max: new foundry.data.fields.NumberField({...requiredNumber}),
            units: new foundry.data.fields.StringField({...requiredString})
          }),
          target: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.StringField({...requiredString}),
            type: new foundry.data.fields.StringField({...requiredString}),
          }),
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
    prepareBaseData() {
      if(this.category===""){
        this.category= 'uncategorized';
      }
    }
  }