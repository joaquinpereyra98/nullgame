  /**
   * Extend the basic ItemSheet with some very simple modifications
   * @extends {ItemSheet}
   */
  export class NullGameItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['null-game', 'sheet', 'item'],
        width: 520,
        height: 480,
      });
    }
  
    /** @override */
    get template() {
      return `systems/nullgame/templates/item/item-${this.item.type}-sheet.hbs`;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      const context = super.getData();
      const itemData = context.data;
      context.rollData = this.item.getRollData();
      context.system = itemData.system;
      context.flags = itemData.flags;
      return context;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
      if (!this.isEditable) return;
    }
  }
  