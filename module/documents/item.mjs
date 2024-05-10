/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class NullGameItem extends Item {
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
      parts.push(this.system.rollFormula.formula ?? "1d20");
      dmgParts = this.system.rollFormula.damagesFormulas
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
  