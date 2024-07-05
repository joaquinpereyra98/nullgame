export default class NullGameSkillData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
      const fields = foundry.data.fields;
      const requiredString = { required: true, blank: true };
      const requiredNumber = { required: true, min: 0, initial: 0 };
      return {
        descriptions: new fields.SchemaField({
          description: new fields.HTMLField({...requiredString}),
          gmNotes: new fields.HTMLField({...requiredString})
        }),
        isRolleable: new fields.BooleanField({ initial: false}),
        advancement: new fields.SchemaField({
            experience: new fields.NumberField({...requiredNumber, max: 75}),
            mod: new fields.NumberField({...requiredNumber, max: 10}),
            level: new fields.NumberField({...requiredNumber, max:15})
        })
      };
    }
    prepareBaseData(){
      let exp= this.advancement.experience;
      this.advancement.level = Math.floor(exp / 5);
      this.advancement.mod = exp >= 75 ? 10 : exp >= 65 ? 8 : exp >= 50 ? 6 : exp>= 40 ? 4 : exp >= 25 ? 3 : exp >= 15 ? 2 : exp >= 5 ? 1 : 0;
    }
  }