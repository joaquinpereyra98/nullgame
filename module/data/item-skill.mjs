export default class NullGameSkillData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
      const fields = foundry.data.fields;
      const requiredString = { required: true, blank: true };
      const requiredNumber = { required: true, min: 0, initial: 0 };
      return {
        descriptions: new fields.SchemaField({
          description: new fields.HTMLField({...requiredString}),
        }),
        isRolleable: new fields.BooleanField({ initial: false}),
        advancement: new fields.SchemaField({
            experience: new fields.NumberField({...requiredNumber}),
            mod: new fields.NumberField({...requiredNumber}),
            level: new fields.NumberField({...requiredNumber})
        })
      };
    }
    prepareBaseData(){
      this.advancement.level = Math.floor(this.advancement.experience / 5);
    }
  }