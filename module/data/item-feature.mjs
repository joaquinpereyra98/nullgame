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
            normal: new foundry.data.fields.NumberField({...requiredNumber}),
            long: new foundry.data.fields.NumberField({...requiredNumber}),
            units: new foundry.data.fields.StringField({...requiredString})
          }),
          target: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({...requiredNumber, initial: 0}),
            type: new foundry.data.fields.StringField({...requiredString}),
          }),
          attackType: new fields.StringField({...requiredString}),
          consumption: new fields.SchemaField({
            qty: new fields.NumberField({...requiredNumber}),
            rsc: new fields.StringField({...requiredString}),
            rscType: new fields.StringField({...requiredString})
          })
        }),
        rollFormula: new fields.SchemaField({
          formula: new fields.StringField({blank: true}),
          damagesFormulas: new fields.ArrayField(new fields.ObjectField()),
          skillMod: new fields.StringField({requiredString})
        }),
        category: new fields.StringField({...requiredString}),
        isResource: new fields.BooleanField({inital: false}),
        quantity: new fields.NumberField({min:0, inital: 0})
      };
    }
    prepareBaseData() {
      if(this.category===""){
        this.category= 'uncategorized';
      }
      if(this.rollFormula.formula === "") {
        this.rollFormula.formula = null;
      }
    }
  }