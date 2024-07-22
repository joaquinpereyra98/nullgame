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
      dragDrop: [{ dragSelector: ".item-list-component", dropSelector: null }],
    });
  }

  /** @override */
  get template() {
    return `systems/nullgame/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  _onDragStart(event) {
    super._onDragStart(event);
    const li = event.currentTarget;
    let dragData;
    if (li.dataset.itemId) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }
    if (li.dataset.effectid) {
      const effect = this.actor.effects.get(li.dataset.effectid);
      dragData = effect.toDragData();
    }
    if (!dragData) return;
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
  /** @override */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) {
      const drop = event.target.closest("[data-drop]")?.dataset?.drop;
      if (drop === "item") return this._onSortItem(event, itemData);
      else if (drop === "category")
        return this._onChangeCategoryItem(event, itemData);
      return;
    }

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }
  /** @override */
  _onSortItem(event, itemData) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const source = items.get(itemData._id);
    const dropTarget = event.target.closest("[data-item-id]");
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself or different types items
    if (source.id === target.id || source.type !== target.type) return;

    if (source.type === "feature") {
      const featuresCategories = this.actor.system.categories.features;
      const sourceCategory = featuresCategories.find(
        (c) => c.label === source.system.category
      );
      const targetCategory = featuresCategories.find(
        (c) => c.label === target.system.category
      );

      // Perform the sort
      const sortUpdates = SortingHelpers.performIntegerSort(source, {
        target,
        siblings: targetCategory.items,
      });
      const updateData = sortUpdates.map((u) => {
        const update = u.update;
        update._id = u.target._id;
        return update;
      });
      if (sourceCategory !== targetCategory) {
        updateData.find((i) => i._id === source._id).system = {
          category: targetCategory.label,
        };
      }
      // Perform the update
      return this.actor.updateEmbeddedDocuments("Item", updateData);
    } else if (source.type === "skill") {
      const createSortUpdates = (target, siblings) => {
        const sortUpdates = SortingHelpers.performIntegerSort(source, {
          target,
          siblings,
        });
        return sortUpdates.map((u) => ({ ...u.update, _id: u.target._id }));
      };

      let updateData;

      if (source.isChildrenSkill) {
        if (target.system.parentSkill === source.system.parentSkill) {
          const siblings = items.get(target.system.parentSkill).system
            .childrenSkills.contents;
          updateData = createSortUpdates(target, siblings);
        } else {
          updateData = [{ _id: source._id, "system.parentSkill": null }];
        }
      } else if (source.isParentSkill) {
        if (target.isChildrenSkill) {
          const parentTarget = items.get(target.system.parentSkill);
          updateData = createSortUpdates(
            parentTarget,
            items.filter((i) => !i.isChildrenSkill)
          );
        } else {
          updateData = createSortUpdates(
            target,
            items.filter((i) => !i.isChildrenSkill)
          );
        }
      } else {
        if (target.isChildrenSkill) {
          updateData = [
            {
              _id: source._id,
              "system.parentSkill": target.system.parentSkill,
            },
          ];
        } else {
          updateData = createSortUpdates(
            target,
            items.filter((i) => !i.isChildrenSkill)
          );
        }
      }

      return this.actor.updateEmbeddedDocuments("Item", updateData);
    }
    return;
  }
  /**
   * Handle a drop event for an existing embedded Item to move to another category
   * @param {Event} event
   * @param {Object} itemData
   * @private
   */
  _onChangeCategoryItem(event, itemData) {
    const items = this.actor.items;
    const source = items.get(itemData._id);
    const { category } = event.target.closest("[data-category]").dataset;

    if (source.system.category === category) return;
    const targetCategory = this.actor.system.categories.features.find(
      (c) => c.label === category
    );
    const sort = targetCategory.items[0]?.sort ?? 1;
    return source.update({ "system.category": category, sort: sort - 1 });
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
    context.gmNoteHTML = await TextEditor.enrichHTML(actorData.system.gmNotes, {
      async: true,
    });
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareEffects(context);
    } else if (actorData.type == "npc") {
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
    const globalEffects = {
      type: "global",
      effects: [],
    };

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
    const { skill } = this.actor.itemTypes;

    context.skills = skill
      .filter((i) => !i.isChildrenSkill)
      .sort((a, b) => a.sort - b.sort);
    context.features = this.actor.system.categories.features;
  }

  /* -------------------------------------------- */
  /**
   * Handle creating a new Feature Category.
   * @param {Event} event   The originating click event
   * @param {string} categoryName The name of the new category
   * @private
   */
  async _onCategoryCreate(
    event,
    categoryName = game.i18n.format("DOCUMENT.New", { type: "Category" })
  ) {
    event.preventDefault();
    let countName = 0;
    let finalCategoryName = categoryName;
    const categoriesLabel = this.actor.system.categories.features.map(
      (i) => i.label
    );
    while (categoriesLabel.includes(finalCategoryName)) {
      countName++;
      finalCategoryName = `${categoryName} (${countName})`;
    }
    this.actor.update({
      "system.categories.features": [
        ...this.actor.system.categories.features,
        { label: finalCategoryName, items: [] },
      ],
    });
  }
  /**
   * Handle delete a feature Category.
   * @param {Event} event  The originating click event
   * @private
   */
  _onCategoryDelete(event) {
    event.preventDefault();
    const categoryLabel = event.currentTarget.dataset.category;
    const newArray = this.actor.system.categories.features.filter(
      (c) => c.label !== categoryLabel
    );
    this.actor.update({ "system.categories.features": newArray });
  }
  /**
   * Handle for change a feature Category name.
   * @param {Event} event  The originating click event
   * @private
   */
  _onChangeCategoryName(event) {
    event.preventDefault();
    const newLabel = event.currentTarget.value;
    const featureKey = event.currentTarget.dataset.key;
    const newArray = this.actor.system.categories.features;
    let countName = 0;
    let finalCategoryName = newLabel;
    const categoriesLabel = newArray.map((i) => i.label);
    while (categoriesLabel.includes(finalCategoryName)) {
      countName++;
      finalCategoryName = `${newLabel} (${countName})`;
    }
    newArray[featureKey].label = finalCategoryName;
    const itemsUpdate = newArray[featureKey].items.map((i) => ({
      _id: i._id,
      "system.category": finalCategoryName,
    }));
    this.actor.update({
      "system.categories.features": newArray,
      items: itemsUpdate,
    });
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
   * Handle Delete a Item of Actor.
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemDelete(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const id = event.currentTarget.dataset.id;
    const item = this.actor.items.get(id);
    if (!event.shiftKey) {
      Dialog.confirm({
        title: `Delete ${item.type.capitalize()}`,
        content: `Are you sure you want to remove ${item.name}`,
        yes: (html) => {
          item.delete();
        },
        no: (html) => {},
      });
    } else {
      item.delete();
    }
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
        } else if (consumption.rscType === "effects") {
          const effect = this.actor.effects.get(consumption.rsc);
          if (effect.counter >= consumption.qty) {
            effect.counter -= consumption.qty;
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
    html.on("click", ".delete-item", this._onItemDelete.bind(this));
    html.on("click", ".item-edit", (ev) => {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      const id = ev.currentTarget.dataset.id;
      const item = this.actor.items.get(id);
      item.sheet.render(true);
    });
    html.on("click", ".accordion-headers", (ev) => {
      const img = $(ev.currentTarget).find(".accordion-icon");
      const key = ev.currentTarget.dataset.itemId;
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
        case "create":
          return this.actor.createEmbeddedDocuments("ActiveEffect", [
            {
              name: game.i18n.format("DOCUMENT.New", {
                type: game.i18n.localize("DOCUMENT.ActiveEffect"),
              }),
              icon: "icons/svg/aura.svg",
              origin: this.actor.uuid,
              "duration.rounds": undefined,
              disabled: data.type === "inactive",
            },
          ]);
        case "edit":
          return effect.sheet.render(true);
        case "delete":
          Dialog.confirm({
            title: `Delete Active Effect`,
            content: `Are you sure you want to remove ${effect.name}`,
            yes: (html) => {
              effect.delete();
            },
            no: (html) => {},
          });
          return;
        case "toggle":
          return effect.update({ disabled: !effect.disabled });
      }
    });
    html.on("change", ".effect-counter-input", (ev) => {
      const data = ev.currentTarget.dataset;
      const effect = this.actor.effects.get(data.id);
      effect.counter = $(ev.currentTarget).val();
    });
    html.on(
      "change",
      ".category-name-input",
      this._onChangeCategoryName.bind(this)
    );
  }
}
