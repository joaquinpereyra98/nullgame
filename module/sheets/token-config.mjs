export class NullGameTokenConfig extends TokenConfig {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "token-sheet", "nullgame"],
      template: "systems/nullgame/templates/scene/token-config.hbs",
    });
  }
  async getData(option = {}) {
    const doc = this.preview ?? this.document;
    const context = foundry.utils.deepClone(await super.getData());
    context.bar3 = doc.getBarAttribute?.("bar3");
    return context;
  }
}
