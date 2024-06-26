const AEDefault = [
  {
    id: "dead",
    name: "EFFECT.StatusDead",
    icon: "icons/svg/skull.svg",
    description: "",
  },
  {
    id: "invisible",
    name: "EFFECT.StatusInvisible",
    icon: "icons/svg/invisible.svg",
    description: "",
  },
  {
    id: "blind",
    name: "EFFECT.StatusBlind",
    icon: "icons/svg/blind.svg",
    description:
      "For every stack, reduce the roll of your next attack by 1, then remove all stacks",
  },
];
export function registerSystemSettings() {
  game.settings.registerMenu("nullgame", "AEGlobalConfig", {
    name: "Setting Global Active Effect",
    label: "Global Active Effect",
    hint: "Create, modify or delete Global Active Effects", //TODO localize
    icon: "fa-solid fa-list",
    type: AEGlobal,
    restricted: true,
  });
  game.settings.register("nullgame", "AEGlobalConfig", {
    scope: "world",
    config: false,
    type: Array,
    default: AEDefault.map(ef=> ({...ef, name: game.i18n.localize(ef.name)})),
    onChange: (val) => {
      CONFIG.statusEffects = val;
      canvas.tokens.hud ?? render();
    },
  });
}

class AEGlobal extends FormApplication {
  constructor(object, options = {}) {
    super(object, options);
  }
  #effectsData = foundry.utils
    .deepClone(game.settings.get("nullgame", "AEGlobalConfig"))
    .map((e) => ({
      ...e,
      name: game.i18n.localize(e.name),
    }));

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: "Setting Global Active Effect",
      id: "global-active-effect-config",
      template:
        "systems/nullgame/templates/setting/global-active-effect-config.hbs",
      popOut: true,
      width: 600,
      height: "auto",
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
    });
  }
  getData() {
    const context = super.getData();
    context.effects = this.#effectsData;
    return context;
  }
  activateListeners(html) {
    html.on("click", ".create-effect", async (ev) => {
      const newEffectData = {
        id: "new-active-effect",
        name: "New Active Effect",
        icon: "icons/svg/aura.svg",
        description: "",
      };
      const ef = await dialogEffect(newEffectData);
      let newId = ef.id;
      let counter = 1;
      while (this.#effectsData.map((obj) => obj.id).includes(newId)) {
        newId = `${ef.id}-${counter++}`;
      }
      ef.id = newId;

      this.#effectsData.push(ef);
      for (let actor of game.actors) {
        actor.createEmbeddedDocuments("ActiveEffect", [
          {
            name: game.i18n.localize(ef.name),
            disabled: true,
            statuses: [ef.id],
            icon: ef.icon,
            origin: "Global Effect",
            "duration.rounds": undefined,
            flags: { nullgame: { global: ef.id } },
            description: ef.description,
          },
        ]);
      }
      this._updateObject();
    });
    html.on("click", ".edit-effect", async (ev) => {
      const efID = ev.currentTarget.dataset.id;
      const ef = this.#effectsData.find((ef) => ef.id === efID);
      const newData = await dialogEffect(ef);
      this.#effectsData = this.#effectsData.map((ef) =>
        ef.id === efID ? newData : ef
      );
      for (let actor of game.actors) {
        actor.effects
          .find((ef) => ef.getFlag("nullgame", "global") === efID)
          ?.update({
            name: newData.name,
            statuses: [newData.id],
            icon: newData.icon,
            flags: { nullgame: { global: newData.id } },
            description: newData.description,
          });
      }
      this._updateObject();
    });
    html.on("click", ".delete-effect", async (ev) => {
      const efID = ev.currentTarget.dataset.id;
      this.#effectsData = this.#effectsData.filter((ef) => ef.id !== efID);
      for (let actor of game.actors) {
        actor.effects
          .find((ef) => ef.getFlag("nullgame", "global") === efID)
          ?.delete();
      }
      this._updateObject();
    });
    html.on("click", ".reset-button", async (ev) => {

      await Dialog.confirm({
        title: "Reset Active Effect Global",
        content: "Are you sure you want to restore default values? This action cannot be undone.",
        yes: (html) =>{
          const globalEffectsData = AEDefault.map((e) => ({
            name: game.i18n.localize(e.name),
            disabled: true,
            statuses: [e.id],
            icon: e.icon,
            origin: "Global Effect",
            "duration.rounds": undefined,
            flags: { nullgame: { global: e.id } },
            description: e.description
          }));
          game.actors.forEach(actor=> { 
            const ids = actor.effects.filter(ef => ef.isGlobal).map(ef=>ef._id)
            actor.deleteEmbeddedDocuments('ActiveEffect', ids)
            actor.createEmbeddedDocuments('ActiveEffect', globalEffectsData)
          })
          this.#effectsData = AEDefault.map(ef=> ({...ef, name: game.i18n.localize(ef.name)}));
          this._updateObject();
        },
        no: (html) => {},
        defaultYes: false,
      })   
    });
  }
  _updateObject(event, formData) {
    game.settings.set("nullgame", "AEGlobalConfig", this.#effectsData);
    this.render();
  }
}
async function dialogEffect(effectData) {
  const htmlContent = await renderTemplate(
    "systems/nullgame/templates/setting/dialog-active-effect.hbs",
    {...effectData}
  );

  return new Promise((resolve, reject) => {
    const dialog = new Dialog({
      title: "Configure Global Active Effect",
      content: htmlContent,
      buttons: {
        submit: {
          label: "Save",
          icon: '<i class="fa-solid fa-floppy-disk"></i>',
          callback: (html) => {
            const formData = new FormDataExtended(
              html[0].querySelector("form"),
              { disabled: true }
            ).object;
            try {
              const requiredFields = ["name", "id", "icon"];
              for (const field of requiredFields) {
                if (!formData?.[field]) {
                  throw new Error(
                    `${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    } is required`
                  );
                }
              }
              formData.id = formData.id.toLowerCase().replace(/\s+/g, "");
              formData.description = "";
              resolve(formData);
            } catch (error) {
              ui.notifications.error(error.message);
              reject(error);
            }
          },
        },
        cancel: {
          label: "Cancel",
        },
      },
      render: (html) => {
        html.on("click", ".img-input", (event) => {
          event.preventDefault();
          const fp = new FilePicker({
            type: "image",
            current: effectData.icon,
            callback: (path) => {
              $(event.currentTarget).find("img").attr("src", path);
              $(event.currentTarget).find("input").attr("value", path);
            },
          });
          return fp.browse();
        });
      },
    });

    dialog.render(true);
  });
}
