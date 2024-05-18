export class NullGameActiveEffectConfig extends ActiveEffectConfig {
  static get defaultOptions() {
    const options = foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["sheet", "active-effect-sheet", "null-game"],
        width: 580,
        height: "auto",
        tabs: [
          { navSelector: ".tabs", contentSelector: "form", initial: "details" },
        ],
      });
    return options;
  }
  get template(){
    return "systems/nullgame/templates/activeEffect/active-effect-config.hbs";
  }
  async getData(options = {}) {
    const context = await super.getData(options);
    return context;
  }
  activateListeners(html){
    super.activateListeners(html);
    html.on('input', '.counter-input', (ev) => {
        this.document.counter = $(ev.currentTarget).val();
    });
  }
}
