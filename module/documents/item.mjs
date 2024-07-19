/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class NullGameItem extends Item {
  /**
   * Checks if Item has area of targat for create Template Measures on Roll.
   * @returns {boolean}
   */
  get hasAreaTarget() {
    const { type } = this.system.details?.target ?? {};
    return ["circle", "cone", "ray", "rect"].includes(type);
  }
  /**
   * Checks if Item has attack data for rollAttack.
   * @returns {boolean}
   */
  get hasAttack() {
    if(!this.type === 'feature') return false;
    const { attackType } = this.system.details;
    return attackType !== 'none';
  }
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    const rollData = { ...super.getRollData() };
    rollData.itemID = this._id;
    rollData.hasAreaTarget = this.hasAreaTarget;
    if (!this.actor) return rollData;
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const { actor } = this;
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${this.type}] ${this.name}`; //TODO localize
    const parts = [];
    let dmgParts = [];
    const rollData = deepClone(this.getRollData());

    if (this.type === "feature") {
      const { rollFormula } = this.system;
      parts.push(rollFormula.formula ?? "1d20");
      if (rollFormula.skillMod !== "") {
        const item = actor.items.get(rollFormula.skillMod);
        parts.push(`${item.system.advancement.mod}[${item.name} Skill]`); //TODO localize
      }
      dmgParts = rollFormula.damagesFormulas
        .filter((dmg) => dmg.formula !== "" || dmg.type !== "")
        .map((dmg) => `${dmg.formula}[${dmg.type}]`);
    } else if (this.type === "skill") {
      parts.push("1d20", "@advancement.mod");
    }

    const roll = new Roll(parts.join(" + "), rollData);
    const rendererMsg = await renderTemplate(
      "systems/nullgame/templates/rolls/roll-template.hbs",
      {
        rollsContent: await roll.render(),
        descriptionContent: this.system.descriptions.description,
        rollData,
        dmgFormula: dmgParts.join(" + "),
      }
    );
    roll.toMessage({
      speaker,
      rollMode,
      flavor: label,
      content: rendererMsg,
    });

    return roll;
  }
}
