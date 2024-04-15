/**
 * An Actor sheet for player character type actors.
 * @extends {ActorSheet}
 */
export class NullGameActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["null-game", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/nullgame/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    const context = super.getData();
    const actorData = context.data;
    context.system = actorData.system;
    context.flags = actorData.flags;
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }
    context.rollData = context.actor.getRollData();
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {}

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare
   * @return {undefined}
   */
  _prepareItems(context) {
    const skills = [];
    const features = {};
    const catFeats = context.system.categories.features;
    for(let k in catFeats){
      features[k]= {
        label: catFeats[k],
        items:[],
      }
    }
 
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'item') {
        skills.push(i);
      }
      else if (i.type === 'feature') {
        if(features[i.system.category]){
        features[i.system.category].items.push(i);
      }else{
          features.uncategorized.items.push(i);
          this.actor.items.get(i._id).update({"system.category": "uncategorized"});
        }
      }
    }
    context.skills = skills;
    context.features = features;
  }

  /* -------------------------------------------- */
  /**
   * Handle creating a new Feature Category.
   * @param {Event} event   The originating click event
   * @param {string} categoryName The name of the new category
   * @private
   */
  async _onCategoryCreate(event, categoryName = "New Category") { //TODO localize
    event.preventDefault();
    const featCategories = this.actor.system.categories.features;

    let countKey = 0;
    let finalCategoryKey = 'category';
    while (featCategories[finalCategoryKey]) {
    countKey++;
    finalCategoryKey = `category${countKey}`;
  }
  let countName = 0;
  let finalCategoryName = categoryName;
  while(Object.values(featCategories).includes(finalCategoryName)){
    countName++;
    finalCategoryName= `${categoryName} (${countName})`;
  }
    featCategories[finalCategoryKey]=finalCategoryName;
    featCategories['uncategorized']='Uncategorized'; //TODO localize
    this.actor.update({"system.categories.features": featCategories});
  }
  /**
   * Handle delete a feature Category.
   * @param {Event} event  The originating click event
   * @private
   */
   _onCategoryDelete(event) {
    event.preventDefault();
    const key = event.currentTarget.dataset.category;
    const type = event.currentTarget.dataset.type;
    const categories = duplicate(this.actor.system.categories[type])
    categories[key]='';
    this.actor.update({"system.categories.features": categories});
  }
  /**
   * Handle creating a new Item of Actor.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    
    const type = event.currentTarget.dataset.type;
    const data = { ...event.currentTarget.dataset };
    const name = `New ${type.capitalize()}`; //TODO localize
    const itemData = { name, type, system: { ...data } };
    delete itemData.system.type;
    return await Item.create(itemData, { parent: this.actor });
    
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".create-category", this._onCategoryCreate.bind(this));
    html.on("click", ".delete-category", this._onCategoryDelete.bind(this));
    html.on("click", ".create-item", this._onItemCreate.bind(this));
    html.on("click", ".delete-item", (ev)=>{
      const id = ev.currentTarget.dataset.id;
      const item = this.actor.items.get(id);
      item.delete();
    });
    html.on("click", ".item-edit", (ev) => {
      const id = ev.currentTarget.dataset.id;
      const item = this.actor.items.get(id);
      item.sheet.render(true);
    })
  }
}
