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
    default: AEDefault,
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
      this._updateObject();
    });
    html.on("click", ".edit-effect", async (ev) => {
      const efID = ev.currentTarget.dataset.id;
      const ef = this.#effectsData.find((ef) => ef.id === efID);
      const newData = await dialogEffect(ef);
      this.#effectsData = this.#effectsData.map((ef) =>
        ef.id === efID ? newData : ef
      );
      this._updateObject();
    });
    html.on("click", ".delete-effect", async (ev) => {
      const efID = ev.currentTarget.dataset.id;
      this.#effectsData = this.#effectsData.filter((el) => el.id !== efID);
      this._updateObject();
    });
    html.on("click", ".shit-button", (ev) => {
      this.#effectsData = AEDefault;
      this._updateObject();
    });
  }
  _updateObject(event, formData) {
    this.render();
    game.settings.set("nullgame", "AEGlobalConfig", this.#effectsData);
  }
}
async function dialogEffect(effectData) {
  const htmlContent = await renderTemplate(
    "systems/nullgame/templates/setting/dialog-active-effect.hbs",
    effectData
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
