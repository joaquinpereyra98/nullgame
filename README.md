# Null Game System

![Foundry v11](https://img.shields.io/badge/foundry-v11-green)

## Actors
### Header
The header elements of the actors are as follows:

![Image](https://github.com/user-attachments/assets/a9e5e5b7-0882-4aa0-8611-c688a1d33428)

1 - **Profile Image**

2 - **Character Name**

3 - **Character Level**

4 - **Character Size**: The character's size affects the scale of the actor's token.

5 - **Text Fields**: Actors have three customizable text fields intended for adding tags to the actor.

6 - **Resource Bars**: Actors have three customizable resource bars whose names and values can be modified to better fit the needs of the game.

### Tabs
The character actor poseen 4 pestañas: Features, Effects, Skills and Biography. The NPC actores solo poseen 3: Features, Effects and Biography.

### Features
Features are items that can be classified into categories, which can be created and modified by the actor's owner. Additionally, this tab includes a drag-and-drop system, allowing for easy movement of features between categories.

![Image](https://github.com/user-attachments/assets/4b44f778-3934-4c3e-93ad-29a632a7046e)

1 - **Category Name**: Category names are text inputs and can be modified at any time.

2 - **Category Actions**: Each category has two buttons, one for creating items within the category and another for deleting the category. Deleting a category with existing items will move those items to the "Uncategorized" section.

3 - **Uncategorized Section**: This is a default section for all actors, where all features without a specific category are stored.

4 - **Uncategorized Section Actions**: Here, you will find buttons for creating new uncategorized items and for creating new categories.

### Effects
Active effects are located in this tab and are classified into two categories: Actor Active Effects and Global Effects, which are created from the world settings.

![Image](https://github.com/user-attachments/assets/6986e980-1b38-48e2-bd25-ac9007a1e9e2)

1 - **Active Actor Effects**: This section contains effects currently applied to the actor.

2 - **Inactive Actor Effects**: This section lists effects that are not currently applied to the actor.

3 - **Global Effects**: Here you will find all globally active effects created in the world settings. They can be activated or deactivated, and the GM has the ability to modify them. Global effects are shared among all actors in the world.

4 - **Stacks**: Active effects also have an additional attribute called "stack." This reflects multiple charges of an active effect.

### Skills
Skills are items that can either be rollable or act as modifiers. Additionally, skills can contain other skills, which affects their scaling. The scaling system falls outside the scope of this guide.

![Image](https://github.com/user-attachments/assets/be50cb50-a32c-453d-a187-0119a1738a7b)

1 - **Parent Skill**: A skill that contains other skills within it. If a parent skill is deleted, its sub-skills will become parent skills themselves.

2 - **Sub-Skills**: Skills that belong to a parent skill. Their "Star" attribute modifies the ticks of the parent skill.

3 - **Modifiers**: Skills provide a modifier that can be applied to certain rolls, or, if the skill is rollable, it can be rolled directly.

### Biography
The biography tab contains two text editors, one available to the actor's owner and another exclusively for the GM.

![Image](https://github.com/user-attachments/assets/a2401890-a460-44b7-857b-f3cd2171ae90)

1 - **Biography Editor**: Divided into two columns.

2 - **GM Notes**: Also divided into two columns, but hidden from regular users.
