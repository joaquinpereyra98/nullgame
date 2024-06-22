export class EffectTooltipHUD extends BasePlaceableHUD {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "effect-tooltip-hover",
      classes: [
        ...super.defaultOptions.classes,
        "effect-tooltip-hover"
      ],
      minimizable: false,
      resizable: false,
      template: "systems/nullgame/templates/scene/effect-tooltip-hud.hbs",
    });
  }
  async getData() {
    const data = await super.getData();
    const actorId = this.object.document.actorId;
    if (actorId) {
      const actor = game.actors.get(actorId);
      if (actor) {
        data.effects = actor.appliedEffects.map(({ name, description }) => ({ name, description }));
      }
    }
    return data;
  }
  
  setPosition() {
    if (!this.object) {
      return;
    }
    const fontSize = 12;
    const maxWidth = 150;

    const x = this.object.center ? this.object.center.x : this.object.x;
    const y = this.object.center ? this.object.center.y : this.object.y;

    const width = this.object.w;
    const height = this.object.h;
    const test = this.object.hasActiveHUD ? 70 : 10;
    const left = x + width / 2 + test
    const top = y - height / 2;

    const position = {
      width: `150px`,
      left: `${left}px`,
      top: `${top}px`,
      "font-size": `${fontSize}`,
      "max-width": `${maxWidth}px`,
    };
    this.element.css(position);
  }
}
