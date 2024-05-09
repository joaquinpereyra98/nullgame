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
      const item = this;
  
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `[${item.type}] ${item.name}`; //TODO localize
      
      if (item.type === "skill") {
        const rollData = this.getRollData();
        const roll = new Roll("1d20 + @advancement.mod", rollData);
        const rollContainer = await roll.render();
        const rendererMsg = await renderTemplate(
          "systems/nullgame/templates/rolls/roll-template.hbs",
          {
            roll: rollContainer,
            description: this.system.descriptions.description,
          }
        );
        roll.toMessage({
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
          content: rendererMsg,
        })
        return roll;
      }
    }
  }
  