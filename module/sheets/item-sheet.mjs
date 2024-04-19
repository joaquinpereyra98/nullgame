/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class NullGameItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["null-game", "sheet", "item"],
      width: 620,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/nullgame/templates/item/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */
  /** @override */
  async getData() {
    const context = super.getData();
    context.features = context.item.actor?.system.categories.features || {
      uncategorized: "Uncategorized",
    };
    const itemData = context.data;
    context.rollData = this.item.getRollData();
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.descriptionHTML = await TextEditor.enrichHTML(
      itemData.system.descriptions.description,
      { async: true, secrets: this.item.isOwner }
    );
    context.isExtend = this.accordionState;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
     html.on("click", ".accordion-headers", (ev) => {
        const img = $(ev.currentTarget).find('.icon-img');
        const imgPath = 'systems/nullgame/assets/expand_'
        if(this.accordionState){
          img.css({"rotate": "0deg"});
        } else{
          img.css({"rotate": "180deg"});
        }
       $(ev.currentTarget).next(".accordion-content").slideToggle(500);
       this.accordionState = !this.accordionState;
       
     });
    if (!this.isEditable) return;
  }
}
