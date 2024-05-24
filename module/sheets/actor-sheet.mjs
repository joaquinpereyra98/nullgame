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
  async getData() {
    const context = super.getData();
    const actorData = context.data;
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.state = this.accordionState;
    context.biographyHTML = await TextEditor.enrichHTML(
      actorData.system.biography,
      { async: true }
    );
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareEffects(context);
    }
    context.rollData = context.actor.getRollData();
    context.isGM = game.user.isGM;
    return context;
  }

  /**
   * Organize and classify Active Effects for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareEffects(context) {
    const categories = {
      active: {
        type: "active",
        label: game.i18n.localize("NULL_GAME.Effect.Active"),
        effects: [],
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("NULL_GAME.Effect.Inactive"),
        effects: [],
      },
    };
    const globalEffects =  {
      type: "global",
      effects: []
    }

    for (let e of this.actor.allApplicableEffects()) {
      if (e.isGlobal) {
        globalEffects.effects.push(e);
      } else {
        categories[e.disabled ? "inactive" : "active"].effects.push(e);
      }
    }

    context.effects = categories;
    context.globalEffects = globalEffects;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare
   * @return {undefined}
   */
  _prepareItems(context) {
    const skills = [];
    const features = {};
    const cf = context.system.categories.features;
    for (let k in cf) {
      features[k] = {
        label: cf[k],
        items: [],
      };
    }

    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === "skill") {
        skills.push(i);
      } else if (i.type === "feature") {
        if (features[i.system.category]) {
          features[i.system.category].items.push(i);
        } else {
          features.uncategorized.items.push(i);
          this.actor.items
            .get(i._id)
            .update({ "system.category": "uncategorized" });
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
  async _onCategoryCreate(event, categoryName = game.i18n.format("DOCUMENT.New", {type: "Category"})) {
    //TODO localize
    event.preventDefault();
    const featCategories = this.actor.system.categories.features;

    let countKey = 0;
    let finalCategoryKey = "category";
    while (featCategories[finalCategoryKey]) {
      countKey++;
      finalCategoryKey = `category${countKey}`;
    }
    let countName = 0;
    let finalCategoryName = categoryName;
    while (Object.values(featCategories).includes(finalCategoryName)) {
      countName++;
      finalCategoryName = `${categoryName} (${countName})`;
    }
    featCategories[finalCategoryKey] = finalCategoryName;
    featCategories["uncategorized"] = "Uncategorized"; //TODO localize
    this.actor.update({ "system.categories.features": featCategories });
  }
  /**
   * Handle delete a feature Category.
   * @param {Event} event  The originating click event
   * @private
   */
  _onCategoryDelete(event) {
    event.preventDefault();
    const { category } = event.currentTarget.dataset;
    const categories = duplicate(this.actor.system.categories.features);
    categories[category] = "";
    this.actor.update({ [`system.categories.features`]: categories });
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
  /**
   * Roll the item associated with the event
   * @param {Event} ev - The click event.
   * @returns {Promise} - A promise that resolves to the result of the item roll.
   */
  async _onRollItem(ev) {
    const id = ev.currentTarget.dataset.id;
    const item = this.actor.items.get(id);
    if (item) {
      if (item.type === "feature") {
        let rsc, label;
        const { consumption } = item.system.details;
        if (consumption.rscType === "bars") {
          rsc = this.actor.system.bars[consumption.rsc];
          label = rsc.label;
          if (rsc.value >= consumption.qty) {
            this.actor.update({
              [`system.bars.${consumption.rsc}.value`]:
                this.actor.system.bars[consumption.rsc].value - consumption.qty,
            });
            return item.roll();
          }
        } else if (consumption.rscType === "items") {
          rsc = this.actor.items.get(consumption.rsc);
          label = rsc.name;
          if (rsc.system.quantity >= consumption.qty) {
            rsc.update({
              "system.quantity": rsc.system.quantity - consumption.qty,
            });
            return item.roll();
          }
        } else if(consumption.rscType === "effects"){
          const effect = this.actor.effects.get(consumption.rsc);
          if (effect.counter >= consumption.qty) {
            effect.counter-= consumption.qty;
            return item.roll();
          }
          
        } else {
          return item.roll();
        }
        const d = new Dialog({
          title: "No enoght Resource", //TODO localize
          content: `Currently does not have enough ${label} to use this feature`,
          buttons: {
            accept: {
              label: "Accept",
            },
          },
        });
        return d.render(true);
      } else if (item.type === "skill") {
        return item.roll();
      }
    }
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".create-category", this._onCategoryCreate.bind(this));
    html.on("click", ".delete-category", this._onCategoryDelete.bind(this));
    html.on("click", ".create-item", this._onItemCreate.bind(this));
    html.on("click", ".delete-item", (ev) => {
      const id = ev.currentTarget.dataset.id;
      const item = this.actor.items.get(id);
      item.delete();
    });
    html.on("click", ".item-edit", (ev) => {
      const id = ev.currentTarget.dataset.id;
      const item = this.actor.items.get(id);
      item.sheet.render(true);
    });
    html.on("click", ".accordion-headers", (ev) => {
      const img = $(ev.currentTarget).find(".accordion-icon");
      const key = ev.currentTarget.dataset.key;
      this.accordionState = this.accordionState || {};
      this.accordionState[key] = !this.accordionState[key];
      img.css("rotate", this.accordionState[key] ? "180deg" : "0deg");
      $(ev.currentTarget).next(".accordion-content").slideToggle(500);
    });
    html.on("click", ".roll-item", this._onRollItem.bind(this));
    html.on("click", ".effect-control", (ev) => {
      const data = ev.currentTarget.dataset;
      const effect = this.actor.effects.get(data.id);
      switch (data.action) {
        case 'create':
          return this.actor.createEmbeddedDocuments('ActiveEffect', [
            {
              name: game.i18n.format('DOCUMENT.New', {
                type: game.i18n.localize('DOCUMENT.ActiveEffect'),
              }),
              icon: 'icons/svg/aura.svg',
              origin: this.actor.uuid,
              'duration.rounds': undefined,
              disabled: data.type === 'inactive',
            },
          ]);
        case 'edit':
          return effect.sheet.render(true);
        case 'delete':
          return effect.delete();
        case 'toggle':
          return effect.update({ disabled: !effect.disabled });
      }
    });
    html.on("input", ".effect-counter-input", (ev) => {
      const data = ev.currentTarget.dataset;
      const effect = this.actor.effects.get(data.id);
      effect.counter = $(ev.currentTarget).val();
    })
  }
}
