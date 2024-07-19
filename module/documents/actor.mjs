/**
 * Extend the base Actor document game.nullgame
 * @extends {Actor}
 */
export class NullGameActor extends Actor {
  /** @override */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.nullgame || {};
  }
  /** @override */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
    this.prepareFeaturesCategories();
  }
  prepareFeaturesCategories(){
    const itemFeatures = this.itemTypes.feature;
    const categories = this.system.categories.features;
    categories.forEach(category => {
      category.items = category.items.filter(i => itemFeatures.includes(i))
      category.items.push(...itemFeatures.filter(i => i.system.category === category.label && !category.items.includes(i)));
    })
    const categoriesLabels = categories.map(c => (c.label))
    categories[0].items.push(...itemFeatures.filter(i => !categoriesLabels.includes(i.system.category)))
  }
  /** @override */
  getRollData() {
    return { ...super.getRollData(), ...(this.system.getRollData?.() ?? null) };
  }
  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);

    const globalEffectsData = game.settings
      .get("nullgame", "AEGlobalConfig")
      .map((e) => ({
        name: game.i18n.localize(e.name),
        disabled: true,
        statuses: [e.id],
        icon: e.icon,
        origin: "Global Effect",
        "duration.rounds": undefined,
        flags: { nullgame: { global: e.id } },
        description: e.description,
      }));

    const effects = [
      ...this.effects.map((e) => e.toObject()),
      ...globalEffectsData,
    ];
    this.updateSource({ effects, prototypeToken: { actorLink: true } });
  }
  async _preUpdate(changed, options, user) {
    const size = changed.system?.size;
    if (size > 0) {
      changed["prototypeToken"] = {
        height: changed.system.size,
        width: changed.system.size,
      };
      const tokens = this.getActiveTokens(false, true);
      tokens?.forEach(
        async (t) => await t.update({ height: size, width: size })
      );
    }
    return super._preUpdate(changed, options, user);
  }
}
