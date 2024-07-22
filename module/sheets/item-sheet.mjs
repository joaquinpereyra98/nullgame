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
    context.featuresOptions =
      context.item.actor?.system.categories.features.map((c) => ({
        key: c.label,
        label: c.label,
      })) || [{ key: "Uncategorized", label: "Uncategorized" }];
    const itemData = context.data;
    if (context.item.actor) {
      context.actorSkils = context.item.actor.items.filter(
        (item) => item.type === "skill"
      );
      this._findResources(context);
    }
    context.rollData = this.item.getRollData();
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.descriptionHTML = await TextEditor.enrichHTML(
      itemData.system.descriptions.description,
      { async: true, secrets: this.item.isOwner }
    );
    context.gmNotesHTML = await TextEditor.enrichHTML(
      itemData.system.descriptions.gmNotes,
      { async: true, secrets: this.item.isOwner }
    );
    context.isGM = game.user.isGM;
    context.isExtend = this.accordionState;
    if (context.item.type === "feature") {
      this._prepareProperties(context);
    } else if (context.item.type === "skill") {
      this._prepareSkillParentChoices(context);
    }
    return context;
  }

  /* -------------------------------------------- */
  _findResources(context) {
    const actor = context.item.actor;
    context.consumableResources = {
      //TODO add label and localize
      bars: actor.system.bars,
      items: actor.items.filter((item) => item.system.isResource),
      effects: actor.effects,
    };
  }
  _prepareProperties(context) {
    const sys = context.system;
    const props = [];

    if (sys.isResource) props.push("Ammo");
    if (sys.details.attackType !== "none") props.push(sys.details.attackType);
    if (sys.details.target.type !== "") {
      let type = sys.details.target.type;
      type = type.capitalize();
      props.push(`${sys.details.target.value}sq ${type}`);
    }
    const { normal, long, units } = sys.details.range;
    if (normal || long) {
      const range = normal && long ? `${normal}/${long}` : normal || long;
      props.push(`Range (${range})${units}`);
    }
    if (sys.details.duration.value > 0) {
      props.push(`Duration: ${sys.details.duration.value} Rounds`);
    }
    const { rsc, rscType } = sys.details.consumption;
    if (rscType !== "") {
      let tag = "";
      if (rscType === "effects") {
        tag = context.consumableResources[rscType].get(rsc)?.name;
      } else if (rscType === "items") {
        tag = context.consumableResources[rscType][rsc]?.name;
      } else if (rscType === "bars") {
        tag = context.consumableResources[rscType][rsc]?.label;
      }
      props.push(`Use: ${sys.details.consumption.qty} ${tag}`);
    }
    this.item.setFlag("nullgame", "props", props);
    context.propierties = props;
  }
  _prepareSkillParentChoices(context) {
    //Set blank option
    const arrayChoices = [['null', '']];

    if (this.item.system.childrenSkills.size === 0) {
      //Look up the ids and names of the actor's skills.
      const itemList = this.item.actor?.itemTypes.skill
      .filter((i) => i._id !== this.item._id && !i.isChildrenSkill)
      .map((i) => [i._id, i.name])
      arrayChoices.push(...itemList);
    }
    context.parentSkillChoices = Object.fromEntries(arrayChoices);
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("click", ".accordion-headers", this._accordionFunction.bind(this));
    html.on("click", ".add-damage-formula", (ev) => {
      ev.preventDefault();
      const dmgArray = this.item.system.rollFormula.damagesFormulas;
      dmgArray.push({ formula: "", type: "" });
      this.item.update({ "system.rollFormula.damagesFormulas": dmgArray });
    });
    html.on("click", ".delete-damage-formula", (ev) => {
      ev.preventDefault();
      const dmgArray = this.item.system.rollFormula.damagesFormulas;
      dmgArray.splice(ev.currentTarget.dataset.key, 1)[0];
      this.item.update({ "system.rollFormula.damagesFormulas": dmgArray });
    });
    if (!this.isEditable) return;
  }
  _accordionFunction(ev) {
    ev.preventDefault();
    const element = ev.currentTarget.dataset.element;
    if (!this.accordionState) this.accordionState = {};
    const img = $(ev.currentTarget).find(".accordion-icon");
    img.css("rotate", this.accordionState[element] ? "0deg" : "180deg");
    $(ev.currentTarget).next(".accordion-content").slideToggle(500);
    this.accordionState[element] = !this.accordionState[element];
  }
  _getSubmitData(updateData = {}) {
    const data = super._getSubmitData(updateData);
    if(data["system.parentSkill"] === "null"){
      data["system.parentSkill"] = null
    }
    return data
  }
}
