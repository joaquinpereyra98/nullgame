export default class NullGameSkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredString = { required: true, blank: true };
    const requiredNumber = { required: true, min: 0, initial: 0 };
    return {
      descriptions: new fields.SchemaField({
        description: new fields.HTMLField({ ...requiredString }),
        gmNotes: new fields.HTMLField({ ...requiredString }),
      }),
      isRolleable: new fields.BooleanField({ initial: false }),
      advancement: new fields.SchemaField({
        experience: new fields.NumberField({ ...requiredNumber, max: 106 }),
        mod: new fields.NumberField({ ...requiredNumber, max: 10 }),
        level: new fields.NumberField({ ...requiredNumber, max: 15 }),
      }),
      parentSkill: new fields.ForeignDocumentField(foundry.documents.BaseItem, {
        idOnly: true,
      }),
    };
  }
  prepareBaseData() {
    if (this.parent.isParentSkill) {
      this.parentSkill = null;
      this.calcExpParentSkill()
    }
    this.#calcLevel();
    
      if(this.parent.isChildrenSkill){
        this.parent.actor.items.get(this.parentSkill).system.calcExpParentSkill();
      }
  }
  get childrenSkills() {
    return (
      this.parent.isEmbedded
        ? this.parent.actor?.items.filter((i) => i.type === "skill")
        : game.items.filter((i) => i.type === "skill")
    )
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .reduce((collection, item) => {
        if (item.system.parentSkill === this.parent._id)
          collection.set(item.id, item);
        return collection;
      }, new foundry.utils.Collection());
  }
  calcExpParentSkill(){
    const total = this.childrenSkills?.reduce((sum, item) => sum + item.system.advancement.level, 0);
    this.advancement.experience =  total ?? 0;
    this.#calcLevel();
  }
  #calcLevel() {
    const exp = this.advancement.experience;
    this.advancement.level = Math.floor(Math.sqrt(2 * exp - 1.75) + 0.5);
    this.#calcMod();
  }
  #calcMod() {
    const level = this.advancement.level;
    this.advancement.mod =
    level >= 15
      ? 10
      : level >= 13
      ? 8
      : level >= 10
      ? 6
      : level >= 8
      ? 4
      : level >= 5
      ? 3
      : level >= 3
      ? 2
      : level >= 1
      ? 1
      : 0;
  }
}
